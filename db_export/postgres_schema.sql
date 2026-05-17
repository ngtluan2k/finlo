--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: AttachmentCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AttachmentCategory" AS ENUM (
    'RECEIPT',
    'INVOICE',
    'CONTRACT',
    'AVATAR',
    'ID_DOCUMENT',
    'REPORT',
    'OTHER'
);


--
-- Name: AttachmentEntityType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AttachmentEntityType" AS ENUM (
    'USER',
    'PROFILE',
    'TRANSACTION',
    'WALLET',
    'BUDGET',
    'RECURRING_TRANSACTION'
);


--
-- Name: AttachmentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AttachmentStatus" AS ENUM (
    'UPLOADING',
    'ACTIVE',
    'FAILED',
    'ARCHIVED'
);


--
-- Name: CategoryType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CategoryType" AS ENUM (
    'INCOME',
    'EXPENSE'
);


--
-- Name: Gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER',
    'PREFER_NOT_TO_SAY'
);


--
-- Name: PermissionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PermissionStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: RecordStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RecordStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED'
);


--
-- Name: RecurrenceFrequency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RecurrenceFrequency" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'YEARLY'
);


--
-- Name: RoleStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RoleStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'CANCELLED',
    'FAILED'
);


--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionType" AS ENUM (
    'INCOME',
    'EXPENSE',
    'TRANSFER'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'PENDING_VERIFICATION',
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


--
-- Name: VerificationChannel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VerificationChannel" AS ENUM (
    'EMAIL',
    'PHONE'
);


--
-- Name: WalletType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WalletType" AS ENUM (
    'CASH',
    'BANK',
    'E_WALLET',
    'CREDIT_CARD',
    'OTHER'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    entity_type public."AttachmentEntityType" NOT NULL,
    entity_id uuid NOT NULL,
    category public."AttachmentCategory" DEFAULT 'OTHER'::public."AttachmentCategory" NOT NULL,
    file_name character varying(255) NOT NULL,
    storage_key character varying(500) NOT NULL,
    mime_type character varying(100) NOT NULL,
    size_bytes bigint NOT NULL,
    url character varying(1000),
    status public."AttachmentStatus" DEFAULT 'UPLOADING'::public."AttachmentStatus" NOT NULL,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budgets (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    category_id uuid NOT NULL,
    amount numeric(15,2) NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    status public."RecordStatus" DEFAULT 'ACTIVE'::public."RecordStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type public."CategoryType" NOT NULL,
    status public."RecordStatus" DEFAULT 'ACTIVE'::public."RecordStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    module character varying(50) NOT NULL,
    action character varying(50) NOT NULL,
    description text,
    status public."PermissionStatus" DEFAULT 'ACTIVE'::public."PermissionStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    display_name character varying(255),
    bio text,
    date_of_birth date,
    gender public."Gender",
    address character varying(500),
    city character varying(100),
    country character varying(2),
    locale character varying(10) DEFAULT 'vi'::character varying NOT NULL,
    timezone character varying(50) DEFAULT 'Asia/Ho_Chi_Minh'::character varying NOT NULL,
    avatar_url character varying(500),
    status public."RecordStatus" DEFAULT 'ACTIVE'::public."RecordStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL
);


--
-- Name: recurring_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurring_transactions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    wallet_id uuid NOT NULL,
    category_id uuid NOT NULL,
    amount numeric(15,2) NOT NULL,
    type public."TransactionType" NOT NULL,
    status public."RecordStatus" DEFAULT 'ACTIVE'::public."RecordStatus" NOT NULL,
    note text,
    frequency public."RecurrenceFrequency" NOT NULL,
    next_run_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    level integer DEFAULT 10 NOT NULL,
    parent_role_id uuid,
    status public."RoleStatus" DEFAULT 'ACTIVE'::public."RoleStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    wallet_id uuid NOT NULL,
    category_id uuid,
    amount numeric(15,2) NOT NULL,
    type public."TransactionType" NOT NULL,
    status public."TransactionStatus" DEFAULT 'COMPLETED'::public."TransactionStatus" NOT NULL,
    note text,
    transaction_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255),
    phone character varying(20),
    username character varying(50),
    password_hash character varying(255) NOT NULL,
    status public."UserStatus" DEFAULT 'PENDING_VERIFICATION'::public."UserStatus" NOT NULL,
    email_verified_at timestamp(3) without time zone,
    phone_verified_at timestamp(3) without time zone,
    last_login_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    CONSTRAINT users_login_identifier_check CHECK (((email IS NOT NULL) OR (phone IS NOT NULL) OR (username IS NOT NULL)))
);


--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    channel public."VerificationChannel" NOT NULL,
    target character varying(255) NOT NULL,
    token_hash character varying(64) NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    used_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallets (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    balance numeric(15,2) DEFAULT 0 NOT NULL,
    type public."WalletType" DEFAULT 'CASH'::public."WalletType" NOT NULL,
    status public."RecordStatus" DEFAULT 'ACTIVE'::public."RecordStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: recurring_transactions recurring_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_transactions
    ADD CONSTRAINT recurring_transactions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_tokens verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: attachments_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachments_deleted_at_idx ON public.attachments USING btree (deleted_at);


--
-- Name: attachments_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachments_entity_type_entity_id_idx ON public.attachments USING btree (entity_type, entity_id);


--
-- Name: attachments_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachments_status_idx ON public.attachments USING btree (status);


--
-- Name: attachments_user_id_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachments_user_id_category_idx ON public.attachments USING btree (user_id, category);


--
-- Name: attachments_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachments_user_id_idx ON public.attachments USING btree (user_id);


--
-- Name: budgets_active_unique_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX budgets_active_unique_key ON public.budgets USING btree (user_id, category_id, year, month) WHERE (deleted_at IS NULL);


--
-- Name: budgets_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budgets_deleted_at_idx ON public.budgets USING btree (deleted_at);


--
-- Name: budgets_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budgets_status_idx ON public.budgets USING btree (status);


--
-- Name: budgets_user_id_category_id_year_month_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budgets_user_id_category_id_year_month_idx ON public.budgets USING btree (user_id, category_id, year, month);


--
-- Name: budgets_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budgets_user_id_idx ON public.budgets USING btree (user_id);


--
-- Name: budgets_user_id_year_month_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budgets_user_id_year_month_idx ON public.budgets USING btree (user_id, year, month);


--
-- Name: categories_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_deleted_at_idx ON public.categories USING btree (deleted_at);


--
-- Name: categories_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_user_id_idx ON public.categories USING btree (user_id);


--
-- Name: categories_user_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_user_id_status_idx ON public.categories USING btree (user_id, status);


--
-- Name: categories_user_id_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_user_id_type_idx ON public.categories USING btree (user_id, type);


--
-- Name: permissions_code_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX permissions_code_active_key ON public.permissions USING btree (code) WHERE (deleted_at IS NULL);


--
-- Name: permissions_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_code_idx ON public.permissions USING btree (code);


--
-- Name: permissions_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_deleted_at_idx ON public.permissions USING btree (deleted_at);


--
-- Name: permissions_module_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_module_idx ON public.permissions USING btree (module);


--
-- Name: permissions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_status_idx ON public.permissions USING btree (status);


--
-- Name: profiles_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_deleted_at_idx ON public.profiles USING btree (deleted_at);


--
-- Name: profiles_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_status_idx ON public.profiles USING btree (status);


--
-- Name: profiles_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);


--
-- Name: recurring_transactions_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recurring_transactions_deleted_at_idx ON public.recurring_transactions USING btree (deleted_at);


--
-- Name: recurring_transactions_next_run_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recurring_transactions_next_run_at_idx ON public.recurring_transactions USING btree (next_run_at);


--
-- Name: recurring_transactions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recurring_transactions_status_idx ON public.recurring_transactions USING btree (status);


--
-- Name: recurring_transactions_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recurring_transactions_user_id_idx ON public.recurring_transactions USING btree (user_id);


--
-- Name: role_permissions_permission_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX role_permissions_permission_id_idx ON public.role_permissions USING btree (permission_id);


--
-- Name: roles_code_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_code_active_key ON public.roles USING btree (code) WHERE (deleted_at IS NULL);


--
-- Name: roles_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_code_idx ON public.roles USING btree (code);


--
-- Name: roles_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_deleted_at_idx ON public.roles USING btree (deleted_at);


--
-- Name: roles_level_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_level_idx ON public.roles USING btree (level);


--
-- Name: roles_parent_role_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_parent_role_id_idx ON public.roles USING btree (parent_role_id);


--
-- Name: roles_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_status_idx ON public.roles USING btree (status);


--
-- Name: transactions_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_category_id_idx ON public.transactions USING btree (category_id);


--
-- Name: transactions_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_deleted_at_idx ON public.transactions USING btree (deleted_at);


--
-- Name: transactions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_status_idx ON public.transactions USING btree (status);


--
-- Name: transactions_transaction_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_transaction_date_idx ON public.transactions USING btree (transaction_date);


--
-- Name: transactions_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_user_id_idx ON public.transactions USING btree (user_id);


--
-- Name: transactions_wallet_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_wallet_id_idx ON public.transactions USING btree (wallet_id);


--
-- Name: user_roles_assigned_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_assigned_by_idx ON public.user_roles USING btree (assigned_by);


--
-- Name: user_roles_role_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_role_id_idx ON public.user_roles USING btree (role_id);


--
-- Name: users_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_deleted_at_idx ON public.users USING btree (deleted_at);


--
-- Name: users_email_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_active_key ON public.users USING btree (email) WHERE ((deleted_at IS NULL) AND (email IS NOT NULL));


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_login_lookup_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_login_lookup_idx ON public.users USING btree (email, phone, username) WHERE ((deleted_at IS NULL) AND (status = 'ACTIVE'::public."UserStatus"));


--
-- Name: users_phone_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_phone_active_key ON public.users USING btree (phone) WHERE ((deleted_at IS NULL) AND (phone IS NOT NULL));


--
-- Name: users_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_phone_idx ON public.users USING btree (phone);


--
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- Name: users_username_active_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_active_key ON public.users USING btree (username) WHERE ((deleted_at IS NULL) AND (username IS NOT NULL));


--
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_username_idx ON public.users USING btree (username);


--
-- Name: verification_tokens_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verification_tokens_expires_at_idx ON public.verification_tokens USING btree (expires_at);


--
-- Name: verification_tokens_token_hash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verification_tokens_token_hash_idx ON public.verification_tokens USING btree (token_hash);


--
-- Name: verification_tokens_user_id_channel_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verification_tokens_user_id_channel_idx ON public.verification_tokens USING btree (user_id, channel);


--
-- Name: wallets_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallets_deleted_at_idx ON public.wallets USING btree (deleted_at);


--
-- Name: wallets_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallets_user_id_idx ON public.wallets USING btree (user_id);


--
-- Name: wallets_user_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallets_user_id_status_idx ON public.wallets USING btree (user_id, status);


--
-- Name: attachments attachments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: budgets budgets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: budgets budgets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_transactions recurring_transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_transactions
    ADD CONSTRAINT recurring_transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_transactions recurring_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_transactions
    ADD CONSTRAINT recurring_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_transactions recurring_transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_transactions
    ADD CONSTRAINT recurring_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: roles roles_parent_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_parent_role_id_fkey FOREIGN KEY (parent_role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: verification_tokens verification_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

