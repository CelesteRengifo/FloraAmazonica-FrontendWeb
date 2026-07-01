import { Usuario } from './usuario.modelo';

export interface RespuestaApi<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

export interface RespuestaLogin {
  access_token: string;
  user: Usuario;
}