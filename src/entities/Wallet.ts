import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { Transaction } from './Transaction';

@Entity({ name: 'wallets' })
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;


  @Index({ unique: true })
  @Column()
  ownerEmail!: string;

  @Column({ type: 'bigint', default: 0 })
  balanceMinor!: string; // store as string for bigint

  @OneToMany(() => Transaction, (tx) => tx.wallet)
  transactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


