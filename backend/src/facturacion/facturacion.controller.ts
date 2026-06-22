import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('facturacion')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Post()
  @Roles('Admin', 'Operador')
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturacionService.create(createFacturaDto);
  }

  @Get()
  @Roles('Admin', 'Operador')
  findAll() {
    return this.facturacionService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Operador')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Operador')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturacionService.update(id, updateFacturaDto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.remove(id);
  }
}
