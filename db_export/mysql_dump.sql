CREATE DATABASE IF NOT EXISTS if0_41936306_finlo
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE if0_41936306_finlo;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


CREATE TABLE _prisma_migrations (
    id VARCHAR(36) NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    finished_at DATETIME,
    migration_name VARCHAR(255) NOT NULL,
    logs TEXT,
    rolled_back_at DATETIME,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    applied_steps_count INT DEFAULT 0 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attachments (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id CHAR(36) NOT NULL,
    category VARCHAR(50) DEFAULT 'OTHER' NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    url VARCHAR(1000),
    status VARCHAR(50) DEFAULT 'UPLOADING' NOT NULL,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE budgets (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
    id CHAR(36) NOT NULL,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE profiles (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    display_name VARCHAR(255),
    bio TEXT,
    date_of_birth DATE,
    gender VARCHAR(50),
    address VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(2),
    locale VARCHAR(10) DEFAULT 'vi' NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh' NOT NULL,
    avatar_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recurring_transactions (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    wallet_id CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    note TEXT,
    frequency VARCHAR(50) NOT NULL,
    next_run_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roles (
    id CHAR(36) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    level INT DEFAULT 10 NOT NULL,
    parent_role_id CHAR(36),
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE transactions (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    wallet_id CHAR(36) NOT NULL,
    category_id CHAR(36),
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED' NOT NULL,
    note TEXT,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
    user_id CHAR(36) NOT NULL,
    role_id CHAR(36) NOT NULL,
    assigned_by CHAR(36),
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id CHAR(36) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    username VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION' NOT NULL,
    email_verified_at DATETIME,
    phone_verified_at DATETIME,
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE verification_tokens (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    target VARCHAR(255) NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wallets (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0 NOT NULL,
    type VARCHAR(50) DEFAULT 'CASH' NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE _prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);

ALTER TABLE attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);

ALTER TABLE budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);

ALTER TABLE categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

ALTER TABLE permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);

ALTER TABLE profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE recurring_transactions
    ADD CONSTRAINT recurring_transactions_pkey PRIMARY KEY (id);

ALTER TABLE role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);

ALTER TABLE roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);

ALTER TABLE transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);

ALTER TABLE user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);

ALTER TABLE users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE verification_tokens
    ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (id);

ALTER TABLE wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);

CREATE INDEX attachments_deleted_at_idx ON attachments (deleted_at);

CREATE INDEX attachments_entity_type_entity_id_idx ON attachments (entity_type, entity_id);

CREATE INDEX attachments_status_idx ON attachments (status);

CREATE INDEX attachments_user_id_category_idx ON attachments (user_id, category);

CREATE INDEX attachments_user_id_idx ON attachments (user_id);

CREATE UNIQUE INDEX budgets_active_unique_key ON budgets (user_id, category_id, year, month);

CREATE INDEX budgets_deleted_at_idx ON budgets (deleted_at);

CREATE INDEX budgets_status_idx ON budgets (status);

CREATE INDEX budgets_user_id_category_id_year_month_idx ON budgets (user_id, category_id, year, month);

CREATE INDEX budgets_user_id_idx ON budgets (user_id);

CREATE INDEX budgets_user_id_year_month_idx ON budgets (user_id, year, month);

CREATE INDEX categories_deleted_at_idx ON categories (deleted_at);

CREATE INDEX categories_user_id_idx ON categories (user_id);

CREATE INDEX categories_user_id_status_idx ON categories (user_id, status);

CREATE INDEX categories_user_id_type_idx ON categories (user_id, type);

CREATE UNIQUE INDEX permissions_code_active_key ON permissions (code);

CREATE INDEX permissions_code_idx ON permissions (code);

CREATE INDEX permissions_deleted_at_idx ON permissions (deleted_at);

CREATE INDEX permissions_module_idx ON permissions (module);

CREATE INDEX permissions_status_idx ON permissions (status);

CREATE INDEX profiles_deleted_at_idx ON profiles (deleted_at);

CREATE INDEX profiles_status_idx ON profiles (status);

CREATE UNIQUE INDEX profiles_user_id_key ON profiles (user_id);

CREATE INDEX recurring_transactions_deleted_at_idx ON recurring_transactions (deleted_at);

CREATE INDEX recurring_transactions_next_run_at_idx ON recurring_transactions (next_run_at);

CREATE INDEX recurring_transactions_status_idx ON recurring_transactions (status);

CREATE INDEX recurring_transactions_user_id_idx ON recurring_transactions (user_id);

CREATE INDEX role_permissions_permission_id_idx ON role_permissions (permission_id);

CREATE UNIQUE INDEX roles_code_active_key ON roles (code);

CREATE INDEX roles_code_idx ON roles (code);

CREATE INDEX roles_deleted_at_idx ON roles (deleted_at);

CREATE INDEX roles_level_idx ON roles (level);

CREATE INDEX roles_parent_role_id_idx ON roles (parent_role_id);

CREATE INDEX roles_status_idx ON roles (status);

CREATE INDEX transactions_category_id_idx ON transactions (category_id);

CREATE INDEX transactions_deleted_at_idx ON transactions (deleted_at);

CREATE INDEX transactions_status_idx ON transactions (status);

CREATE INDEX transactions_transaction_date_idx ON transactions (transaction_date);

CREATE INDEX transactions_user_id_idx ON transactions (user_id);

CREATE INDEX transactions_wallet_id_idx ON transactions (wallet_id);

CREATE INDEX user_roles_assigned_by_idx ON user_roles (assigned_by);

CREATE INDEX user_roles_role_id_idx ON user_roles (role_id);

CREATE INDEX users_deleted_at_idx ON users (deleted_at);

CREATE UNIQUE INDEX users_email_active_key ON users (email);

CREATE INDEX users_email_idx ON users (email);

CREATE INDEX users_login_lookup_idx ON users (email, phone, username);

CREATE UNIQUE INDEX users_phone_active_key ON users (phone);

CREATE INDEX users_phone_idx ON users (phone);

CREATE INDEX users_status_idx ON users (status);

CREATE UNIQUE INDEX users_username_active_key ON users (username);

CREATE INDEX users_username_idx ON users (username);

CREATE INDEX verification_tokens_expires_at_idx ON verification_tokens (expires_at);

CREATE INDEX verification_tokens_token_hash_idx ON verification_tokens (token_hash);

CREATE INDEX verification_tokens_user_id_channel_idx ON verification_tokens (user_id, channel);

CREATE INDEX wallets_deleted_at_idx ON wallets (deleted_at);

CREATE INDEX wallets_user_id_idx ON wallets (user_id);

CREATE INDEX wallets_user_id_status_idx ON wallets (user_id, status);

ALTER TABLE attachments
    ADD CONSTRAINT attachments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE budgets
    ADD CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE budgets
    ADD CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE recurring_transactions
    ADD CONSTRAINT recurring_transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE recurring_transactions
    ADD CONSTRAINT recurring_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE recurring_transactions
    ADD CONSTRAINT recurring_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE roles
    ADD CONSTRAINT roles_parent_role_id_fkey FOREIGN KEY (parent_role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE user_roles
    ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE verification_tokens
    ADD CONSTRAINT verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;




INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('ce110242-495d-4e1e-ad5b-21e53b309ad4', '2f102a44ef73df11f201aa07b521894e2e2c61671de7caa486949bf62934b194', '', '20260516140000_init', NULL, NULL, '', 1);
INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('f51ce1f9-8288-4077-a67a-a479e6856cae', '4afa4ba5705ccce57b35da239b1c6ef0c1d1baf12945f6bf3a81189355c6e111', '', '20260516180000_split_profile_name', NULL, NULL, '', 1);
INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('bba30027-3f2b-43d8-920f-65d7bed536b1', 'e2602ee8f7e286034c4c1b7ea88bf278877ee757e866d9187023eae24b2a55c9', '', '20260516190000_verification_tokens', NULL, NULL, '', 1);

INSERT INTO users (id, email, phone, username, password_hash, status, email_verified_at, phone_verified_at, last_login_at, created_at, updated_at, deleted_at) VALUES ('ad3771e1-62d5-40fc-8eb1-2a8b479035aa', 'iimluaw@gmail.com', '0389935504', 'admin', '$2a$12$0vgLVq7a49CVJqAmZuYWdu4pMvLwU0lCsEfSVhEmMWeN3omQGOjcm', 'ACTIVE', '2026-05-16 11:47:43.412', NULL, '2026-05-16 12:35:00.624', '2026-05-16 11:47:09.621', '2026-05-16 12:35:00.624', NULL);

INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('768a09a7-f4eb-4141-98d7-a02c6ed7905e', 'wallet:read', 'View wallets', 'wallet', 'read', NULL, 'ACTIVE', '2026-05-16 10:33:23.737', '2026-05-16 10:34:06.031', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('4ade86cd-f5f5-4a14-81a8-1425b0b32b20', 'wallet:create', 'Create wallets', 'wallet', 'create', NULL, 'ACTIVE', '2026-05-16 10:33:23.742', '2026-05-16 10:34:06.036', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('d95247f2-69bc-4f0e-bfba-7f7295377284', 'wallet:update', 'Update wallets', 'wallet', 'update', NULL, 'ACTIVE', '2026-05-16 10:33:23.745', '2026-05-16 10:34:06.039', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('2b7888be-235f-4531-81ee-8b2cd01c8a64', 'wallet:delete', 'Delete wallets', 'wallet', 'delete', NULL, 'ACTIVE', '2026-05-16 10:33:23.747', '2026-05-16 10:34:06.042', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('3b595fad-2363-4e20-8e95-3d88cf1fdaf2', 'category:read', 'View categories', 'category', 'read', NULL, 'ACTIVE', '2026-05-16 10:33:23.749', '2026-05-16 10:34:06.045', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('6c6421bf-4203-41e5-bb89-0d14e0cfb61d', 'category:create', 'Create categories', 'category', 'create', NULL, 'ACTIVE', '2026-05-16 10:33:23.751', '2026-05-16 10:34:06.048', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('a28e4a96-6944-4e19-aa39-fd638350f523', 'category:update', 'Update categories', 'category', 'update', NULL, 'ACTIVE', '2026-05-16 10:33:23.753', '2026-05-16 10:34:06.051', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('b3b742ad-f96d-470a-b08d-6b7b02d6ca07', 'category:delete', 'Delete categories', 'category', 'delete', NULL, 'ACTIVE', '2026-05-16 10:33:23.755', '2026-05-16 10:34:06.054', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('24241ff2-ef9b-428f-8f26-4363c8ad07ef', 'transaction:read', 'View transactions', 'transaction', 'read', NULL, 'ACTIVE', '2026-05-16 10:33:23.757', '2026-05-16 10:34:06.056', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('4471530e-6b12-43e4-adf2-7d38adcd1540', 'transaction:create', 'Create transactions', 'transaction', 'create', NULL, 'ACTIVE', '2026-05-16 10:33:23.759', '2026-05-16 10:34:06.059', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('8ef938a5-f61d-4839-8624-5eed455243d7', 'transaction:update', 'Update transactions', 'transaction', 'update', NULL, 'ACTIVE', '2026-05-16 10:33:23.76', '2026-05-16 10:34:06.061', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('c70665f3-f222-4a1d-92a7-be28dc0335e4', 'transaction:delete', 'Delete transactions', 'transaction', 'delete', NULL, 'ACTIVE', '2026-05-16 10:33:23.762', '2026-05-16 10:34:06.063', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('ab37a76b-44d8-45e4-a4ee-9b1af1427332', 'budget:read', 'View budgets', 'budget', 'read', NULL, 'ACTIVE', '2026-05-16 10:33:23.764', '2026-05-16 10:34:06.065', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('f762d8d7-33aa-4400-97f5-34f2c3cf0e00', 'budget:create', 'Create budgets', 'budget', 'create', NULL, 'ACTIVE', '2026-05-16 10:33:23.766', '2026-05-16 10:34:06.068', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('968993e0-8f45-4319-9e31-e8727fc2ebf8', 'budget:update', 'Update budgets', 'budget', 'update', NULL, 'ACTIVE', '2026-05-16 10:33:23.768', '2026-05-16 10:34:06.071', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('6e89eb14-6be4-4db2-9f0c-39f26d2defa7', 'budget:delete', 'Delete budgets', 'budget', 'delete', NULL, 'ACTIVE', '2026-05-16 10:33:23.77', '2026-05-16 10:34:06.073', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('e7e2f484-09c0-456f-b90d-808bf9f96dc2', 'profile:read', 'View profile', 'profile', 'read', NULL, 'ACTIVE', '2026-05-16 10:33:23.771', '2026-05-16 10:34:06.074', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('9d606554-8899-4c2f-899b-cdbe8d846e8e', 'profile:update', 'Update profile', 'profile', 'update', NULL, 'ACTIVE', '2026-05-16 10:33:23.773', '2026-05-16 10:34:06.076', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('3d0fe9b6-2809-4f9e-b8e5-a2f95afcbf6a', 'attachment:read', 'View attachments', 'attachment', 'read', NULL, 'ACTIVE', '2026-05-16 10:33:23.775', '2026-05-16 10:34:06.077', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('460fa43d-7003-4c9d-aad2-633741844f64', 'attachment:create', 'Upload attachments', 'attachment', 'create', NULL, 'ACTIVE', '2026-05-16 10:33:23.777', '2026-05-16 10:34:06.079', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('b4a7d286-a91e-41d9-9def-95bdb734099e', 'attachment:delete', 'Delete attachments', 'attachment', 'delete', NULL, 'ACTIVE', '2026-05-16 10:33:23.778', '2026-05-16 10:34:06.081', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('408ee4b0-b398-47de-bb06-a2a67221ca81', 'user:read', 'View users', 'user', 'read', NULL, 'ACTIVE', '2026-05-16 10:33:23.78', '2026-05-16 10:34:06.083', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('350a1e6c-5249-43d8-b791-685f19138882', 'user:manage', 'Manage users', 'user', 'manage', NULL, 'ACTIVE', '2026-05-16 10:33:23.782', '2026-05-16 10:34:06.085', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('ac56844c-46da-4551-b63e-4d3717ea83c5', 'role:read', 'View roles', 'role', 'read', NULL, 'ACTIVE', '2026-05-16 10:33:23.784', '2026-05-16 10:34:06.088', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('a6c8a381-8dc3-45d4-9374-53dde6c6eddc', 'role:manage', 'Manage roles', 'role', 'manage', NULL, 'ACTIVE', '2026-05-16 10:33:23.786', '2026-05-16 10:34:06.09', NULL);
INSERT INTO permissions (id, code, name, module, action, description, status, created_at, updated_at, deleted_at) VALUES ('aa61351c-2e10-40be-9508-532d225ca8d9', 'permission:read', 'View permissions', 'permission', 'read', NULL, 'ACTIVE', '2026-05-16 10:33:23.788', '2026-05-16 10:34:06.093', NULL);

INSERT INTO profiles (id, user_id, display_name, bio, date_of_birth, gender, address, city, country, locale, timezone, avatar_url, status, created_at, updated_at, deleted_at, first_name, last_name) VALUES ('64cdc77d-154e-4ae1-a92d-0b42563d7bcc', 'ad3771e1-62d5-40fc-8eb1-2a8b479035aa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'vi', 'Asia/Ho_Chi_Minh', NULL, 'ACTIVE', '2026-05-16 11:47:09.623', '2026-05-16 11:47:09.623', NULL, 'NGUYEN', 'LUAN');

INSERT INTO roles (id, code, name, description, level, parent_role_id, status, created_at, updated_at, deleted_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', 'USER', 'User', 'Standard personal finance user', 10, NULL, 'ACTIVE', '2026-05-16 10:33:23.712', '2026-05-16 10:34:06.015', NULL);
INSERT INTO roles (id, code, name, description, level, parent_role_id, status, created_at, updated_at, deleted_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', 'ADMIN', 'Administrator', 'Platform administrator', 50, NULL, 'ACTIVE', '2026-05-16 10:33:23.724', '2026-05-16 10:34:06.02', NULL);
INSERT INTO roles (id, code, name, description, level, parent_role_id, status, created_at, updated_at, deleted_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'SUPER_ADMIN', 'Super Administrator', 'Full system access', 100, NULL, 'ACTIVE', '2026-05-16 10:33:23.728', '2026-05-16 10:34:06.024', NULL);

INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '768a09a7-f4eb-4141-98d7-a02c6ed7905e', '2026-05-16 10:33:23.801');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '4ade86cd-f5f5-4a14-81a8-1425b0b32b20', '2026-05-16 10:33:23.805');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', 'd95247f2-69bc-4f0e-bfba-7f7295377284', '2026-05-16 10:33:23.808');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '2b7888be-235f-4531-81ee-8b2cd01c8a64', '2026-05-16 10:33:23.811');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '3b595fad-2363-4e20-8e95-3d88cf1fdaf2', '2026-05-16 10:33:23.813');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '6c6421bf-4203-41e5-bb89-0d14e0cfb61d', '2026-05-16 10:33:23.817');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', 'a28e4a96-6944-4e19-aa39-fd638350f523', '2026-05-16 10:33:23.819');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', 'b3b742ad-f96d-470a-b08d-6b7b02d6ca07', '2026-05-16 10:33:23.822');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '24241ff2-ef9b-428f-8f26-4363c8ad07ef', '2026-05-16 10:33:23.825');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '4471530e-6b12-43e4-adf2-7d38adcd1540', '2026-05-16 10:33:23.828');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '8ef938a5-f61d-4839-8624-5eed455243d7', '2026-05-16 10:33:23.832');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', 'c70665f3-f222-4a1d-92a7-be28dc0335e4', '2026-05-16 10:33:23.836');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', 'ab37a76b-44d8-45e4-a4ee-9b1af1427332', '2026-05-16 10:33:23.839');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', 'f762d8d7-33aa-4400-97f5-34f2c3cf0e00', '2026-05-16 10:33:23.841');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '968993e0-8f45-4319-9e31-e8727fc2ebf8', '2026-05-16 10:33:23.843');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '6e89eb14-6be4-4db2-9f0c-39f26d2defa7', '2026-05-16 10:33:23.847');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', 'e7e2f484-09c0-456f-b90d-808bf9f96dc2', '2026-05-16 10:33:23.849');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '9d606554-8899-4c2f-899b-cdbe8d846e8e', '2026-05-16 10:33:23.851');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '3d0fe9b6-2809-4f9e-b8e5-a2f95afcbf6a', '2026-05-16 10:33:23.854');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', '460fa43d-7003-4c9d-aad2-633741844f64', '2026-05-16 10:33:23.857');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('bce7d865-dbfe-4301-a993-8a189f2ef253', 'b4a7d286-a91e-41d9-9def-95bdb734099e', '2026-05-16 10:33:23.859');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '768a09a7-f4eb-4141-98d7-a02c6ed7905e', '2026-05-16 10:33:23.862');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '4ade86cd-f5f5-4a14-81a8-1425b0b32b20', '2026-05-16 10:33:23.864');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', 'd95247f2-69bc-4f0e-bfba-7f7295377284', '2026-05-16 10:33:23.867');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '2b7888be-235f-4531-81ee-8b2cd01c8a64', '2026-05-16 10:33:23.869');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '3b595fad-2363-4e20-8e95-3d88cf1fdaf2', '2026-05-16 10:33:23.871');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '6c6421bf-4203-41e5-bb89-0d14e0cfb61d', '2026-05-16 10:33:23.872');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', 'a28e4a96-6944-4e19-aa39-fd638350f523', '2026-05-16 10:33:23.874');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', 'b3b742ad-f96d-470a-b08d-6b7b02d6ca07', '2026-05-16 10:33:23.877');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '24241ff2-ef9b-428f-8f26-4363c8ad07ef', '2026-05-16 10:33:23.878');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '4471530e-6b12-43e4-adf2-7d38adcd1540', '2026-05-16 10:33:23.88');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '8ef938a5-f61d-4839-8624-5eed455243d7', '2026-05-16 10:33:23.882');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', 'c70665f3-f222-4a1d-92a7-be28dc0335e4', '2026-05-16 10:33:23.884');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', 'ab37a76b-44d8-45e4-a4ee-9b1af1427332', '2026-05-16 10:33:23.886');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', 'f762d8d7-33aa-4400-97f5-34f2c3cf0e00', '2026-05-16 10:33:23.889');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '968993e0-8f45-4319-9e31-e8727fc2ebf8', '2026-05-16 10:33:23.891');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '6e89eb14-6be4-4db2-9f0c-39f26d2defa7', '2026-05-16 10:33:23.893');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', 'e7e2f484-09c0-456f-b90d-808bf9f96dc2', '2026-05-16 10:33:23.896');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '9d606554-8899-4c2f-899b-cdbe8d846e8e', '2026-05-16 10:33:23.898');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '3d0fe9b6-2809-4f9e-b8e5-a2f95afcbf6a', '2026-05-16 10:33:23.9');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '460fa43d-7003-4c9d-aad2-633741844f64', '2026-05-16 10:33:23.901');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', 'b4a7d286-a91e-41d9-9def-95bdb734099e', '2026-05-16 10:33:23.903');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', '408ee4b0-b398-47de-bb06-a2a67221ca81', '2026-05-16 10:33:23.906');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', 'ac56844c-46da-4551-b63e-4d3717ea83c5', '2026-05-16 10:33:23.909');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('d6b82035-8934-4136-a2ac-7a3bb0523aac', 'aa61351c-2e10-40be-9508-532d225ca8d9', '2026-05-16 10:33:23.911');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '768a09a7-f4eb-4141-98d7-a02c6ed7905e', '2026-05-16 10:33:23.913');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '4ade86cd-f5f5-4a14-81a8-1425b0b32b20', '2026-05-16 10:33:23.916');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'd95247f2-69bc-4f0e-bfba-7f7295377284', '2026-05-16 10:33:23.919');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '2b7888be-235f-4531-81ee-8b2cd01c8a64', '2026-05-16 10:33:23.922');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '3b595fad-2363-4e20-8e95-3d88cf1fdaf2', '2026-05-16 10:33:23.925');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '6c6421bf-4203-41e5-bb89-0d14e0cfb61d', '2026-05-16 10:33:23.927');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'a28e4a96-6944-4e19-aa39-fd638350f523', '2026-05-16 10:33:23.93');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'b3b742ad-f96d-470a-b08d-6b7b02d6ca07', '2026-05-16 10:33:23.931');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '24241ff2-ef9b-428f-8f26-4363c8ad07ef', '2026-05-16 10:33:23.933');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '4471530e-6b12-43e4-adf2-7d38adcd1540', '2026-05-16 10:33:23.936');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '8ef938a5-f61d-4839-8624-5eed455243d7', '2026-05-16 10:33:23.937');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'c70665f3-f222-4a1d-92a7-be28dc0335e4', '2026-05-16 10:33:23.94');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'ab37a76b-44d8-45e4-a4ee-9b1af1427332', '2026-05-16 10:33:23.942');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'f762d8d7-33aa-4400-97f5-34f2c3cf0e00', '2026-05-16 10:33:23.944');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '968993e0-8f45-4319-9e31-e8727fc2ebf8', '2026-05-16 10:33:23.946');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '6e89eb14-6be4-4db2-9f0c-39f26d2defa7', '2026-05-16 10:33:23.948');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'e7e2f484-09c0-456f-b90d-808bf9f96dc2', '2026-05-16 10:33:23.95');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '9d606554-8899-4c2f-899b-cdbe8d846e8e', '2026-05-16 10:33:23.952');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '3d0fe9b6-2809-4f9e-b8e5-a2f95afcbf6a', '2026-05-16 10:33:23.954');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '460fa43d-7003-4c9d-aad2-633741844f64', '2026-05-16 10:33:23.957');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'b4a7d286-a91e-41d9-9def-95bdb734099e', '2026-05-16 10:33:23.959');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '408ee4b0-b398-47de-bb06-a2a67221ca81', '2026-05-16 10:33:23.961');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'ac56844c-46da-4551-b63e-4d3717ea83c5', '2026-05-16 10:33:23.963');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'aa61351c-2e10-40be-9508-532d225ca8d9', '2026-05-16 10:33:23.966');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', '350a1e6c-5249-43d8-b791-685f19138882', '2026-05-16 10:33:23.968');
INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ('98e3b7d8-e15a-40ae-8cd0-3ea351983184', 'a6c8a381-8dc3-45d4-9374-53dde6c6eddc', '2026-05-16 10:33:23.969');

INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at) VALUES ('ad3771e1-62d5-40fc-8eb1-2a8b479035aa', 'bce7d865-dbfe-4301-a993-8a189f2ef253', NULL, '2026-05-16 11:47:09.628');

INSERT INTO verification_tokens (id, user_id, channel, target, token_hash, expires_at, used_at, created_at) VALUES ('d130a41b-3252-493f-9420-8898bc3e242d', 'ad3771e1-62d5-40fc-8eb1-2a8b479035aa', 'EMAIL', 'iimluaw@gmail.com', '2e444dc596df662214ef8358505e2b185d0cbe6f6fcb47402b35dd2d9f092ac4', '2026-05-17 11:47:09.634', '2026-05-16 11:47:43.409', '2026-05-16 11:47:09.643');


SET FOREIGN_KEY_CHECKS = 1;
