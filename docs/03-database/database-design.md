# Database Design

## Main Tables

- users
- wallets
- categories
- transactions
- budgets
- recurring_transactions

---

## users

| Column | Type |
|---|---|
| id | uuid |
| email | varchar |
| password | varchar |
| full_name | varchar |

---

## wallets

| Column | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| name | varchar |
| balance | decimal |
| type | varchar |

---

## categories

| Column | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| name | varchar |
| type | varchar |

---

## transactions

| Column | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| wallet_id | uuid |
| category_id | uuid |
| amount | decimal |
| type | varchar |
| note | text |
| transaction_date | timestamp |