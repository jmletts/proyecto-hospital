import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(private prisma: PrismaService) {}

  async create(createPacienteDto: CreatePacienteDto) {
    // Validar DNI único
    const existingDni = await this.prisma.paciente.findUnique({
      where: { dni: createPacienteDto.dni },
    });
    if (existingDni) {
      throw new ConflictException('Ya existe un paciente registrado con ese DNI.');
    }

    // Validar id_usuario único y existente (si se provee)
    if (createPacienteDto.id_usuario) {
      const user = await this.prisma.usuario.findUnique({
        where: { id_usuario: createPacienteDto.id_usuario },
      });
      if (!user) {
        throw new NotFoundException('El usuario especificado no existe.');
      }
      
      const existingUser = await this.prisma.paciente.findUnique({
        where: { id_usuario: createPacienteDto.id_usuario },
      });
      if (existingUser) {
        throw new ConflictException('El usuario ya está vinculado a otro paciente.');
      }
    }

    return this.prisma.paciente.create({
      data: {
        dni: createPacienteDto.dni,
        nombres: createPacienteDto.nombres,
        apellidos: createPacienteDto.apellidos,
        telefono: createPacienteDto.telefono,
        fecha_nacimiento: createPacienteDto.fecha_nacimiento ? new Date(createPacienteDto.fecha_nacimiento) : null,
        id_usuario: createPacienteDto.id_usuario ?? null,
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
    return this.prisma.paciente.findMany({
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
    const paciente = await this.prisma.paciente.findUnique({
      where: { id_paciente: id },
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
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado.`);
    }
    return paciente;
  }

  async update(id: number, updatePacienteDto: UpdatePacienteDto) {
    await this.findOne(id);

    if (updatePacienteDto.dni) {
      const existingDni = await this.prisma.paciente.findFirst({
        where: { dni: updatePacienteDto.dni, NOT: { id_paciente: id } },
      });
      if (existingDni) {
        throw new ConflictException('Ya existe otro paciente registrado con ese DNI.');
      }
    }

    if (updatePacienteDto.id_usuario !== undefined) {
      if (updatePacienteDto.id_usuario !== null) {
        const user = await this.prisma.usuario.findUnique({
          where: { id_usuario: updatePacienteDto.id_usuario },
        });
        if (!user) {
          throw new NotFoundException('El usuario especificado no existe.');
        }

        const existingUser = await this.prisma.paciente.findFirst({
          where: { id_usuario: updatePacienteDto.id_usuario, NOT: { id_paciente: id } },
        });
        if (existingUser) {
          throw new ConflictException('El usuario ya está vinculado a otro paciente.');
        }
      }
    }

    const data: any = {
      ...updatePacienteDto,
    };

    if (updatePacienteDto.fecha_nacimiento) {
      data.fecha_nacimiento = new Date(updatePacienteDto.fecha_nacimiento);
    }

    return this.prisma.paciente.update({
      where: { id_paciente: id },
      data,
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
    return this.prisma.paciente.delete({
      where: { id_paciente: id },
    });
  }
}
