import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConsultaService } from '../../servicios/consulta.service';
import {
  FiltroMorfologico,
  EspecieRegistro,
  ResultadoBusqueda,
  FiltroSeleccionado,
} from '../../modelos/consulta.models';

type Paso = 'habito' | 'filtros' | 'resultados';

const HABITOS = [
  { valor: 'árbol',    etiqueta: 'Árbol' },
  { valor: 'palmera',  etiqueta: 'Palmera' },
  { valor: 'arbusto',  etiqueta: 'Arbusto' },
  { valor: 'liana',    etiqueta: 'Liana' },
  { valor: 'hierba',   etiqueta: 'Hierba' },
  { valor: '',         etiqueta: 'No estoy seguro' },
];

@Component({
  selector: 'app-buscador-morfologico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buscador-morfologico.html',
  styleUrl: './buscador-morfologico.css',
})
export class BuscadorMorfologico implements OnInit {
  readonly habitos = HABITOS;

  paso = signal<Paso>('habito');
  habitoSeleccionado = signal<string | null>(null);
  cargandoFiltros = signal(false);
  cargandoResultados = signal(false);
  error = signal('');

  filtros = signal<FiltroMorfologico[]>([]);
  seleccionados = signal<Record<string, string>>({});  // field_name → valor elegido
  seccionesAbiertas = signal<Record<string, boolean>>({});

  resultados = signal<EspecieRegistro[]>([]);
  totalResultados = signal(0);
  paginaActual = signal(1);
  totalPaginas = signal(1);

  // Agrupa filtros por sección para el acordeón
  readonly secciones = computed(() => {
    const mapa = new Map<string, FiltroMorfologico[]>();
    for (const f of this.filtros()) {
      const sec = f.section || 'General';
      if (!mapa.has(sec)) mapa.set(sec, []);
      mapa.get(sec)!.push(f);
    }
    return Array.from(mapa.entries()).map(([nombre, campos]) => ({ nombre, campos }));
  });

  // Cuántos filtros tiene seleccionado el usuario
  readonly cantidadSeleccionados = computed(() =>
    Object.values(this.seleccionados()).filter(v => !!v).length
  );

  constructor(
    private consulta: ConsultaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {}

  // ── Paso 1: elegir hábito ────────────────────────────────────────────────

  elegirHabito(valor: string) {
    this.habitoSeleccionado.set(valor);
    this.seleccionados.set({});
    this.cargandoFiltros.set(true);
    this.error.set('');

    this.consulta.getFiltros(valor || undefined).subscribe({
      next: (data) => {
        this.filtros.set(data);
        // Abre la primera sección por defecto
        if (data.length > 0) {
          const primera = data[0].section || 'General';
          this.seccionesAbiertas.set({ [primera]: true });
        }
        this.cargandoFiltros.set(false);
        this.paso.set('filtros');
        this.cdr.detectChanges();
      },
      error: () => {
        this.error.set('No se pudieron cargar los filtros. Intentá de nuevo.');
        this.cargandoFiltros.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  // ── Paso 2: seleccionar filtros ──────────────────────────────────────────

  toggleSeccion(nombre: string) {
    const actual = this.seccionesAbiertas();
    this.seccionesAbiertas.set({ ...actual, [nombre]: !actual[nombre] });
  }

  estaAbierta(nombre: string): boolean {
    return !!this.seccionesAbiertas()[nombre];
  }

  toggleChip(fieldName: string, opcion: string) {
    const actual = { ...this.seleccionados() };
    // Si ya estaba seleccionado, deselecciona; si no, selecciona
    actual[fieldName] = actual[fieldName] === opcion ? '' : opcion;
    this.seleccionados.set(actual);
  }

  estaSeleccionado(fieldName: string, opcion: string): boolean {
    return this.seleccionados()[fieldName] === opcion;
  }

  buscar(pagina = 1) {
    this.cargandoResultados.set(true);
    this.error.set('');

    // Convertir seleccionados a slugs para el backend
    const filtrosSlug: Record<string, string> = {};
    for (const [fieldName, valor] of Object.entries(this.seleccionados())) {
      if (valor) {
        filtrosSlug[this.consulta.toSlug(fieldName)] = valor;
      }
    }

    this.consulta.buscar({
      habit: this.habitoSeleccionado() || undefined,
      filtros: filtrosSlug,
      page: pagina,
      limit: 20,
    }).subscribe({
      next: (res: ResultadoBusqueda) => {
        this.resultados.set(res.data);
        this.totalResultados.set(res.total);
        this.paginaActual.set(res.page);
        this.totalPaginas.set(res.totalPages);
        this.cargandoResultados.set(false);
        this.paso.set('resultados');
        this.cdr.detectChanges();
      },
      error: () => {
        this.error.set('Error al buscar. Intentá de nuevo.');
        this.cargandoResultados.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  // ── Paso 3: resultados ───────────────────────────────────────────────────

  /**
   * Calcula cuántos filtros aplicados coincide esta especie.
   * Usado para separar "exactos" de "similares" en la galería.
   */
  scoreEspecie(especie: EspecieRegistro): number {
    let score = 0;
    const data = especie.morphological_data ?? {};
    for (const [fieldName, valor] of Object.entries(this.seleccionados())) {
      if (!valor) continue;
      const valorEspecie = data[fieldName];
      if (Array.isArray(valorEspecie)) {
        if (valorEspecie.some((v: string) => v.toLowerCase() === valor.toLowerCase())) score++;
      } else if (typeof valorEspecie === 'string') {
        if (valorEspecie.toLowerCase() === valor.toLowerCase()) score++;
      }
    }
    return score;
  }

  readonly resultadosExactos = computed(() =>
    this.resultados().filter(e => this.scoreEspecie(e) === this.cantidadSeleccionados())
  );

  readonly resultadosSimilares = computed(() =>
    this.resultados().filter(e => this.scoreEspecie(e) < this.cantidadSeleccionados())
  );

  irAFicha(id: string) {
    this.router.navigate(['/ficha-tecnica', id]);
  }

  volverAFiltros() {
    this.paso.set('filtros');
    this.resultados.set([]);
  }

  volverAHabito() {
    this.paso.set('habito');
    this.filtros.set([]);
    this.seleccionados.set({});
    this.resultados.set([]);
    this.habitoSeleccionado.set(null);
  }

  paginaAnterior() {
    if (this.paginaActual() > 1) this.buscar(this.paginaActual() - 1);
  }

  paginaSiguiente() {
    if (this.paginaActual() < this.totalPaginas()) this.buscar(this.paginaActual() + 1);
  }

  primeraFoto(especie: EspecieRegistro): string {
    return especie.photos?.[0]?.cloudinary_url ?? '';
  }
}