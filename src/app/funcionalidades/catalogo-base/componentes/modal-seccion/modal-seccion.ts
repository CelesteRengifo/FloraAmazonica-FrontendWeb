// funcionalidades/catalogo-base/componentes/modal-seccion/modal-seccion.ts

import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Seccion } from '../../modelos/seccion.modelo';

export interface ResultadoModalSeccion {
  name: string;
}

@Component({
  selector: 'app-modal-seccion',
  imports: [FormsModule],
  templateUrl: './modal-seccion.html',
  styleUrl: './modal-seccion.css',
})
export class ModalSeccion implements OnInit {
  @Input() seccion: Seccion | null = null;

  @Output() confirmar = new EventEmitter<ResultadoModalSeccion>();
  @Output() cerrar = new EventEmitter<void>();

  nombre = '';

  ngOnInit(): void {
    if (this.seccion) {
      this.nombre = this.seccion.name;
    }
  }

  get esEdicion(): boolean {
    return this.seccion !== null;
  }

  puedeConfirmar(): boolean {
    return this.nombre.trim().length > 0;
  }

  onConfirmar(): void {
    if (!this.puedeConfirmar()) return;
    this.confirmar.emit({ name: this.nombre.trim() });
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}