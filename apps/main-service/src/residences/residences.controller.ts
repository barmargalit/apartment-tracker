import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ResidencesService, CreateResidenceDto, UpdateResidenceDto } from './residences.service';

@Controller('residences')
export class ResidencesController {
  constructor(private readonly residencesService: ResidencesService) {}

  @Get()
  findAll() {
    return this.residencesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.residencesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateResidenceDto) {
    return this.residencesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateResidenceDto) {
    return this.residencesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.residencesService.delete(id);
  }
}
