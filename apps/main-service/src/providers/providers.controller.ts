import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProvidersService, CreateProviderDto, UpdateProviderDto } from './providers.service';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  findAll() {
    return this.providersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProviderDto) {
    return this.providersService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.providersService.delete(id);
  }
}
