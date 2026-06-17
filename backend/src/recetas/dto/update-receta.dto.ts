import { IsOptional, IsInt, IsNumber, Min, Max } from 'class-validator';

export class UpdateRecetaDto {
  @IsInt({ message: 'El ID de la historia clínica debe ser un número entero' })
  @IsOptional()
  id_historia?: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor de esfera OD debe ser decimal' })
  @IsOptional()
  od_esfera?: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor de cilindro OD debe ser decimal' })
  @IsOptional()
  od_cilindro?: number;

  @IsInt({ message: 'El eje OD debe ser un número entero' })
  @Min(0)
  @Max(180)
  @IsOptional()
  od_eje?: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor de esfera OI debe ser decimal' })
  @IsOptional()
  oi_esfera?: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor de cilindro OI debe ser decimal' })
  @IsOptional()
  oi_cilindro?: number;

  @IsInt({ message: 'El eje OI debe ser un número entero' })
  @Min(0)
  @Max(180)
  @IsOptional()
  oi_eje?: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La adición debe ser un número decimal' })
  @IsOptional()
  adicion?: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La distancia pupilar debe ser un número decimal' })
  @IsOptional()
  distancia_pupilar?: number;
}
