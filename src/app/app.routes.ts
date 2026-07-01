import { Routes } from '@angular/router';
import {authGuard} from './core/guards/auth.guard';
import {rolGuard} from './core/guards/rol.guard';

export const routes: Routes = [
    {
    path: 'login',
    loadComponent: () =>
      import('./funcionalidades/autenticacion/paginas/login/login').then(m => m.Login)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/layout-principal/layout-principal').then(m => m.LayoutPrincipal),
    children: [
      {
        path: 'usuarios',
        canActivate: [rolGuard],
        data: { roles: ['administrador'] },
        loadComponent: () =>
          import('./funcionalidades/usuarios/paginas/lista-usuarios/lista-usuarios').then(m => m.ListaUsuarios)
      },
      {
        path: 'catalogo',
        canActivate: [rolGuard],
        data: { roles: ['administrador'] },
        children: [
          {
            path: 'carga',
            loadComponent: () =>
              import('./funcionalidades/catalogo-base/paginas/carga-excel/carga-excel').then(m => m.CargaExcel)
          },
          {
            path: 'edicion',
            loadComponent: () =>
              import('./funcionalidades/catalogo-base/paginas/edicion-catalogo/edicion-catalogo').then(m => m.EdicionCatalogo)
          },
          {
            path: 'morfologia',
            loadComponent: () =>
              import('./funcionalidades/catalogo-base/paginas/valores-morfologicos/valores-morfologicos').then(m => m.ValoresMorfologicos)
          }
        ]
      },
      {
        path: '',
        redirectTo: 'usuarios',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'no-autorizado',
    loadComponent: () =>
      import('./funcionalidades/autenticacion/paginas/login/login').then(m => m.Login)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
  
];