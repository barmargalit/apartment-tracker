import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MortgageTracksService, CreateMortgageTrackDto, UpdateMortgageTrackDto } from './mortgage-tracks.service';

@Controller('mortgage-tracks')
export class MortgageTracksController {
  constructor(private readonly mortgageTracksService: MortgageTracksService) {}

  @Get()
  findByPlan(@Query('plan_id') planId: string) {
    return this.mortgageTracksService.findByPlan(planId);
  }

  @Post()
  create(@Body() dto: CreateMortgageTrackDto) {
    return this.mortgageTracksService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMortgageTrackDto) {
    return this.mortgageTracksService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.mortgageTracksService.delete(id);
  }
}
