import { Module } from '@nestjs/common';
import { UsagesController } from './usages.controller';
import { UsagesService } from './usages.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsagesController],
  providers: [UsagesService],
})
export class UsagesModule {}
