# Prisma Guide

## Generate Prisma Client

```bash
npx prisma generate
Run Migration
npx prisma migrate dev
Open Prisma Studio
npx prisma studio
Decimal Usage

Always use Decimal for money values.

amount Decimal @db.Decimal(15,2)