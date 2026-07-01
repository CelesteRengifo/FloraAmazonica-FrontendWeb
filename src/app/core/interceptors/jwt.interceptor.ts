import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const autenticacionServicio = inject(AutenticacionServicio);
  const token = autenticacionServicio.obtenerToken();

  if (token) {
    const reqConToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(reqConToken);
  }

  return next(req);
};