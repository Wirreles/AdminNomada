export interface User {
  id: string;
  nombre?: string;
  apellido?: string;
  email: string;
  telefono?: number
  dni?: number;
  password?: string;
  tipo_usuario?: string;
  descripcion?: string;
  imageUrl?: string;
}
