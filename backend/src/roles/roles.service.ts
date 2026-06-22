import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rol.findMany();
  }

  async findOne(id: number) {
    const rol = await this.prisma.rol.findUnique({ where: { id_rol: id } });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado.`);
    }
    return rol;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);
    if (updateRoleDto.nombre) {
      const existing = await this.prisma.rol.findFirst({
        where: { nombre: updateRoleDto.nombre, NOT: { id_rol: id } },
      });
      if (existing) {
        throw new ConflictException('El nombre del rol ya está en uso por otro registro.');
      }
    }
    return this.prisma.rol.update({
      where: { id_rol: id },
      data: updateRoleDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.rol.delete({ where: { id_rol: id } });
    } catch (error) {
      throw new ConflictException('No se puede eliminar el rol porque está siendo utilizado por otros registros.');
    }
  }
}
