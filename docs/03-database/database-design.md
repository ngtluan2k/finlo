# Database Design

## Main Tables

### Identity & files

- users
- profiles
- attachments

### Core finance

- wallets
- categories
- transactions
- budgets
- recurring_transactions

### Auth & RBAC

- roles
- permissions
- role_permissions
- user_roles

---

## Conventions

### Timestamps (mọi bảng)

| Column | Type | Mô tả |
|---|---|---|
| created_at | timestamp | Thời điểm tạo |
| updated_at | timestamp | Thời điểm cập nhật gần nhất |

### Soft delete (mọi bảng)

| Column | Type | Mô tả |
|---|---|---|
| deleted_at | timestamp, nullable | `NULL` = bản ghi còn hiệu lực; có giá trị = đã xóa mềm |

**Quy tắc truy vấn:** mặc định luôn lọc `deleted_at IS NULL`.

**Unique khi soft delete:** dùng **partial unique index** (PostgreSQL) — chỉ áp dụng khi `deleted_at IS NULL`. Đã triển khai trong migration `optimize_indexes`.

**Ràng buộc đăng nhập (DB):** `users_login_identifier_check` — phải có ít nhất một trong `email`, `phone`, `username`.

### Chuẩn status theo nhóm bảng

| Nhóm bảng | Enum | Giá trị | Mô tả |
|---|---|---|---|
| users | `UserStatus` | `PENDING_VERIFICATION`, `ACTIVE`, `INACTIVE`, `SUSPENDED` | Vòng đời tài khoản |
| profiles | `RecordStatus` | `ACTIVE`, `INACTIVE`, `ARCHIVED` | Hồ sơ cá nhân |
| attachments | `AttachmentStatus` | `UPLOADING`, `ACTIVE`, `FAILED`, `ARCHIVED` | Vòng đời file upload |
| roles, permissions | `RoleStatus` / `PermissionStatus` | `ACTIVE`, `INACTIVE` | Bật/tắt vai trò hoặc quyền |
| wallets, categories, budgets, recurring_transactions | `RecordStatus` | `ACTIVE`, `INACTIVE`, `ARCHIVED` | Dữ liệu nghiệp vụ cá nhân |
| transactions | `TransactionStatus` | `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED` | Trạng thái giao dịch |

**Gợi ý chuyển trạng thái**

- `RecordStatus`: `ACTIVE` ↔ `INACTIVE` → `ARCHIVED`
- `TransactionStatus`: `PENDING` → `COMPLETED` | `FAILED` | `CANCELLED`
- `UserStatus`: `PENDING_VERIFICATION` → `ACTIVE` → `INACTIVE` | `SUSPENDED`

---

## users

Chỉ lưu **thông tin xác thực & trạng thái tài khoản**. Thông tin cá nhân nằm ở `profiles`.

Đăng nhập bằng **email**, **phone** hoặc **username** (ít nhất một trong ba phải có).

| Column | Type | Mô tả |
|---|---|---|
| id | uuid | PK |
| email | varchar, nullable, unique* | Email đăng nhập |
| phone | varchar, nullable, unique* | SĐT (E.164 khuyến nghị, vd `+84901234567`) |
| username | varchar, nullable, unique* | Tên đăng nhập |
| password_hash | varchar | Mật khẩu đã hash (bcrypt) |
| status | UserStatus | Mặc định `PENDING_VERIFICATION` |
| email_verified_at | timestamp, nullable | Xác thực email |
| phone_verified_at | timestamp, nullable | Xác thực SĐT |
| last_login_at | timestamp, nullable | Lần đăng nhập gần nhất |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp, nullable | Soft delete |

**Index DB (đã áp dụng):**

- `users_email_active_key`, `users_phone_active_key`, `users_username_active_key`
- `users_login_lookup_idx` — `(email, phone, username)` WHERE `deleted_at IS NULL AND status = 'ACTIVE'`

**Đăng nhập:** dùng `activeUserWhere()` từ `src/lib/db-query.ts` hoặc SQL tương đương.

**Quan hệ:** `users` 1—1 `profiles`; `users` 1—N `attachments`.

---

## profiles

Hồ sơ cá nhân, tách khỏi bảng đăng nhập.

| Column | Type | Mô tả |
|---|---|---|
| id | uuid | PK |
| user_id | uuid, unique, FK → users.id | Mỗi user một profile |
| full_name | varchar | Họ tên |
| display_name | varchar, nullable | Tên hiển thị |
| bio | text, nullable | Giới thiệu ngắn |
| date_of_birth | date, nullable | Ngày sinh |
| gender | enum Gender, nullable | `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY` |
| address | varchar, nullable | Địa chỉ |
| city | varchar, nullable | Thành phố |
| country | varchar(2), nullable | Mã quốc gia ISO (vd `VN`) |
| locale | varchar | Mặc định `vi` |
| timezone | varchar | Mặc định `Asia/Ho_Chi_Minh` |
| avatar_url | varchar, nullable | URL ảnh đại diện (cache/CDN); file gốc lưu qua `attachments` |
| status | RecordStatus | Mặc định `ACTIVE` |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp, nullable | Soft delete |

Tạo profile cùng lúc khi đăng ký user.

---

## attachments

Lưu metadata file/tài liệu (blob thực tế trên S3, Supabase Storage, …).

| Column | Type | Mô tả |
|---|---|---|
| id | uuid | PK |
| user_id | uuid, FK → users.id | Chủ sở hữu file |
| entity_type | AttachmentEntityType | Thực thể gắn file |
| entity_id | uuid | ID bản ghi đích |
| category | AttachmentCategory | Loại file |
| file_name | varchar | Tên file gốc |
| storage_key | varchar | Key/path trên storage |
| mime_type | varchar | VD: `image/jpeg`, `application/pdf` |
| size_bytes | bigint | Kích thước (bytes) |
| url | varchar, nullable | URL truy cập (CDN/signed) |
| status | AttachmentStatus | Mặc định `UPLOADING` |
| metadata | json, nullable | Thêm: width, height, checksum, … |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp, nullable | Soft delete |

**entity_type**

| Giá trị | Gắn vào |
|---|---|
| `USER` | Tài liệu chung của user |
| `PROFILE` | File hồ sơ (avatar, CMND, …) |
| `TRANSACTION` | Hóa đơn, biên lai giao dịch |
| `WALLET` | Tài liệu ví |
| `BUDGET` | Báo cáo ngân sách |
| `RECURRING_TRANSACTION` | File định kỳ |

**category**

| Giá trị | Mô tả |
|---|---|
| `RECEIPT` | Biên lai / hóa đơn |
| `INVOICE` | Hóa đơn VAT |
| `CONTRACT` | Hợp đồng |
| `AVATAR` | Ảnh đại diện |
| `ID_DOCUMENT` | Giấy tờ tùy thân |
| `REPORT` | Báo cáo xuất file |
| `OTHER` | Khác |

**Luồng upload:** `UPLOADING` → `ACTIVE` | `FAILED`. Xóa mềm → `ARCHIVED` + `deleted_at`.

**Ví dụ:** hóa đơn giao dịch — `entity_type = TRANSACTION`, `entity_id = <transaction.id>`, `category = RECEIPT`.

---

## roles

Phân cấp quyền qua `level` (số càng **cao** = quyền càng **lớn**).

| Column | Type | Mô tả |
|---|---|---|
| id | uuid | PK |
| code | varchar, unique | Mã cố định: `USER`, `ADMIN`, `SUPER_ADMIN` |
| name | varchar | Tên hiển thị |
| description | text, nullable | |
| level | int | Thứ bậc (vd USER=10, ADMIN=50, SUPER_ADMIN=100) |
| parent_role_id | uuid, nullable, FK → roles.id | Kế thừa phân cấp (tùy chọn) |
| status | RoleStatus | Mặc định `ACTIVE` |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp, nullable | |

**Vai trò mặc định (seed)**

| code | level |
|---|---|
| USER | 10 |
| ADMIN | 50 |
| SUPER_ADMIN | 100 |

---

## permissions

| Column | Type | Mô tả |
|---|---|---|
| id | uuid | PK |
| code | varchar, unique | VD: `wallet:read`, `transaction:create` |
| name | varchar | Tên hiển thị |
| module | varchar | Nhóm: `wallet`, `transaction`, `user`, … |
| action | varchar | `create`, `read`, `update`, `delete`, `manage` |
| description | text, nullable | |
| status | PermissionStatus | Mặc định `ACTIVE` |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp, nullable | |

---

## role_permissions

| Column | Type | Mô tả |
|---|---|---|
| role_id | uuid, FK → roles.id | |
| permission_id | uuid, FK → permissions.id | |
| created_at | timestamp | |

PK: `(role_id, permission_id)`

---

## user_roles

| Column | Type | Mô tả |
|---|---|---|
| user_id | uuid, FK → users.id | |
| role_id | uuid, FK → roles.id | |
| assigned_at | timestamp | Thời điểm gán |
| assigned_by | uuid, nullable, FK → users.id | Người gán (admin) |

PK: `(user_id, role_id)`

Mỗi user có ít nhất role `USER` khi đăng ký.

**Kiểm tra quyền:** user có permission nếu tồn tại role `ACTIVE` (chưa xóa) gắn với user và role đó có permission tương ứng; so sánh `role.level` khi cần phân cấp.

---

## wallets

| Column | Type | Mô tả |
|---|---|---|
| id | uuid | PK |
| user_id | uuid, FK → users.id | |
| name | varchar | |
| balance | decimal(15,2) | |
| type | varchar / enum WalletType | `CASH`, `BANK`, `E_WALLET`, `CREDIT_CARD`, `OTHER` |
| status | RecordStatus | Mặc định `ACTIVE` |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp, nullable | |

---

## categories

| Column | Type | Mô tả |
|---|---|---|
| id | uuid | PK |
| user_id | uuid, FK → users.id | |
| name | varchar | |
| type | varchar / enum CategoryType | `INCOME`, `EXPENSE` |
| status | RecordStatus | Mặc định `ACTIVE` |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp, nullable | |

---

## transactions

| Column | Type | Mô tả |
|---|---|---|
| id | uuid | PK |
| user_id | uuid, FK → users.id | |
| wallet_id | uuid, FK → wallets.id | |
| category_id | uuid, nullable, FK → categories.id | Nullable cho `TRANSFER` |
| amount | decimal(15,2) | |
| type | enum TransactionType | `INCOME`, `EXPENSE`, `TRANSFER` |
| status | TransactionStatus | Mặc định `COMPLETED` |
| note | text, nullable | |
| transaction_date | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp, nullable | |

---

## budgets

| Column | Type | Mô tả |
|---|---|---|
| id | uuid | PK |
| user_id | uuid, FK → users.id | |
| category_id | uuid, FK → categories.id | |
| amount | decimal(15,2) | Hạn mức tháng |
| year | int | |
| month | int | 1–12 |
| status | RecordStatus | Mặc định `ACTIVE` |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp, nullable | |

**Unique DB:** `budgets_active_unique_key` trên `(user_id, category_id, year, month)` WHERE `deleted_at IS NULL`.

---

## recurring_transactions

| Column | Type | Mô tả |
|---|---|---|
| id | uuid | PK |
| user_id | uuid, FK → users.id | |
| wallet_id | uuid, FK → wallets.id | |
| category_id | uuid, FK → categories.id | |
| amount | decimal(15,2) | |
| type | enum TransactionType | |
| status | RecordStatus | Mặc định `ACTIVE` (thay cho `is_active`) |
| note | text, nullable | |
| frequency | enum | `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY` |
| next_run_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp, nullable | |

---

## Indexes & constraints (đã triển khai)

| Loại | Chi tiết |
|---|---|
| Timestamps + soft delete | Mọi bảng chính: `created_at`, `updated_at`, `deleted_at` + index `deleted_at` |
| Partial unique | `users` (email, phone, username), `budgets` (tháng), `roles.code`, `permissions.code` |
| CHECK | `users_login_identifier_check` |
| Lookup | `users_login_lookup_idx` cho đăng nhập |
| RBAC | `roles.level`, `roles.parent_role_id`; FK trên junction tables |
| Finance | `transactions.transaction_date`, composite theo `user_id` |

## Seed dữ liệu hệ thống

Chạy `npm run db:seed` sau migration.

| Role | level | Permissions |
|---|---|---|
| USER | 10 | CRUD ví, danh mục, giao dịch, ngân sách; profile; attachment |
| ADMIN | 50 | USER + `user:read`, `role:read`, `permission:read` |
| SUPER_ADMIN | 100 | ADMIN + `user:manage`, `role:manage` |

Gán role `USER` cho mỗi user khi đăng ký (`user_roles`).
