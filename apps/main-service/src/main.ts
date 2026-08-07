import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(require('express').json({ limit: '10mb' }));
  app.enableCors();
  await app.listen(3001);
  console.log("API running on http://localhost:3001");
}

bootstrap();
