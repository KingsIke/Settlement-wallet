// src/data-source.ts
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: ['src/wallet/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});