import { IsNotEmpty, IsOptional, IsString, IsInt, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateFacturaDto {
  @IsInt({ message: 'El ID de la cita debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la cita es requerido' })
  id_cita: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto total debe ser un número decimal válido' })
  @Min(0, { message: 'El monto total no puede ser negativo' })
  @IsNotEmpty({ message: 'El monto total es requerido' })
  monto_total: number;

  @IsString({ message: 'El método de pago debe ser un texto' })
  @IsOptional()
  @MaxLength(50, { message: 'El método de pago no debe superar los 50 caracteres' })
  metodo_pago?: string;

  @IsString({ message: 'El estado de pago debe ser un texto' })
  @IsOptional()
  @MaxLength(20, { message: 'El estado de pago no debe superar los 20 caracteres' })
  estado_pago?: string;
}
