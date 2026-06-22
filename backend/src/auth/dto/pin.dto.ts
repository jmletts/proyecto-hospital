import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PinDto {
  @IsNotEmpty({ message: 'El PIN es requerido' })
  @IsString()
  @MinLength(4, { message: 'El PIN debe tener al menos 4 caracteres' })
  pin: string;
}
