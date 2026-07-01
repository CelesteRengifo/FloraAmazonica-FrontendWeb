import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaLogin } from '../modelos/respuesta-api.modelo';
import { Usuario } from '../modelos/usuario.modelo';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionServicio {

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(respuesta => {
        localStorage.setItem('token', respuesta.access_token);
        localStorage.setItem('usuario', JSON.stringify(respuesta.user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerUsuario(): Usuario | null {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  obtenerRol(): string | null {
    return this.obtenerUsuario()?.role ?? null;
  }
}