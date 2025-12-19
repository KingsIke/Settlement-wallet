import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Wallet } from './src/entities/Wallet';
import { Transaction } from './src/entities/Transaction';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true, // use migrations instead of sync
  logging: false,
  entities: [Wallet, Transaction],
  // migrations: ['src/migrations/*.ts'],
  subscribers: []
});

export default AppDataSource;
