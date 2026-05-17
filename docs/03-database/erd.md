# ERD

## Auth & RBAC

```
roles
  ├── parent_role (self-reference)
  ├── role_permissions → permissions
  └── user_roles → users

users
  ├── profile (1:1)
  ├── attachments
  ├── user_roles → roles
  └── assigned_by (user_roles) → users
```

## Files (polymorphic)

```
attachments
  └── user (owner)
  └── entity_type + entity_id → USER | PROFILE | TRANSACTION | WALLET | BUDGET | RECURRING_TRANSACTION
```

## Finance (per user)

```
users
  └── wallets
  └── categories
  └── transactions
  └── budgets
  └── recurring_transactions

wallets
  └── transactions
  └── recurring_transactions
  └── attachments (entity_type = WALLET)

categories
  └── transactions
  └── budgets
  └── recurring_transactions

transactions
  └── attachments (entity_type = TRANSACTION, e.g. receipts)
```
