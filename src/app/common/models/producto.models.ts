export interface Producto {
  id: string;
  tipo_isla: string;
  nombre: string;
  imagen: string;
  descrip_corta: string;
  descripcion: string;
  precio: number;
  codigo: string;
  caracteristicas: string[];
  activo:boolean;
}
