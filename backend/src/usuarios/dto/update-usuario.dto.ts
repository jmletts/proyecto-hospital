import { IsEmail, IsInt, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsOptional()
  correo?: string;

  @IsOptional()
  nombre?: string;

  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsInt({ message: 'El ID del rol debe ser un número entero' })
  @IsOptional()
  id_rol?: number;

  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  @IsOptional()
  estado?: boolean;
}
