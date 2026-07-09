import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { ConsultaService } from '../../servicios/consulta.service';
import {
  EspecieRegistro,
  Distribucion,
  FotoEspecie,
  PuntoDistribucion,
  EstructuraMorfologicaCampo,
} from '../../modelos/consulta.models';

// arbol → Árbol, hierba → Hierba, etc. (el backend los manda en minúscula/sin tilde)
const ETIQUETAS_HABITO: Record<string, string> = {
  arbol:   'Árbol',
  palmera: 'Palmera',
  arbusto: 'Arbusto',
  liana:   'Liana',
  hierba:  'Hierba',
};

// Traduce claves técnicas del morphological_data a nombres legibles.
const ETIQUETAS_CAMPO: Record<string, string> = {};

const OTRAS_CARACTERISTICAS = 'Otras características';

@Component({
  selector: 'app-ficha-tecnica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ficha-tecnica.html',
  styleUrl: './ficha-tecnica.css',
})
export class FichaTecnica implements OnInit, OnDestroy {
  especie = signal<EspecieRegistro | null>(null);
  distribucion = signal<Distribucion | null>(null);
  estructura = signal<EstructuraMorfologicaCampo[]>([]);
  cargando = signal(true);
  error = signal('');

  // Foto seleccionada en el visor
  fotoActiva = signal<FotoEspecie | null>(null);

  // Modal límite de descargas
  mostrarModalLimite = signal(false);

  // Estado de descarga por foto
  descargando = signal<Record<string, boolean>>({});

  // Acordeón de secciones morfológicas (por defecto TODAS abiertas)
  seccionesCerradas = signal<Record<string, boolean>>({});

  // ── Mapa Leaflet ──────────────────────────────────────────────────────────
  @ViewChild('mapaContainer') mapaContainer?: ElementRef<HTMLDivElement>;
  private mapa?: L.Map;
  private marcadores = new Map<string, L.Marker>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consulta: ConsultaService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ── Caracteres morfológicos agrupados por sección ─────────────────────────
  readonly seccionesMorfologicas = computed(() => {
    const data = this.especie()?.morphological_data ?? {};

    // Mapa field_name (minúsculas) → sección
    const mapaSeccion = new Map<string, string>();
    for (const c of this.estructura()) {
      mapaSeccion.set(c.field_name.toLowerCase(), (c.section || '').trim());
    }

    const grupos = new Map<string, { clave: string; etiqueta: string; valor: any }[]>();

    for (const [clave, valor] of Object.entries(data)) {
      if (valor === null || valor === undefined || valor === '') continue;
      if (Array.isArray(valor) && valor.length === 0) continue;

      const seccion = mapaSeccion.get(clave.toLowerCase()) || '';
      const nombreSeccion = seccion || OTRAS_CARACTERISTICAS;

      if (!grupos.has(nombreSeccion)) grupos.set(nombreSeccion, []);
      grupos.get(nombreSeccion)!.push({
        clave,
        etiqueta: this.etiquetaCampo(clave),
        valor,
      });
    }

    // "Otras características" siempre va al final
    const entradas = Array.from(grupos.entries()).map(([nombre, campos]) => ({ nombre, campos }));
    entradas.sort((a, b) => {
      if (a.nombre === OTRAS_CARACTERISTICAS) return 1;
      if (b.nombre === OTRAS_CARACTERISTICAS) return -1;
      return 0;
    });
    return entradas;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.cargarFicha(id);
  }

  ngOnDestroy() {
    this.destruirMapa();
  }

  cargarFicha(id: string) {
    this.cargando.set(true);
    this.consulta.getFicha(id).subscribe({
      next: (data) => {
        this.especie.set(data);
        this.fotoActiva.set(data.photos?.[0] ?? null);
        this.cargarEstructura(data.habit);
        this.cargarDistribucion(id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error.set('No se pudo cargar la ficha técnica.');
        this.cargando.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  // Estructura campo→sección. Si el endpoint aún no existe en el backend,
  // no rompe nada: los campos caen en "Otras características".
  cargarEstructura(habit?: string) {
    this.consulta.getEstructuraMorfologica(habit).subscribe({
      next: (data) => {
        this.estructura.set(data ?? []);
        this.cdr.detectChanges();
      },
      error: () => {
        this.estructura.set([]);
        this.cdr.detectChanges();
      },
    });
  }

  cargarDistribucion(id: string) {
    this.consulta.getDistribucion(id).subscribe({
      next: (data) => {
        this.distribucion.set(data);
        this.cargando.set(false);
        this.cdr.detectChanges();
        // Dibujar el mapa una vez que el @if renderizó el contenedor
        setTimeout(() => this.inicializarMapa(), 60);
      },
      error: () => {
        // La distribución es opcional, no bloquea la ficha
        this.cargando.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  // ── Mapa ──────────────────────────────────────────────────────────────────

  private inicializarMapa() {
    const dist = this.distribucion();
    if (!dist || dist.total_points === 0 || !this.mapaContainer) return;

    this.destruirMapa();

    // Icono por CDN para evitar problemas de rutas de assets con el bundler
    const iconoDefecto = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.mapa = L.map(this.mapaContainer.nativeElement, {
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(this.mapa);

    const coords: L.LatLngExpression[] = [];
    for (const p of dist.points) {
      const marcador = L.marker([p.latitude, p.longitude], { icon: iconoDefecto })
        .addTo(this.mapa)
        .bindPopup(
          `<b>${p.tracking_code}</b><br>${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`,
        );
      this.marcadores.set(p.id, marcador);
      coords.push([p.latitude, p.longitude]);
    }

    if (coords.length === 1) {
      this.mapa.setView(coords[0], 13);
    } else if (coords.length > 1) {
      this.mapa.fitBounds(L.latLngBounds(coords).pad(0.2));
    }

    // Leaflet a veces calcula mal el tamaño si el contenedor recién apareció
    setTimeout(() => this.mapa?.invalidateSize(), 120);
  }

  private destruirMapa() {
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = undefined;
    }
    this.marcadores.clear();
  }

  /** Desde la lista de registros: sube al mapa y resalta el punto. */
  verEnMapa(punto: PuntoDistribucion) {
    this.mapaContainer?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    const marcador = this.marcadores.get(punto.id);
    if (this.mapa && marcador) {
      this.mapa.setView([punto.latitude, punto.longitude], 15, { animate: true });
      marcador.openPopup();
    }
  }

  // ── Acordeón de secciones ─────────────────────────────────────────────────

  toggleSeccionMorf(nombre: string) {
    const actual = { ...this.seccionesCerradas() };
    actual[nombre] = !actual[nombre];
    this.seccionesCerradas.set(actual);
  }

  seccionAbierta(nombre: string): boolean {
    // Si no está en el mapa, se considera abierta (todas abiertas por defecto)
    return !this.seccionesCerradas()[nombre];
  }

  // ── Fotos ─────────────────────────────────────────────────────────────────

  seleccionarFoto(foto: FotoEspecie) {
    this.fotoActiva.set(foto);
  }

  descargarFoto(foto: FotoEspecie) {
    const especie = this.especie();
    if (!especie) return;

    this.descargando.set({ ...this.descargando(), [foto.id]: true });

    this.consulta.descargarFoto(especie.id, foto.id).subscribe({
      next: (response) => {
        const blob = response.body!;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${especie.scientific_name}_${foto.photo_type}.jpg`;
        a.click();
        URL.revokeObjectURL(url);

        this.descargando.set({ ...this.descargando(), [foto.id]: false });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.descargando.set({ ...this.descargando(), [foto.id]: false });
        if (err.status === 429) {
          this.mostrarModalLimite.set(true);
        }
        this.cdr.detectChanges();
      },
    });
  }

  cerrarModalLimite() {
    this.mostrarModalLimite.set(false);
  }

  volver() {
    this.router.navigate(['/consulta']);
  }

  // ── Helpers de presentación ───────────────────────────────────────────────

  /** arbol → Árbol. Fallback: capitaliza la primera letra. */
  etiquetaHabito(valor?: string): string {
    if (!valor) return '';
    const clave = valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    return ETIQUETAS_HABITO[clave] ?? this.capitalizar(valor);
  }

  /** Capitaliza la primera letra respetando el resto (para tipo de vida, etc.). */
  capitalizar(valor?: string): string {
    if (!valor) return '';
    return valor.charAt(0).toUpperCase() + valor.slice(1);
  }

  /** local_name → Nombre local. Fallback: reemplaza _ por espacio y capitaliza. */
  etiquetaCampo(clave: string): string {
    const key = clave.toLowerCase().trim();
    if (ETIQUETAS_CAMPO[key]) return ETIQUETAS_CAMPO[key];
    const humanizado = clave.replace(/_/g, ' ').trim();
    return humanizado.charAt(0).toUpperCase() + humanizado.slice(1);
  }

  formatearValor(valor: any): string {
    if (Array.isArray(valor)) return valor.join(', ');
    return String(valor);
  }

  nombreRegistrador(): string {
    const r = this.especie()?.registrar;
    if (!r) return 'Desconocido';
    return `${r.first_name} ${r.paternal_last_name} ${r.maternal_last_name}`.trim();
  }

  tipoFotoEtiqueta(tipo: string): string {
    const etiquetas: Record<string, string> = {
      hoja:            'Hoja',
      flor:            'Flor',
      fruto:           'Fruto',
      planta_completa: 'Planta completa',
      semilla:         'Semilla',
    };
    return etiquetas[tipo] ?? tipo;
  }
}