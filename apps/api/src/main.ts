import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';
import { syncDevDatabaseUrl } from './bootstrap/sync-database-url';

async function bootstrap() {
  syncDevDatabaseUrl();

  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use('/iclock', express.text({ type: '*/*', limit: '10mb' }));

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'iclock/cdata', method: RequestMethod.ALL },
      { path: 'iclock/getrequest', method: RequestMethod.ALL },
      { path: 'iclock/ping', method: RequestMethod.ALL },
      { path: 'iclock/devicecmd', method: RequestMethod.ALL },
    ],
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ERP Qalam API')
    .setDescription('School ERP — Registration module')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on 0.0.0.0:${port}`);
}

bootstrap();
