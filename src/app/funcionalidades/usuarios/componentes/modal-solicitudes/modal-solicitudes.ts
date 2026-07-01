import { Component, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { switchMap } from 'rxjs';
import { UsuariosServicio } from '../../servicios/usuarios.servicio';
import { UsuarioAdmin, RolUsuario } from '../../modelos/usuario-admin.modelo';
import { ModalConfirmacion } from '../modal-confirmacion/modal-confirmacion';

@Component({
  selector: 'app-modal-solicitudes',
  standalone: true,
  imports: [ModalConfirmacion, DatePipe],
  templateUrl: './modal-solicitudes.html',
  styleUrl: './modal-solicitudes.css',
})
export class ModalSolicitudes {
  private usuariosServicio = inject(UsuariosServicio);

  solicitudes = input.required<UsuarioAdmin[]>();
  cerrar = output<void>();
  solicitudConfirmada = output<void>();
  solicitudEliminada = output<string>();

  readonly rolesDisponibles: RolUsuario[] = ['consultor', 'registrador', 'validador', 'administrador'];

  cargando = signal<string | null>(null);
  solicitudAEliminar = signal<UsuarioAdmin | null>(null);
  error = signal<string | null>(null);

  // Rol elegido para cada solicitud, antes de confirmar. Sin valor por defecto.
  rolesSeleccionados = signal<Record<string, RolUsuario | ''>>({});

  rolSeleccionado(usuarioId: string): RolUsuario | '' {
    return this.rolesSeleccionados()[usuarioId] ?? '';
  }

  onCambiarRolSeleccionado(usuarioId: string, evento: Event) {
    const rol = (evento.target as HTMLSelectElement).value as RolUsuario | '';
    this.rolesSeleccionados.update((mapa) => ({ ...mapa, [usuarioId]: rol }));
  }

  puedeConfirmar(usuarioId: string): boolean {
    return this.rolSeleccionado(usuarioId) !== '';
  }

  confirmar(usuario: UsuarioAdmin) {
    const rolElegido = this.rolSeleccionado(usuario.id);
    if (!rolElegido) return; // seguridad extra, no debería pasar si el botón está bien deshabilitado

    this.cargando.set(usuario.id);
    this.error.set(null);

    // Primero asigna el rol elegido, luego activa la cuenta.
    this.usuariosServicio
      .actualizarRol(usuario.id, { role: rolElegido })
      .pipe(switchMap(() => this.usuariosServicio.cambiarActivacion(usuario.id, true)))
      .subscribe({
        next: () => {
          this.cargando.set(null);
          this.solicitudConfirmada.emit();
        },
        error: () => {
          this.cargando.set(null);
          this.error.set('No se pudo confirmar la solicitud. Intenta nuevamente.');
        },
      });
  }

  pedirEliminar(usuario: UsuarioAdmin) {
    this.solicitudAEliminar.set(usuario);
  }

  cancelarEliminar() {
    this.solicitudAEliminar.set(null);
  }

  confirmarEliminar() {
    const usuario = this.solicitudAEliminar();
    if (!usuario) return;

    this.cargando.set(usuario.id);
    this.usuariosServicio.eliminarSolicitud(usuario.id).subscribe({
      next: () => {
        this.cargando.set(null);
        this.solicitudAEliminar.set(null);
        this.solicitudEliminada.emit(usuario.id);
      },
      error: () => {
        this.cargando.set(null);
        this.solicitudAEliminar.set(null);
        this.error.set('No se pudo eliminar la solicitud. Intenta nuevamente.');
      },
    });
  }
}