import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ContractsService, CreateContractDto, UpdateContractDto } from './contracts.service';
import { BillType } from '../bills/bill.entity';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  findAll(@Query('type') type?: BillType) {
    if (type) return this.contractsService.findByType(type);
    return this.contractsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateContractDto) {
    return this.contractsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.contractsService.update(id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.contractsService.delete(id);
  }
}
