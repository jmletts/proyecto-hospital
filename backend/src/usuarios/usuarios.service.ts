import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const existing = await this.prisma.usuario.findUnique({
      where: { correo: createUsuarioDto.correo },
    });
    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    // Validar que el rol exista
    const rol = await this.prisma.rol.findUnique({
      where: { id_rol: createUsuarioDto.id_rol },
    });
    if (!rol) {
      throw new BadRequestException('El rol especificado no existe.');
    }

    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    const user = await this.prisma.usuario.create({
      data: {
        correo: createUsuarioDto.correo,
        password_hash: hashedPassword,
        nombre: createUsuarioDto.nombre,
        id_rol: createUsuarioDto.id_rol,
        estado: createUsuarioDto.estado ?? true,
      },
      include: {
        rol: true,
      },
    });

    const { password_hash, ...result } = user;
    return result;
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nombre: true,
        correo: true,
        id_rol: true,
        estado: true,
        fecha_creacion: true,
        rol: {
          select: {
            id_rol: true,
            nombre: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: {
        rol: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    const { password_hash, ...result } = user;
    return result;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const user = await this.findOne(id);

    const updateData: any = {};

    if (updateUsuarioDto.correo) {
      const existing = await this.prisma.usuario.findFirst({
        where: { correo: updateUsuarioDto.correo, NOT: { id_usuario: id } },
      });
      if (existing) {
        throw new ConflictException('El correo electrónico ya está registrado por otro usuario.');
      }
      updateData.correo = updateUsuarioDto.correo;
    }

    if (updateUsuarioDto.nombre) {
      updateData.nombre = updateUsuarioDto.nombre;
    }

    if (updateUsuarioDto.password) {
      updateData.password_hash = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    if (updateUsuarioDto.id_rol !== undefined) {
      const rol = await this.prisma.rol.findUnique({
        where: { id_rol: updateUsuarioDto.id_rol },
      });
      if (!rol) {
        throw new BadRequestException('El rol especificado no existe.');
      }
      updateData.id_rol = updateUsuarioDto.id_rol;
    }

    if (updateUsuarioDto.estado !== undefined) {
      updateData.estado = updateUsuarioDto.estado;
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: updateData,
      include: {
        rol: true,
      },
    });

    const { password_hash, ...result } = updatedUser;
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.usuario.delete({
        where: { id_usuario: id },
      });
    } catch (error) {
      // Si tiene dependencias en cascada o restricción, se le cambia el estado a inactivo
      return this.prisma.usuario.update({
        where: { id_usuario: id },
        data: { estado: false },
      });
    }
  }
}
