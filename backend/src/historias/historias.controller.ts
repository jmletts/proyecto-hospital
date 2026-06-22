import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { HistoriasService } from './historias.service';
import { CreateHistoriaDto } from './dto/create-historia.dto';
import { UpdateHistoriaDto } from './dto/update-historia.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('historias')
export class HistoriasController {
  constructor(private readonly historiasService: HistoriasService) {}

  @Post()
  @Roles('Admin', 'Médico')
  create(@Body() createHistoriaDto: CreateHistoriaDto) {
    return this.historiasService.create(createHistoriaDto);
  }

  @Get()
  @Roles('Admin', 'Médico', 'Operador', 'Paciente')
  findAll() {
    return this.historiasService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Médico', 'Operador', 'Paciente')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historiasService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Médico')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateHistoriaDto: UpdateHistoriaDto) {
    return this.historiasService.update(id, updateHistoriaDto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historiasService.remove(id);
  }
}
