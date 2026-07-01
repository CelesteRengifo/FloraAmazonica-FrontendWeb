import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AutenticacionServicio } from '../../../../core/servicios/autenticacion.servicio';
import { environment } from '../../../../../environments/environment';

type CampoLogin = 'email' | 'password';

type CampoRegistro =
  | 'first_name'
  | 'paternal_last_name'
  | 'maternal_last_name'
  | 'email'
  | 'password';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  vistaActiva: 'login' | 'registro' = 'login';

  loginForm = {
    email: '',
    password: ''
  };

  registroForm = {
    first_name: '',
    paternal_last_name: '',
    maternal_last_name: '',
    email: '',
    password: ''
  };

  mostrarContrasena = false;
  mostrarContrasenaRegistro = false;
  cargando = false;
  error = '';
  mensajeExito = '';

  erroresLogin: {
    email?: string;
    password?: string;
  } = {};

  erroresRegistro: {
    first_name?: string;
    paternal_last_name?: string;
    maternal_last_name?: string;
    email?: string;
    password?: string;
  } = {};

  constructor(
    private autenticacion: AutenticacionServicio,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  alternarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;

    setTimeout(() => {
      document.getElementById('password')?.focus();
    }, 0);
  }

  alternarContrasenaRegistro(): void {
    this.mostrarContrasenaRegistro = !this.mostrarContrasenaRegistro;

    setTimeout(() => {
      document.getElementById('password-registro')?.focus();
    }, 0);
  }

  cambiarVista(vista: 'login' | 'registro'): void {
    this.vistaActiva = vista;
    this.limpiarEstado();
    this.limpiarFormularioLogin();
    this.limpiarFormularioRegistro();
    this.cdr.detectChanges();
  }

  private limpiarEstado(): void {
    this.error = '';
    this.mensajeExito = '';
    this.erroresLogin = {};
    this.erroresRegistro = {};
    this.cargando = false;
    this.mostrarContrasena = false;
    this.mostrarContrasenaRegistro = false;
  }

  private limpiarFormularioLogin(): void {
    this.loginForm = {
      email: '',
      password: ''
    };
  }

  private limpiarFormularioRegistro(): void {
    this.registroForm = {
      first_name: '',
      paternal_last_name: '',
      maternal_last_name: '',
      email: '',
      password: ''
    };
  }

  limpiarErrorLogin(campo: CampoLogin): void {
    delete this.erroresLogin[campo];
    this.error = '';
  }

  limpiarErrorRegistro(campo: CampoRegistro): void {
    delete this.erroresRegistro[campo];
    this.error = '';
    this.mensajeExito = '';
  }

  private validarLogin(): boolean {
    this.erroresLogin = {};
    let valido = true;

    const email = this.loginForm.email.trim();
    const password = this.loginForm.password.trim();

    if (!email) {
      this.erroresLogin.email = 'El correo es obligatorio.';
      valido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.erroresLogin.email = 'Ingresa un correo válido.';
      valido = false;
    }

    if (!password) {
      this.erroresLogin.password = 'La contraseña es obligatoria.';
      valido = false;
    }

    return valido;
  }

  private validarRegistro(): boolean {
    this.erroresRegistro = {};
    let valido = true;

    const firstName = this.registroForm.first_name.trim();
    const paternalLastName = this.registroForm.paternal_last_name.trim();
    const maternalLastName = this.registroForm.maternal_last_name.trim();
    const email = this.registroForm.email.trim();
    const password = this.registroForm.password.trim();

    if (!firstName) {
      this.erroresRegistro.first_name = 'Los nombres son obligatorios.';
      valido = false;
    }

    if (!paternalLastName) {
      this.erroresRegistro.paternal_last_name = 'El apellido paterno es obligatorio.';
      valido = false;
    }

    if (!email) {
      this.erroresRegistro.email = 'El correo es obligatorio.';
      valido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.erroresRegistro.email = 'Ingresa un correo válido.';
      valido = false;
    }

    if (!password) {
      this.erroresRegistro.password = 'La contraseña es obligatoria.';
      valido = false;
    } else if (password.length < 8) {
      this.erroresRegistro.password = 'Mínimo 8 caracteres.';
      valido = false;
    } else if (!/[A-Z]/.test(password)) {
      this.erroresRegistro.password = 'Debe tener al menos una letra mayúscula.';
      valido = false;
    } else if (!/[0-9]/.test(password)) {
      this.erroresRegistro.password = 'Debe tener al menos un número.';
      valido = false;
    }

    return valido;
  }

  onLogin(): void {
    this.error = '';
    this.mensajeExito = '';

    if (!this.validarLogin()) return;

    this.cargando = true;
    this.cdr.detectChanges();

    const email = this.loginForm.email.trim();
    const password = this.loginForm.password;

    this.autenticacion.login(email, password).subscribe({
      next: () => {
        this.cargando = false;
        this.limpiarFormularioLogin();
        this.cdr.detectChanges();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.cargando = false;
        this.loginForm.password = '';
        this.mostrarContrasena = false;
        this.erroresLogin.password = 'Vuelve a ingresar la contraseña.';

        if (err.status === 403) {
          this.error = 'Tu cuenta aún no ha sido activada. Contacta al administrador.';
        } else if (err.status === 401) {
          this.error = 'Correo o contraseña incorrectos.';
        } else {
          this.error = 'Ocurrió un error. Intenta nuevamente.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  onRegistro(): void {
    this.error = '';
    this.mensajeExito = '';

    if (!this.validarRegistro()) return;

    this.cargando = true;
    this.cdr.detectChanges();

    const maternalLastName = this.registroForm.maternal_last_name.trim();

    const datosRegistro = {
      first_name: this.registroForm.first_name.trim(),
      paternal_last_name: this.registroForm.paternal_last_name.trim(),
      ...(maternalLastName ? { maternal_last_name: maternalLastName } : {}),
      email: this.registroForm.email.trim(),
      password: this.registroForm.password
    };

    this.http.post(`${environment.apiUrl}/auth/registro`, datosRegistro).subscribe({
      next: () => {
        this.cargando = false;

        this.limpiarFormularioRegistro();
        this.erroresRegistro = {};
        this.error = '';
        this.mostrarContrasenaRegistro = false;

        this.mensajeExito = 'Cuenta creada con éxito. Espera que el administrador active tu acceso.';

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.registroForm.password = '';
        this.mostrarContrasenaRegistro = false;
        this.erroresRegistro.password = 'Vuelve a ingresar la contraseña.';

        if (err.status === 409) {
          this.erroresRegistro.email = 'Este correo ya está registrado.';
        } else {
          this.error = 'No se pudo crear la cuenta. Verifica los datos e intenta nuevamente.';
        }

        this.cdr.detectChanges();
      }
    });
  }
}