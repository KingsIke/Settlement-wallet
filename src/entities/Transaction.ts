import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique
} from 'typeorm';
import { Wallet } from './Wallet';

export type TransactionType = 'credit' | 'debit' | 'transfer_debit' | 'transfer_credit';

@Entity({ name: 'transactions' })
@Unique(['idempotencyKey'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { nullable: false })
  wallet!: Wallet;

  @Column({ type: 'bigint' })
  amountMinor!: string; // positive amount in minor units

  @Column({ type: 'varchar' })
  type!: TransactionType;

  @Column({ type: 'varchar', nullable: true })
  reference?: string | null;

  @Column({ type: 'varchar' })
  idempotencyKey!: string;

  @CreateDateColumn()
  createdAt!: Date;
}


