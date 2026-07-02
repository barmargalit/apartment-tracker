import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MortgagePlansService, CreateMortgagePlanDto, UpdateMortgagePlanDto } from './mortgage-plans.service';

@Controller('mortgage-plans')
export class MortgagePlansController {
  constructor(private readonly mortgagePlansService: MortgagePlansService) {}

  @Get()
  findAll() {
    return this.mortgagePlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mortgagePlansService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMortgagePlanDto) {
    return this.mortgagePlansService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMortgagePlanDto) {
    return this.mortgagePlansService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.mortgagePlansService.delete(id);
  }
}
