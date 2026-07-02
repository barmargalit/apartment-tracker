import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BanksService, CreateBankDto, UpdateBankDto } from './banks.service';

@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get()
  findAll() {
    return this.banksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.banksService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBankDto) {
    return this.banksService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBankDto) {
    return this.banksService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.banksService.delete(id);
  }
}
