import { IsIn, IsInt, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';


export class CreateTransactionDto {
  @IsUUID()
  walletId!: string;

  @IsInt()
  @IsPositive()
  amountMinor!: number;

  @IsIn(['credit', 'debit'])
  type!: 'credit' | 'debit';

  @IsString()
  idempotencyKey!: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

export class TransferDto {
  @IsUUID()
  fromWalletId!: string;

  @IsUUID()
  toWalletId!: string;

  @IsInt()
  @IsPositive()
  amountMinor!: number;

  @IsString()
  idempotencyKey!: string;
}


