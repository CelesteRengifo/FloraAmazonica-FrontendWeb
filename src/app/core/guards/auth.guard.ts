import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';

export const authGuard: CanActivateFn = () => {
  const autenticacionServicio = inject(AutenticacionServicio);
  const router = inject(Router);

  if (autenticacionServicio.estaAutenticado()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};