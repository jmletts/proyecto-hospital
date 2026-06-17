import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  async create(createCitaDto: CreateCitaDto) {
    // Validar existencia de paciente, medico, servicio
    const paciente = await this.prisma.paciente.findUnique({
      where: { id_paciente: createCitaDto.id_paciente },
    });
    if (!paciente) {
      throw new NotFoundException('El paciente especificado no existe.');
    }

    const medico = await this.prisma.medico.findUnique({
      where: { id_medico: createCitaDto.id_medico },
    });
    if (!medico) {
      throw new NotFoundException('El médico especificado no existe.');
    }

    const servicio = await this.prisma.servicio.findUnique({
      where: { id_servicio: createCitaDto.id_servicio },
    });
    if (!servicio) {
      throw new NotFoundException('El servicio especificado no existe.');
    }

    return this.prisma.cita.create({
      data: {
        id_paciente: createCitaDto.id_paciente,
        id_medico: createCitaDto.id_medico,
        id_servicio: createCitaDto.id_servicio,
        fecha_hora: new Date(createCitaDto.fecha_hora),
        estado: createCitaDto.estado ?? 'Pendiente',
        motivo_consulta: createCitaDto.motivo_consulta,
      },
      include: {
        paciente: true,
        medico: true,
        servicio: true,
      },
    });
  }

  async findAll() {
    return this.prisma.cita.findMany({
      include: {
        paciente: true,
        medico: true,
        servicio: true,
      },
    });
  }

  async findOne(id: number) {
    const cita = await this.prisma.cita.findUnique({
      where: { id_cita: id },
      include: {
        paciente: true,
        medico: true,
        servicio: true,
        historia: true,
        factura: true,
      },
    });
    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada.`);
    }
    return cita;
  }

  async update(id: number, updateCitaDto: UpdateCitaDto) {
    await this.findOne(id);

    const data: any = {
      ...updateCitaDto,
    };

    if (updateCitaDto.fecha_hora) {
      data.fecha_hora = new Date(updateCitaDto.fecha_hora);
    }

    if (updateCitaDto.id_paciente) {
      const p = await this.prisma.paciente.findUnique({ where: { id_paciente: updateCitaDto.id_paciente } });
      if (!p) throw new NotFoundException('El paciente especificado no existe.');
    }

    if (updateCitaDto.id_medico) {
      const m = await this.prisma.medico.findUnique({ where: { id_medico: updateCitaDto.id_medico } });
      if (!m) throw new NotFoundException('El médico especificado no existe.');
    }

    if (updateCitaDto.id_servicio) {
      const s = await this.prisma.servicio.findUnique({ where: { id_servicio: updateCitaDto.id_servicio } });
      if (!s) throw new NotFoundException('El servicio especificado no existe.');
    }

    return this.prisma.cita.update({
      where: { id_cita: id },
      data,
      include: {
        paciente: true,
        medico: true,
        servicio: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cita.delete({
      where: { id_cita: id },
    });
  }
}
