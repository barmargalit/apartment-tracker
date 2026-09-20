import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ResidentsService, CreateResidentDto, UpdateResidentDto } from './residents.service';

@Controller('residents')
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Get()
  findAll() {
    return this.residentsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateResidentDto) {
    return this.residentsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateResidentDto) {
    return this.residentsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.residentsService.delete(id);
  }
}
