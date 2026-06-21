import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class ChatDto {
  @IsString({ message: 'El mensaje debe ser un texto' })
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  mensaje: string;

  @IsArray({ message: 'El historial debe ser un arreglo' })
  @IsOptional()
  history?: {
    role: 'user' | 'model';
    message: string;
  }[];
}
