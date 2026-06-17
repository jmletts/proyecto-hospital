import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@Injectable()
export class RecetasService {
  constructor(private prisma: PrismaService) {}

  async create(createRecetaDto: CreateRecetaDto) {
    // Validar historia clínica
    const historia = await this.prisma.historiaClinica.findUnique({
      where: { id_historia: createRecetaDto.id_historia },
    });
    if (!historia) {
      throw new NotFoundException('La historia clínica especificada no existe.');
    }

    // Validar receta única por historia clínica
    const existing = await this.prisma.recetaLentes.findUnique({
      where: { id_historia: createRecetaDto.id_historia },
    });
    if (existing) {
      throw new ConflictException('Ya existe una receta de lentes registrada para esta historia clínica.');
    }

    return this.prisma.recetaLentes.create({
      data: createRecetaDto,
      include: {
        historia: {
          include: {
            paciente: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.recetaLentes.findMany({
      include: {
        historia: {
          include: {
            paciente: true,
            cita: {
              include: {
                medico: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const receta = await this.prisma.recetaLentes.findUnique({
      where: { id_receta: id },
      include: {
        historia: {
          include: {
            paciente: true,
            cita: {
              include: {
                medico: true,
              },
            },
          },
        },
      },
    });
    if (!receta) {
      throw new NotFoundException(`Receta de lentes con ID ${id} no encontrada.`);
    }
    return receta;
  }

  async update(id: number, updateRecetaDto: UpdateRecetaDto) {
    await this.findOne(id);

    if (updateRecetaDto.id_historia) {
      const h = await this.prisma.historiaClinica.findUnique({ where: { id_historia: updateRecetaDto.id_historia } });
      if (!h) throw new NotFoundException('La historia clínica especificada no existe.');

      const existing = await this.prisma.recetaLentes.findFirst({
        where: { id_historia: updateRecetaDto.id_historia, NOT: { id_receta: id } },
      });
      if (existing) {
        throw new ConflictException('Ya existe otra receta de lentes vinculada a esa historia clínica.');
      }
    }

    return this.prisma.recetaLentes.update({
      where: { id_receta: id },
      data: updateRecetaDto,
      include: {
        historia: {
          include: {
            paciente: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.recetaLentes.delete({
      where: { id_receta: id },
    });
  }
}
