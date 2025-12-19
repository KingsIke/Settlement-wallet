import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../entities/Wallet';
import { Transaction } from '../entities/Transaction';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction])],
  controllers: [WalletController, TransactionController],
  providers: [WalletService],
  exports: [WalletService]
})
export class WalletModule {}


