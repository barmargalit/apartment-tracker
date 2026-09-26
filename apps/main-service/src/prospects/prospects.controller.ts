import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ProspectsService, CreateProspectDto, UpdateProspectDto } from './prospects.service';

@Controller('prospects')
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}

  @Get()
  findAll() {
    return this.prospectsService.findAll();
  }

  @HttpCode(204)
  @Post('open-file')
  openFile(@Body() body: { path: string }) {
    return this.prospectsService.openFile(body.path);
  }

  @Post()
  create(@Body() dto: CreateProspectDto) {
    return this.prospectsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProspectDto) {
    return this.prospectsService.update(id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.prospectsService.delete(id);
  }
}
