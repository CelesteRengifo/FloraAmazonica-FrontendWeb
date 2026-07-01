import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraLateral } from '../barra-lateral/barra-lateral';
import { Encabezado } from '../encabezado/encabezado';

@Component({
  selector: 'app-layout-principal',
  imports: [RouterOutlet, Encabezado, BarraLateral],
  templateUrl: './layout-principal.html',
  styleUrl: './layout-principal.css'
})
export class LayoutPrincipal {}