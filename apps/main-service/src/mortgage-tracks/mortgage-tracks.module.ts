import { Module } from '@nestjs/common';
import { MortgageTracksController } from './mortgage-tracks.controller';
import { MortgageTracksService } from './mortgage-tracks.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MortgageTracksController],
  providers: [MortgageTracksService],
})
export class MortgageTracksModule {}
