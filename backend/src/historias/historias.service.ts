import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoriaDto } from './dto/create-historia.dto';
import { UpdateHistoriaDto } from './dto/update-historia.dto';

@Injectable()
export class HistoriasService {
  constructor(private prisma: PrismaService) {}

  async create(createHistoriaDto: CreateHistoriaDto) {
    // Validar paciente
    const paciente = await this.prisma.paciente.findUnique({
      where: { id_paciente: createHistoriaDto.id_paciente },
    });
    if (!paciente) {
      throw new NotFoundException('El paciente especificado no existe.');
    }

    // Validar cita
    const cita = await this.prisma.cita.findUnique({
      where: { id_cita: createHistoriaDto.id_cita },
    });
    if (!cita) {
      throw new NotFoundException('La cita especificada no existe.');
    }

    // Validar historia clínica única por cita
    const existing = await this.prisma.historiaClinica.findUnique({
      where: { id_cita: createHistoriaDto.id_cita },
    });
    if (existing) {
      throw new ConflictException('Ya existe una historia clínica registrada para esta cita.');
    }

    return this.prisma.historiaClinica.create({
      data: createHistoriaDto,
      include: {
        paciente: true,
        cita: true,
      },
    });
  }

  async findAll() {
    return this.prisma.historiaClinica.findMany({
      include: {
        paciente: true,
        cita: {
          include: {
            medico: true,
            servicio: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const historia = await this.prisma.historiaClinica.findUnique({
      where: { id_historia: id },
      include: {
        paciente: true,
        cita: {
          include: {
            medico: true,
            servicio: true,
          },
        },
        receta: true,
      },
    });
    if (!historia) {
      throw new NotFoundException(`Historia clínica con ID ${id} no encontrada.`);
    }
    return historia;
  }

  async update(id: number, updateHistoriaDto: UpdateHistoriaDto) {
    await this.findOne(id);

    if (updateHistoriaDto.id_paciente) {
      const p = await this.prisma.paciente.findUnique({ where: { id_paciente: updateHistoriaDto.id_paciente } });
      if (!p) throw new NotFoundException('El paciente especificado no existe.');
    }

    if (updateHistoriaDto.id_cita) {
      const c = await this.prisma.cita.findUnique({ where: { id_cita: updateHistoriaDto.id_cita } });
      if (!c) throw new NotFoundException('La cita especificada no existe.');

      const existing = await this.prisma.historiaClinica.findFirst({
        where: { id_cita: updateHistoriaDto.id_cita, NOT: { id_historia: id } },
      });
      if (existing) {
        throw new ConflictException('Ya existe otra historia clínica vinculada a esa cita.');
      }
    }

    return this.prisma.historiaClinica.update({
      where: { id_historia: id },
      data: updateHistoriaDto,
      include: {
        paciente: true,
        cita: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.historiaClinica.delete({
      where: { id_historia: id },
    });
  }
}
