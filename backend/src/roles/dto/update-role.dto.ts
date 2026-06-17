import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @IsString({ message: 'El nombre del rol debe ser un texto' })
  @IsOptional()
  @MaxLength(50, { message: 'El nombre del rol no debe superar los 50 caracteres' })
  nombre?: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;
}
