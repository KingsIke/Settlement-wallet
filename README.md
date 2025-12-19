## Wallet Service

Simple wallet backend service built with **TypeScript**, **Express**, **PostgreSQL**, and **TypeORM**.

### Features

- **Create Wallet**: `POST /wallets`
- **Credit/Debit Wallet**: `POST /transactions`
- **Transfer Between Wallets**: `POST /transactions/transfer` (atomic debit + credit)
- **Get Wallet Details**: `GET /wallets/:id`
- **Idempotency**: Enforced via a stored `idempotencyKey` on transactions.
- **Concurrency-safe**: Pessimistic database locks and SQL transactions.
- **Money in minor units**: Stored as `bigint` integers.

### Prerequisites

- Node.js and npm
- PostgreSQL running locally

### Setup

1. **Install dependencies**

```bash
cd /Users/flick/Documents/9jasettlement
npm install
```

2. **Configure database**

Create a PostgreSQL database, e.g. `wallet_db`, and set `DATABASE_URL`:

```bash
export DATABASE_URL=postgresql://db_9jasettlement_user:d4ZSiQh6O6ukyZadfZmOwlvl1rNYVE4B@dpg-d51qo26mcj7s73eiaejg-a/db_9jasettlement
export PORT=3000
```

3. **Run the service**

```bash
npm run dev
```

### API Examples (cURL)

- **Create Wallet**

```bash
curl -X POST http://localhost:3000/wallets \
  -H "Content-Type: application/json" \
  -d '{"ownerEmail":"user@example.com"}'
```

- **Get Wallet**

```bash
curl http://localhost:3000/wallets/<walletId>
```

- **Credit Wallet**

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "<walletId>",
    "amountMinor": 1000,
    "type": "credit",
    "idempotencyKey": "credit-1000-1"
  }'
```

- **Debit Wallet (fails if insufficient funds)**

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "<walletId>",
    "amountMinor": 500,
    "type": "debit",
    "idempotencyKey": "debit-500-1"
  }'
```

- **Transfer Between Wallets**

```bash
curl -X POST http://localhost:3000/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromWalletId": "<walletA>",
    "toWalletId": "<walletB>",
    "amountMinor": 200,
    "idempotencyKey": "transfer-A-B-200-1"
  }'
```

Re-using the same `idempotencyKey` on the same operation will **not** apply the transaction twice; it returns the existing persisted result.


