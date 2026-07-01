import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AutenticacionServicio } from '../../core/servicios/autenticacion.servicio';

interface ElementoNav {
  etiqueta: string;
  ruta: string;
}

@Component({
  selector: 'app-barra-lateral',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './barra-lateral.html',
  styleUrl: './barra-lateral.css'
})
export class BarraLateral {
  rol: string | null;
  elementosNav: ElementoNav[] = [];

  constructor(private autenticacionServicio: AutenticacionServicio) {
    this.rol = this.autenticacionServicio.obtenerRol();
    this.elementosNav = this.obtenerElementosNav();
  }

  private obtenerElementosNav(): ElementoNav[] {
    switch (this.rol) {
      case 'administrador':
        return [
          { etiqueta: 'Gestión de Usuarios', ruta: '/usuarios' },
          { etiqueta: 'Carga de catálogo', ruta: '/catalogo/carga' },
          { etiqueta: 'Edición de catálogo', ruta: '/catalogo/edicion' },
          { etiqueta: 'Morfología', ruta: '/catalogo/morfologia' }
        ];
      case 'validador':
        return [{ etiqueta: 'Validación', ruta: '/validacion' }];
      case 'consultor':
        return [{ etiqueta: 'Consulta', ruta: '/consulta' }];
      default:
        return [];
    }
  }
}