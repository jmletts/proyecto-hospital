import { IsOptional, IsString, IsInt, IsDateString, MaxLength } from 'class-validator';

export class UpdatePacienteDto {
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsOptional()
  id_usuario?: number;

  @IsString({ message: 'El DNI debe ser un texto' })
  @IsOptional()
  @MaxLength(15, { message: 'El DNI no debe superar los 15 caracteres' })
  dni?: string;

  @IsString({ message: 'Los nombres deben ser un texto' })
  @IsOptional()
  @MaxLength(100, { message: 'Los nombres no deben superar los 100 caracteres' })
  nombres?: string;

  @IsString({ message: 'Los apellidos deben ser un texto' })
  @IsOptional()
  @MaxLength(100, { message: 'Los apellidos no deben superar los 100 caracteres' })
  apellidos?: string;

  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsOptional()
  @MaxLength(20, { message: 'El teléfono no debe superar los 20 caracteres' })
  telefono?: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)' })
  @IsOptional()
  fecha_nacimiento?: string;
}
