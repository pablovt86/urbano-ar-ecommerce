import { z } from 'zod';

export const productoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  precio: z.number().positive('El precio debe ser un número positivo'),
  descripcion: z.string().optional(),
  // Validamos los tipos exactos que tu motor de Python / MediaPipe espera recibir
  tipo_prenda: z.enum(['superior', 'inferior', 'completo'], {
    errorMap: () => ({ message: 'El tipo de prenda debe ser superior, inferior o completo' })
  }),
  overlay: z.enum(['torso', 'piernas', 'cuerpo_completo'], {
    errorMap: () => ({ message: 'El overlay debe ser torso, piernas o cuerpo_completo' })
  }),
  imagen_vton_url: z.string().min(1, 'La URL o nombre del asset VTON es obligatorio')
});