import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PricesService, UpsertPriceDto } from './prices.service';
import { BillType } from '@xpensive/types';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get()
  findCurrent(@Query('type') type: BillType) {
    return this.pricesService.findCurrentByType(type);
  }

  @Get('history')
  findHistory(@Query('type') type: BillType) {
    return this.pricesService.findHistoryByType(type);
  }

  @Post()
  upsert(@Body() dto: UpsertPriceDto) {
    return this.pricesService.upsert(dto);
  }

  @Put('history/:id')
  updateHistory(@Param('id') id: string, @Body() dto: Partial<UpsertPriceDto>) {
    return this.pricesService.updateHistory(id, dto);
  }
}
