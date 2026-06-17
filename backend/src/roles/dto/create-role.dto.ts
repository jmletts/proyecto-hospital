import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'El nombre del rol debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @MaxLength(50, { message: 'El nombre del rol no debe superar los 50 caracteres' })
  nombre: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;
}
