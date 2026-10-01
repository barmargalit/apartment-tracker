import { Module } from '@nestjs/common';
import { ContractOffersController } from './contract-offers.controller';
import { ContractOffersService } from './contract-offers.service';
import { DatabaseModule } from '../database/database.module';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [DatabaseModule, ContractsModule],
  controllers: [ContractOffersController],
  providers: [ContractOffersService],
})
export class ContractOffersModule {}
