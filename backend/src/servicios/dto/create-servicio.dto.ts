import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateServicioDto {
  @IsString({ message: 'El nombre del servicio debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del servicio es requerido' })
  @MaxLength(100, { message: 'El nombre del servicio no debe superar los 100 caracteres' })
  nombre: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número decimal válido' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @IsNotEmpty({ message: 'El precio es requerido' })
  precio: number;
}
