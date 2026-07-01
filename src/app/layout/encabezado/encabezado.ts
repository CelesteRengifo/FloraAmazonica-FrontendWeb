import { Component } from '@angular/core';
import { AutenticacionServicio } from '../../core/servicios/autenticacion.servicio';
import { Usuario } from '../../core/modelos/usuario.modelo';

@Component({
  selector: 'app-encabezado',
  imports: [],
  templateUrl: './encabezado.html',
  styleUrl: './encabezado.css'
})
export class Encabezado {
  usuario: Usuario | null;

  constructor(private autenticacionServicio: AutenticacionServicio) {
    this.usuario = this.autenticacionServicio.obtenerUsuario();
  }

  cerrarSesion(): void {
    this.autenticacionServicio.logout();
  }
}