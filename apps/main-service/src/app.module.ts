import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { BillsModule } from "./bills/bills.module";
import { ProvidersModule } from "./providers/providers.module";
import { ProspectsModule } from "./prospects/prospects.module";
import { ResidencesModule } from "./residences/residences.module";
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
