// ─── Filtros dinámicos: GET /catalogo/filtros ───────────────────────────
export interface FiltroMorfologico {
  section: string;
  field_name: string;
  selection_type: 'single' | 'multiple';
  field_type: 'option' | 'number';
  opciones: string[];
}

// ─── Foto y registrador ─────────────────────────────────────────────────
export interface FotoEspecie {
  id: string;
  photo_type: string;
  cloudinary_url: string;
  author_id: string;
}

export interface RegistradorResumen {
  id: string;
  first_name: string;
  paternal_last_name: string;
  maternal_last_name: string;
}

// ─── Registro de especie ────────────────────────────────────────────────
export interface EspecieRegistro {
  id: string;
  tracking_code: string;
  scientific_name: string;
  family: string;
  habit: string;
  life_type?: string;
  country_distribution: string[];

  height?: number;
  crown_diameter_parallel?: number;
  crown_diameter_perpendicular?: number;
  crown_base_height?: number;
  cap?: number;
  dap?: number;

  latitude?: number;
  longitude?: number;

  morphological_data: Record<string, any>;

  description?: string;
  growth_stage?: string;
  bark_texture?: string;
  uses?: string;
  conservation_status?: string;
  health_status?: string;
  author_name?: string;

  validated_at?: string;
  photos: FotoEspecie[];
  registrar?: RegistradorResumen;
  species_catalog?: any;
}

// ─── Respuesta del buscador: GET /catalogo/buscar ───────────────────────
export interface ResultadoBusqueda {
  data: EspecieRegistro[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters_applied: Record<string, string | null>;
}

// ─── Distribución: GET /catalogo/:id/distribucion ───────────────────────
export interface PuntoDistribucion {
  id: string;
  latitude: number;
  longitude: number;
  tracking_code: string;
}

export interface Distribucion {
  scientific_name: string;
  family: string;
  total_points: number;
  points: PuntoDistribucion[];
}

// ─── Filtro elegido en la interfaz ──────────────────────────────────────
export interface FiltroSeleccionado {
  field_name: string;
  valor: string;
}