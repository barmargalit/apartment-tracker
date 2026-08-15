import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsagesService, CreateUsageDto } from './usages.service';
import { BillType } from './usage.entity';

@Controller('usages')
export class UsagesController {
  constructor(private readonly usagesService: UsagesService) {}

  @Get('bounds')
  getBounds(@Query('type') type: BillType) {
    return this.usagesService.getBounds(type);
  }

  @Get()
  findByType(
    @Query('type') type: BillType,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.usagesService.findByType({ type, from, to });
  }

  @Post()
  createMany(@Body() dtos: CreateUsageDto[]) {
    return this.usagesService.createMany(dtos);
  }
}
