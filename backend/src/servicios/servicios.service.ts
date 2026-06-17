import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async create(createServicioDto: CreateServicioDto) {
    return this.prisma.servicio.create({
      data: createServicioDto,
    });
  }

  async findAll() {
    return this.prisma.servicio.findMany();
  }

  async findOne(id: number) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id_servicio: id },
    });
    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado.`);
    }
    return servicio;
  }

  async update(id: number, updateServicioDto: UpdateServicioDto) {
    await this.findOne(id);
    return this.prisma.servicio.update({
      where: { id_servicio: id },
      data: updateServicioDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.servicio.delete({
        where: { id_servicio: id },
      });
    } catch (error) {
      throw new ConflictException('No se puede eliminar el servicio porque está asociado a citas existentes.');
    }
  }
}
