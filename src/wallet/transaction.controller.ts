import { Body, Controller, HttpCode, HttpStatus, Post, BadRequestException, NotFoundException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateTransactionDto, TransferDto } from '../dto/transaction.dto';

@Controller()
export class TransactionController {
  constructor(private readonly walletService: WalletService) {}

  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  async applyTransaction(@Body() dto: CreateTransactionDto) {

      return await this.walletService.applyTransaction(dto);
 
  }

  @Post('transactions/transfer')
  @HttpCode(HttpStatus.CREATED)
  async transfer(@Body() dto: TransferDto) {
 
      return await this.walletService.transfer(dto);
  
  }
}


