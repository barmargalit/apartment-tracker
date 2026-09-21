import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { BillsService, CreateBillDto, UpdateBillDto } from './bills.service';
import { BillType } from './bill.entity';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get('last')
  findLast() {
    return this.billsService.findLast();
  }

  @Get()
  findByType(@Query('type') type: BillType) {
    return this.billsService.findByType(type);
  }

  @Post()
  create(@Body() dto: CreateBillDto) {
    return this.billsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBillDto) {
    return this.billsService.update(id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.billsService.delete(id);
  }
}
