# Expense Tracker Take Home

Minimal full-stack expense tracker with retry-safe expense creation using idempotency keys.

## Stack
- Backend: Node.js, Express, SQLite, Prisma
- Frontend: React + Vite

## Features
- Add expense
- List expenses
- Filter by category
- Sort newest first
- Total visible expenses
- Duplicate submit / retry safe

## Run Backend
cd backend
npm install
npx prisma migrate dev --name init
node server.js

## Run Frontend
cd frontend
npm install
npm run dev

## Design choices
SQLite chosen for simplicity + persistence.
Amounts use Decimal in DB.
Idempotency key prevents duplicates under retries.
