import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';

const server: Express = express();
let app: INestApplication;

async function bootstrap(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.enableCors();

    await app.init();
  }
  return app;
}

// In standalone / local environment
if (!process.env.VERCEL) {
  void (async () => {
    const application = await bootstrap();
    const port = process.env.PORT ?? 8000;
    await application.listen(port, '0.0.0.0');
    console.log(`Application is running on port ${port}`);
  })();
}

// Serverless handler for Vercel
export default async function handler(req: any, res: any) {
  await bootstrap();
  server(req, res);
}
