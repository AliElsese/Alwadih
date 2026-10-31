import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';

const server: Express = express();
let isAppInitialized = false;

async function bootstrap() {
  if (!isAppInitialized) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    isAppInitialized = true;
  }
  return server;
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  server(req, res);
}

if (process.env.NODE_ENV !== 'production') {
  void bootstrap().then(() => {
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server ready on port ${port}`);
    });
  });
}