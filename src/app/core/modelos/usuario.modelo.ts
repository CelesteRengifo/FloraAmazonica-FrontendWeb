export interface Usuario {
  id: string;
  first_name: string;
  paternal_last_name: string;
  maternal_last_name: string | null;
  email: string;
  role: 'administrador' | 'registrador' | 'validador' | 'consultor';
  is_active: boolean;
}