import { IsNotEmpty, IsOptional, IsString, IsInt, MaxLength } from 'class-validator';

export class CreateMedicoDto {
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  id_usuario: number;

  @IsString({ message: 'Los nombres deben ser un texto' })
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  @MaxLength(100, { message: 'Los nombres no deben superar los 100 caracteres' })
  nombres: string;

  @IsString({ message: 'Los apellidos deben ser un texto' })
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @MaxLength(100, { message: 'Los apellidos no deben superar los 100 caracteres' })
  apellidos: string;

  @IsString({ message: 'El CMP debe ser un texto' })
  @IsNotEmpty({ message: 'El CMP es requerido' })
  @MaxLength(20, { message: 'El CMP no debe superar los 20 caracteres' })
  cmp: string;

  @IsString({ message: 'La especialidad debe ser un texto' })
  @IsOptional()
  @MaxLength(100, { message: 'La especialidad no debe superar los 100 caracteres' })
  especialidad?: string;
}
