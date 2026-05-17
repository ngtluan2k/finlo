# Prisma Guide

## Commands

```bash
npm run db:generate   # Generate client → src/generated/prisma
npm run db:migrate    # Apply migrations (dev)
npm run db:seed       # Seed roles & permissions
npm run db:studio     # Prisma Studio UI
```

Hoặc trực tiếp:

```bash
npx prisma migrate dev
npx prisma db seed
npx prisma studio
```

## Environment

DB kết nối qua biến tách trong `.env` (xem `src/lib/database-url.ts`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=finlo
```

## Decimal

Luôn dùng `Decimal` cho tiền:

```prisma
amount Decimal @db.Decimal(15, 2)
```

## Soft delete

Mọi bảng chính có `deleted_at`. Dùng helper `notDeleted` từ `@/lib/db-query`:

```ts
import { notDeleted } from '@/lib/db-query'

await prisma.wallet.findMany({
  where: { userId, ...notDeleted, status: 'ACTIVE' },
})
```

Xóa mềm bản ghi nghiệp vụ:

```ts
import { softDeleteData } from '@/lib/db-query'

await prisma.wallet.update({
  where: { id },
  data: softDeleteData(),
})
```

## Partial unique (đã có trong DB)

Migration `optimize_indexes` tạo partial unique — an toàn khi soft delete:

| Index | Bảng | Cột |
|---|---|---|
| `users_email_active_key` | users | email |
| `users_phone_active_key` | users | phone |
| `users_username_active_key` | users | username |
| `budgets_active_unique_key` | budgets | user_id, category_id, year, month |
| `roles_code_active_key` | roles | code |
| `permissions_code_active_key` | permissions | code |

**CHECK:** `users_login_identifier_check` — bắt buộc có ít nhất một trong `email`, `phone`, `username`.

Prisma schema không khai báo các unique này (chỉ có ở PostgreSQL). Không thêm lại `@@unique` trên các cột trên trong `schema.prisma`.

## Seed

`prisma/seed.ts` tạo:

- **Roles:** `USER` (10), `ADMIN` (50), `SUPER_ADMIN` (100)
- **Permissions:** wallet, category, transaction, budget, profile, attachment, user, role
- **role_permissions:** ADMIN kế thừa USER; SUPER_ADMIN kế thừa ADMIN + USER

Chạy lại seed an toàn (upsert theo `code`):

```bash
npm run db:seed
```

## Đăng ký user

Khi tạo user mới:

1. Tạo `users` (ít nhất 1 identifier)
2. Tạo `profiles` (1:1)
3. Gán `user_roles` → role `USER`

## Reset DB (dev)

Khi xóa nhầm bảng, còn sót enum, hoặc bị drift — chạy một lệnh:

```bash
npm run db:reset
```

Lệnh này: drop schema `public` → `migrate deploy` → `seed`.

File SQL: `prisma/reset-db.sql`

> Chỉ dùng trên database **development** local. Mất toàn bộ data.
