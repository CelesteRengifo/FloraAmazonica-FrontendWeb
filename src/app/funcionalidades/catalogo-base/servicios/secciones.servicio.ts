import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Seccion, CrearSeccion, ActualizarSeccion } from '../modelos/seccion.modelo';

@Injectable({ providedIn: 'root' })
export class SeccionesServicio {
  private http = inject(HttpClient);
  private urlBase = `${environment.apiUrl}/secciones`;

  listarPorHabito(habit: string): Observable<Seccion[]> {
    return this.http.get<Seccion[]>(this.urlBase, { params: { habit } });
  }

  crear(dto: CrearSeccion): Observable<Seccion> {
    return this.http.post<Seccion>(this.urlBase, dto);
  }

  actualizar(id: string, dto: ActualizarSeccion): Observable<Seccion> {
    return this.http.patch<Seccion>(`${this.urlBase}/${id}`, dto);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}