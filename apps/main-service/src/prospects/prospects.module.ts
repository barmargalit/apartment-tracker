import { Module } from '@nestjs/common';
import { ProspectsController } from './prospects.controller';
import { ProspectsService } from './prospects.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProspectsController],
  providers: [ProspectsService],
})
export class ProspectsModule {}
