import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  correo: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsInt({ message: 'El ID del rol debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  id_rol: number;

  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  @IsOptional()
  estado?: boolean;
}
