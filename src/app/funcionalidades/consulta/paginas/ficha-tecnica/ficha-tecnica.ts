import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultaService } from '../../servicios/consulta.service';
import { EspecieRegistro, Distribucion, FotoEspecie } from '../../modelos/consulta.models';

@Component({
  selector: 'app-ficha-tecnica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ficha-tecnica.html',
  styleUrl: './ficha-tecnica.css',
})
export class FichaTecnica implements OnInit {
  especie = signal<EspecieRegistro | null>(null);
  distribucion = signal<Distribucion | null>(null);
  cargando = signal(true);
  error = signal('');

  // Foto seleccionada en el visor
  fotoActiva = signal<FotoEspecie | null>(null);

  // Modal límite de descargas
  mostrarModalLimite = signal(false);

  // Estado de descarga por foto
  descargando = signal<Record<string, boolean>>({});

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consulta: ConsultaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.cargarFicha(id);
  }

  cargarFicha(id: string) {
    this.cargando.set(true);
    this.consulta.getFicha(id).subscribe({
      next: (data) => {
        this.especie.set(data);
        this.fotoActiva.set(data.photos?.[0] ?? null);
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

  cargarDistribucion(id: string) {
    this.consulta.getDistribucion(id).subscribe({
      next: (data) => {
        this.distribucion.set(data);
        this.cargando.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        // La distribución es opcional, no bloquea la ficha
        this.cargando.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  seleccionarFoto(foto: FotoEspecie) {
    this.fotoActiva.set(foto);
  }

  descargarFoto(foto: FotoEspecie) {
    const especie = this.especie();
    if (!especie) return;

    this.descargando.set({ ...this.descargando(), [foto.id]: true });

    this.consulta.descargarFoto(especie.id, foto.id).subscribe({
      next: (response) => {
        // Crear link de descarga desde el blob
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

  // Helpers de presentación
  morfologiaEntradas(): { clave: string; valor: any }[] {
    const data = this.especie()?.morphological_data ?? {};
    return Object.entries(data)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([clave, valor]) => ({ clave, valor }));
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