import { IsOptional, IsString, IsInt, IsNumber, Min, MaxLength } from 'class-validator';

export class UpdateFacturaDto {
  @IsInt({ message: 'El ID de la cita debe ser un número entero' })
  @IsOptional()
  id_cita?: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto total debe ser un número decimal válido' })
  @Min(0, { message: 'El monto total no puede ser negativo' })
  @IsOptional()
  monto_total?: number;

  @IsString({ message: 'El método de pago debe ser un texto' })
  @IsOptional()
  @MaxLength(50, { message: 'El método de pago no debe superar los 50 caracteres' })
  metodo_pago?: string;

  @IsString({ message: 'El estado de pago debe ser un texto' })
  @IsOptional()
  @MaxLength(20, { message: 'El estado de pago no debe superar los 20 caracteres' })
  estado_pago?: string;
}
