# System Architecture

## Architecture Style

Monolithic Fullstack Architecture

## Stack

Frontend:
- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui

Backend:
- Next.js Server Actions
- API Routes

Database:
- PostgreSQL

ORM:
- Prisma

## High-Level Flow

Client
  ↓
Next.js App
  ↓
Server Actions / API Routes
  ↓
Prisma ORM
  ↓
PostgreSQL