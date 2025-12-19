import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/Wallet';
import { Transaction } from './entities/Transaction';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Wallet, Transaction],
        synchronize: true,
        logging: config.get<string>('NODE_ENV') === 'development',
        ssl: true, 
        extra: {
          ssl: {
            rejectUnauthorized: false, 
          },
        },
      })
    }),
    WalletModule
  ]
})
export class AppModule {}


