import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../entities/Wallet';
import { Transaction} from '../entities/Transaction';
import { CreateWalletDto } from '../dto/createWallet.dto';
import { CreateTransactionDto, TransferDto } from '../dto/transaction.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    private readonly dataSource: DataSource
  ) {}

  async createWallet(dto: CreateWalletDto): Promise<Wallet> {
    try {

      const existing = await this.walletRepo.findOne({
        where: { ownerEmail: dto.ownerEmail },
      });
    
      if (existing) {
        throw new ConflictException('Email already has a wallet');
      }

      const wallet = this.walletRepo.create({
        ownerEmail: dto.ownerEmail,
        balanceMinor: '0'
      });

      const saved = await this.walletRepo.save(wallet);
      this.logger.log(`Wallet created: ${saved.id}`);

      return saved;
    } catch (error:any) {
      this.logger.error('Failed to create wallet', error.stack);
      if (error.code === '23505') {
        throw new ConflictException('Email already has a wallet');
      }
    
      throw error;
    }
  }

  async getWallet(id: string): Promise<Wallet | null> {
    try {
      const wallet = await this.walletRepo.findOne({ where: { id } });

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }
  
      return wallet;
    } catch (error:any) {
      this.logger.error(`Failed to fetch wallet ${id}`, error.stack);
      throw new BadRequestException(`wallet ${id} error`);

    }
  }

  async applyTransaction(
    dto: CreateTransactionDto
  ): Promise<{ wallet: Wallet; transaction: Transaction }> {
    try {
     return await this.dataSource.transaction(async (manager) => {
        const walletRepo = manager.getRepository(Wallet);
        const txRepo = manager.getRepository(Transaction);
  
        const existing = await txRepo.findOne({
          where: { idempotencyKey: dto.idempotencyKey },
          relations: ['wallet'],
        });
  
        if (existing) {
          this.logger.warn(`Idempotent transaction reused: ${dto.idempotencyKey}`);
          throw new ConflictException('Idempotent transaction reused');
        }
  
        const wallet = await walletRepo.findOne({
          where: { id: dto.walletId },
          lock: { mode: 'pessimistic_write' },
        });
  
        if (!wallet) {
          throw new NotFoundException('Wallet not found');
        }
  
        const currentBalance = BigInt(wallet.balanceMinor);
        const amount = BigInt(dto.amountMinor);
  
        let newBalance: bigint;
  
        if (dto.type === 'credit') {
          newBalance = currentBalance + amount;
        } else {
          if (currentBalance - amount < 0n) {
            throw new BadRequestException('Insufficient funds');
          }
          newBalance = currentBalance - amount;
        }
  
        wallet.balanceMinor = newBalance.toString();
        await walletRepo.save(wallet);
  
        const tx = txRepo.create({
          wallet,
          amountMinor: amount.toString(),
          type: dto.type,
          reference: dto.reference,
          idempotencyKey: dto.idempotencyKey,
        });
  
        const savedTx = await txRepo.save(tx);
        this.logger.log(
          `Transaction ${savedTx.id} applied to wallet ${wallet.id}`
        );
  
        return { wallet, transaction: savedTx };
      });
    } catch (error:any) {
      this.logger.error(
        `Failed to apply transaction (key=${dto.idempotencyKey})`,
        error.stack
      );
      throw error;
    }
  }

  async transfer(dto: TransferDto): Promise<{ from: Wallet; to: Wallet }> {
    try {
      if (dto.fromWalletId === dto.toWalletId) {
        throw new BadRequestException('Cannot transfer to the same wallet');
      }
  
      return await this.dataSource.transaction(async (manager) => {
        const walletRepo = manager.getRepository(Wallet);
        const txRepo = manager.getRepository(Transaction);
  
        const existing = await txRepo.findOne({
          where: { idempotencyKey: dto.idempotencyKey },
  relations: ['wallet'],

        });
  
        if (existing) {
          this.logger.warn(`Idempotent transfer reused: ${dto.idempotencyKey}`);
          throw new ConflictException('Idempotent transfer reused');
        }
  
        const [fromWallet, toWallet] = await Promise.all([
          walletRepo.findOne({
            where: { id: dto.fromWalletId },
            lock: { mode: 'pessimistic_write' },
          }),
          walletRepo.findOne({
            where: { id: dto.toWalletId },
            lock: { mode: 'pessimistic_write' },
          }),
        ]);
  
        if (!fromWallet || !toWallet) {
          throw new NotFoundException('One or both wallets not found');
        }
  
        const amount = BigInt(dto.amountMinor);
        const fromBal = BigInt(fromWallet.balanceMinor);
  
        if (fromBal - amount < 0n) {
          throw new BadRequestException('Insufficient funds');
        }
  
        fromWallet.balanceMinor = (fromBal - amount).toString();
        toWallet.balanceMinor = (BigInt(toWallet.balanceMinor) + amount).toString();
  
        await walletRepo.save([fromWallet, toWallet]);
  
        await txRepo.save([
          txRepo.create({
            wallet: fromWallet,
            amountMinor: amount.toString(),
            type: 'transfer_debit',
            idempotencyKey: dto.idempotencyKey,
            reference: `to ${toWallet.id}`,
          }),
          txRepo.create({
            wallet: toWallet,
            amountMinor: amount.toString(),
            type: 'transfer_credit',
            idempotencyKey: `${dto.idempotencyKey}:credit`,
            reference: `from ${fromWallet.id}`,
          }),
        ]);
  
        return { from: fromWallet, to: toWallet };
      });
    } catch (error:any) {
      this.logger.error(
        `Failed to transfer funds (key=${dto.idempotencyKey})`,
        error.stack
      );
      throw error;
    }
  }
}
