import { Controller, Get, Param, Post, Body, NotFoundException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from '../dto/createWallet.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async createWallet(@Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(dto);
  }

  @Get(':id')
  async getWallet(@Param('id') id: string) {
    console.log('getWallet', id);
    const wallet = await this.walletService.getWallet(id);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }
}


