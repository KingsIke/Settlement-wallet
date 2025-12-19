import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWalletAndTransactionTables1713510000000 implements MigrationInterface {
  name = 'CreateWalletAndTransactionTables1713510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "wallets" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "ownerEmail" character varying NOT NULL,
      "balanceMinor" bigint NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT "PK_wallets_id" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_wallets_ownerEmail" UNIQUE ("ownerEmail")
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "transactions" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "walletId" uuid NOT NULL,
      "amountMinor" bigint NOT NULL,
      "type" character varying NOT NULL,
      "reference" character varying,
      "idempotencyKey" character varying NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT "PK_transactions_id" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_transactions_idempotencyKey" UNIQUE ("idempotencyKey"),
      CONSTRAINT "FK_transactions_walletId_wallets_id" FOREIGN KEY ("walletId")
        REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "transactions"');
    await queryRunner.query('DROP TABLE IF EXISTS "wallets"');
  }
}
