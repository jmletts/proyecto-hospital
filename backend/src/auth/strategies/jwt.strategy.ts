import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'nawi_super_secret_key_change_me_in_production',
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { id_usuario: payload.sub },
        include: {
          rol: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado.');
      }

      if (!user.estado) {
        throw new UnauthorizedException('Usuario inactivo o suspendido.');
      }

      return {
        id_usuario: user.id_usuario,
        correo: user.correo,
        id_rol: user.id_rol,
        rol: user.rol.nombre,
      };
    } catch (dbError: any) {
      // Si la DB está offline (P1001), confiamos en el payload del JWT
      // El token ya fue verificado criptográficamente por Passport con JWT_SECRET.
      const isConnectionError =
        dbError.message?.includes("Can't reach database server") ||
        dbError.code === 'P1001' ||
        dbError.message?.includes('initialization');

      if (isConnectionError) {
        console.warn(
          'JwtStrategy: DB offline, usando datos del payload JWT directamente.',
        );
        // El payload contiene { sub, correo, rol } firmados con JWT_SECRET
        return {
          id_usuario: payload.sub,
          correo: payload.correo,
          id_rol: null,        // No disponible sin DB
          rol: payload.rol,
        };
      }

      // Cualquier otro error (credenciales inválidas, etc.) se propaga normalmente
      throw dbError;
    }
  }
}
