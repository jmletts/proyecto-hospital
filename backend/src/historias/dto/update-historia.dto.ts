import { IsOptional, IsString, IsInt, MaxLength } from 'class-validator';

export class UpdateHistoriaDto {
  @IsInt({ message: 'El ID del paciente debe ser un número entero' })
  @IsOptional()
  id_paciente?: number;

  @IsInt({ message: 'El ID de la cita debe ser un número entero' })
  @IsOptional()
  id_cita?: number;

  @IsString({ message: 'La agudeza visual OD debe ser un texto' })
  @IsOptional()
  @MaxLength(20, { message: 'La agudeza visual OD no debe superar los 20 caracteres' })
  agudeza_visual_od?: string;

  @IsString({ message: 'La agudeza visual OI debe ser un texto' })
  @IsOptional()
  @MaxLength(20, { message: 'La agudeza visual OI no debe superar los 20 caracteres' })
  agudeza_visual_oi?: string;

  @IsString({ message: 'La presión intraocular OD debe ser un texto' })
  @IsOptional()
  @MaxLength(20, { message: 'La presión intraocular OD no debe superar los 20 caracteres' })
  presion_intraocular_od?: string;

  @IsString({ message: 'La presión intraocular OI debe ser un texto' })
  @IsOptional()
  @MaxLength(20, { message: 'La presión intraocular OI no debe superar los 20 caracteres' })
  presion_intraocular_oi?: string;

  @IsString({ message: 'El diagnóstico debe ser un texto' })
  @IsOptional()
  diagnostico?: string;

  @IsString({ message: 'Las observaciones deben ser un texto' })
  @IsOptional()
  observaciones?: string;
}
