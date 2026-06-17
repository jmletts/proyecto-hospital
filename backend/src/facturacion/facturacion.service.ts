import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

@Injectable()
export class FacturacionService {
  constructor(private prisma: PrismaService) {}

  async create(createFacturaDto: CreateFacturaDto) {
    // Validar cita
    const cita = await this.prisma.cita.findUnique({
      where: { id_cita: createFacturaDto.id_cita },
    });
    if (!cita) {
      throw new NotFoundException('La cita especificada no existe.');
    }

    // Validar factura única por cita
    const existing = await this.prisma.facturacion.findUnique({
      where: { id_cita: createFacturaDto.id_cita },
    });
    if (existing) {
      throw new ConflictException('Ya existe una factura registrada para esta cita.');
    }

    return this.prisma.facturacion.create({
      data: createFacturaDto,
      include: {
        cita: {
          include: {
            paciente: true,
            servicio: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.facturacion.findMany({
      include: {
        cita: {
          include: {
            paciente: true,
            servicio: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const factura = await this.prisma.facturacion.findUnique({
      where: { id_factura: id },
      include: {
        cita: {
          include: {
            paciente: true,
            servicio: true,
            medico: true,
          },
        },
      },
    });
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada.`);
    }
    return factura;
  }

  async update(id: number, updateFacturaDto: UpdateFacturaDto) {
    await this.findOne(id);

    if (updateFacturaDto.id_cita) {
      const c = await this.prisma.cita.findUnique({ where: { id_cita: updateFacturaDto.id_cita } });
      if (!c) throw new NotFoundException('La cita especificada no existe.');

      const existing = await this.prisma.facturacion.findFirst({
        where: { id_cita: updateFacturaDto.id_cita, NOT: { id_factura: id } },
      });
      if (existing) {
        throw new ConflictException('Ya existe otra factura vinculada a esa cita.');
      }
    }

    return this.prisma.facturacion.update({
      where: { id_factura: id },
      data: updateFacturaDto,
      include: {
        cita: {
          include: {
            paciente: true,
            servicio: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.facturacion.delete({
      where: { id_factura: id },
    });
  }
}
