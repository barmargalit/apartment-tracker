import { Module } from '@nestjs/common';
import { MortgagePlansController } from './mortgage-plans.controller';
import { MortgagePlansService } from './mortgage-plans.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MortgagePlansController],
  providers: [MortgagePlansService],
})
export class MortgagePlansModule {}
