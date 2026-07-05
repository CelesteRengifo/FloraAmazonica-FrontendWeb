export interface Seccion {
  id: string;
  habit: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface CrearSeccion {
  habit: string;
  name: string;
  display_order?: number;
}

export interface ActualizarSeccion {
  name?: string;
  display_order?: number;
}