import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import { mw } from 'request-ip';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create((await import('./app.module')).AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      disableErrorMessages: process.env.NODE_ENV === 'production'
    })
  );
  app.use(helmet());
  app.use(mw());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
