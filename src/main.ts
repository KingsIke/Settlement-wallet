import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
        }));
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        });
      },
    })
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true, 
  });
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`Nest application is running on port ${port}`);
}

bootstrap();


