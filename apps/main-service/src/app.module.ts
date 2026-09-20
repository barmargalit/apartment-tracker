import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { BillsModule } from "./bills/bills.module";
import { ProvidersModule } from "./providers/providers.module";
import { ProspectsModule } from "./prospects/prospects.module";
import { ResidencesModule } from "./residences/residences.module";
import { BanksModule } from "./banks/banks.module";
import { MortgagePlansModule } from "./mortgage-plans/mortgage-plans.module";
import { MortgageTracksModule } from "./mortgage-tracks/mortgage-tracks.module";
import { UsagesModule } from "./usages/usages.module";
import { PricesModule } from "./prices/prices.module";
import { ContractsModule } from "./contracts/contracts.module";
import { ResidentsModule } from "./residents/residents.module";
import config from "./config";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    DatabaseModule,
    BillsModule,
    ProvidersModule,
    ProspectsModule,
    ResidencesModule,
    BanksModule,
    MortgagePlansModule,
    MortgageTracksModule,
    UsagesModule,
    PricesModule,
    ContractsModule,
    ResidentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
