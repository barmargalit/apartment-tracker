import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PricesController],
  providers: [PricesService],
})
export class PricesModule {}
