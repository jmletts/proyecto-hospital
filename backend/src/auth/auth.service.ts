import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { correo, password, registrationToken } = registerDto;

    // Verify registration token
    try {
      const payload = this.jwtService.verify(registrationToken);
      if (payload.purpose !== 'registration') {
        throw new UnauthorizedException('Token de registro no válido.');
      }
    } catch (e) {
      throw new UnauthorizedException('Token de registro expirado o no válido.');
    }

    const existing = await this.prisma.usuario.findUnique({
      where: { correo },
    });
    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    let rol = await this.prisma.rol.findUnique({
      where: { nombre: 'Paciente' },
    });

    if (!rol) {
      rol = await this.prisma.rol.findFirst();
    }

    if (!rol) {
      throw new BadRequestException('No hay roles registrados en el sistema.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.usuario.create({
      data: {
        correo,
        password_hash: hashedPassword,
        id_rol: rol.id_rol,
        estado: true,
      },
      include: {
        rol: true,
      },
    });

    const { password_hash, ...result } = user;
    return result;
  }

  async getRegisterPin() {
    const config = await this.prisma.configuracion.findUnique({
      where: { clave: 'register_pin' },
    });
    return config?.valor || '1234';
  }

  async updateRegisterPin(newPin: string) {
    if (!newPin || newPin.trim().length < 4) {
      throw new BadRequestException('El PIN debe tener al menos 4 caracteres.');
    }
    await this.prisma.configuracion.upsert({
      where: { clave: 'register_pin' },
      update: { valor: newPin },
      create: { clave: 'register_pin', valor: newPin },
    });
    return { success: true, message: 'PIN actualizado correctamente.' };
  }

  async verifyRegisterPin(pin: string) {
    const activePin = await this.getRegisterPin();
    if (pin !== activePin) {
      throw new UnauthorizedException('PIN de registro incorrecto.');
    }
    const token = this.jwtService.sign(
      { purpose: 'registration' },
      { expiresIn: '15m' }
    );
    return { registrationToken: token };
  }

  async login(loginDto: LoginDto) {
    const { correo, password } = loginDto;

    const user = await this.prisma.usuario.findUnique({
      where: { correo },
      include: {
        rol: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    if (!user.estado) {
      throw new UnauthorizedException('Usuario inactivo o suspendido.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload = {
      sub: user.id_usuario,
      correo: user.correo,
      rol: user.rol.nombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id_usuario: user.id_usuario,
        correo: user.correo,
        rol: user.rol.nombre,
      },
    };
  }
}
