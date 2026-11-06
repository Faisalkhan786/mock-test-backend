# MockTest Backend

Scalable API for a class 9/10 mock test app.
**Stack:** Node · Express · TypeScript · MySQL (Sequelize) · Redis · (Razorpay later)

## Setup

```bash
cd backend
npm install
cp .env.example .env      # fill DB + Redis details
# make sure MySQL and Redis are running locally
# and the database exists:  CREATE DATABASE mocktest;

npm run migrate           # creates all tables (migrations)
npm run seed              # inserts a free demo test with 3 questions
npm run dev               # starts API on http://localhost:4000
```

> Requirements: MySQL 8+, Redis 6+, Node 18+.

## Try it (demo flow, no payment)

```bash
# 1. Send OTP (demo mode returns the OTP in the response)
curl -X POST localhost:4000/auth/send-otp -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# 2. Verify -> get token
curl -X POST localhost:4000/auth/verify-otp -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"123456"}'

# 3. List tests (use TOKEN from step 2)
curl localhost:4000/tests?class=10&type=mock -H "Authorization: Bearer TOKEN"

# 4. Start the demo test (it's free)
curl -X POST localhost:4000/tests/1/start -H "Authorization: Bearer TOKEN"

# 5. Submit answers  { questionId: chosenIndex }
curl -X POST localhost:4000/tests/attempt/1/submit -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" -d '{"answers":{"1":1,"2":1,"3":1}}'

# Wallet: grab demo credits (₹20 pack, no real money)
curl -X POST localhost:4000/wallet/buy -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" -d '{"packId":"starter"}'
```

## Scale knobs (already wired, flip when needed)
- `DB_READ_HOST` in `.env` → routes reads to a MySQL replica.
- `npm run start:cluster` → PM2 runs one process per CPU core.
- Redis caches test lists (5 min) and powers the leaderboard sorted set.

## Going live with payments
Set `PAYMENT_PROVIDER=razorpay` and implement `RazorpayProvider` (create order +
verify signature). No other wallet code changes.

## Folder map
```
src/
  config/     env, db (pool + replica), redis (cache helper)
  models/     User, Question, Test, TestQuestion, Attempt, WalletTxn
  middlewares/auth (JWT), error handler
  modules/
    auth/     OTP send + verify
    tests/    list, start (anti-cheat), submit (scoring + leaderboard)
    wallet/   credits + pluggable payment providers (demo | razorpay)
  seed.ts     demo data
  server.ts   entrypoint
```
