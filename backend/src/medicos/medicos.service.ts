import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';

@Injectable()
export class MedicosService {
  constructor(private prisma: PrismaService) {}

  async create(createMedicoDto: CreateMedicoDto) {
    // Validar CMP único
    const existingCmp = await this.prisma.medico.findUnique({
      where: { cmp: createMedicoDto.cmp },
    });
    if (existingCmp) {
      throw new ConflictException('Ya existe un médico registrado con ese CMP.');
    }

    // Validar id_usuario único y existente
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: createMedicoDto.id_usuario },
    });
    if (!user) {
      throw new NotFoundException('El usuario especificado no existe.');
    }

    const existingUser = await this.prisma.medico.findUnique({
      where: { id_usuario: createMedicoDto.id_usuario },
    });
    if (existingUser) {
      throw new ConflictException('El usuario ya está vinculado a otro médico.');
    }

    return this.prisma.medico.create({
      data: {
        id_usuario: createMedicoDto.id_usuario,
        nombres: createMedicoDto.nombres,
        apellidos: createMedicoDto.apellidos,
        cmp: createMedicoDto.cmp,
        especialidad: createMedicoDto.especialidad ?? 'Oftalmología General',
      },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            correo: true,
            estado: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.medico.findMany({
      include: {
        usuario: {
          select: {
            id_usuario: true,
            correo: true,
            estado: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const medico = await this.prisma.medico.findUnique({
      where: { id_medico: id },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            correo: true,
            estado: true,
          },
        },
      },
    });
    if (!medico) {
      throw new NotFoundException(`Médico con ID ${id} no encontrado.`);
    }
    return medico;
  }

  async update(id: number, updateMedicoDto: UpdateMedicoDto) {
    await this.findOne(id);

    if (updateMedicoDto.cmp) {
      const existingCmp = await this.prisma.medico.findFirst({
        where: { cmp: updateMedicoDto.cmp, NOT: { id_medico: id } },
      });
      if (existingCmp) {
        throw new ConflictException('Ya existe otro médico registrado con ese CMP.');
      }
    }

    if (updateMedicoDto.id_usuario) {
      const user = await this.prisma.usuario.findUnique({
        where: { id_usuario: updateMedicoDto.id_usuario },
      });
      if (!user) {
        throw new NotFoundException('El usuario especificado no existe.');
      }

      const existingUser = await this.prisma.medico.findFirst({
        where: { id_usuario: updateMedicoDto.id_usuario, NOT: { id_medico: id } },
      });
      if (existingUser) {
        throw new ConflictException('El usuario ya está vinculado a otro médico.');
      }
    }

    return this.prisma.medico.update({
      where: { id_medico: id },
      data: updateMedicoDto,
      include: {
        usuario: {
          select: {
            id_usuario: true,
            correo: true,
            estado: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.medico.delete({
      where: { id_medico: id },
    });
  }
}
