import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';

export const rolGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const autenticacionServicio = inject(AutenticacionServicio);
  const router = inject(Router);

  const rolesPermitidos: string[] = route.data['roles'] ?? [];
  const rolUsuario = autenticacionServicio.obtenerRol();

  if (rolUsuario && rolesPermitidos.includes(rolUsuario)) {
    return true;
  }

  router.navigate(['/no-autorizado']);
  return false;
};