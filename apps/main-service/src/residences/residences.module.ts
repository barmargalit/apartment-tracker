import { Module } from '@nestjs/common';
import { ResidencesController } from './residences.controller';
import { ResidencesService } from './residences.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ResidencesController],
  providers: [ResidencesService],
})
export class ResidencesModule {}
