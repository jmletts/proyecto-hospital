import { IsNotEmpty, IsOptional, IsString, IsInt, IsDateString, MaxLength } from 'class-validator';

export class CreateCitaDto {
  @IsInt({ message: 'El ID del paciente debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  id_paciente: number;

  @IsInt({ message: 'El ID del médico debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del médico es requerido' })
  id_medico: number;

  @IsInt({ message: 'El ID del servicio debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del servicio es requerido' })
  id_servicio: number;

  @IsDateString({}, { message: 'La fecha y hora deben ser un formato de fecha válido (ISO 8601)' })
  @IsNotEmpty({ message: 'La fecha y hora de la cita son requeridas' })
  fecha_hora: string;

  @IsString({ message: 'El estado debe ser un texto' })
  @IsOptional()
  @MaxLength(20, { message: 'El estado no debe superar los 20 caracteres' })
  estado?: string;

  @IsString({ message: 'El motivo de consulta debe ser un texto' })
  @IsOptional()
  motivo_consulta?: string;
}
