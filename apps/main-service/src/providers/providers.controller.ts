import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ProvidersService, CreateProviderDto, UpdateProviderDto } from './providers.service';
import { BillType } from '@xpensive/types';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  findAll(@Query('type') type?: BillType) {
    return this.providersService.findAll(type);
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

  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.providersService.delete(id);
  }
}
