import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { getDatabaseUrl } from '../src/lib/database-url'

const pool = new Pool({ connectionString: getDatabaseUrl() })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const ROLES = [
  { code: 'USER', name: 'User', level: 10, description: 'Standard personal finance user' },
  { code: 'ADMIN', name: 'Administrator', level: 50, description: 'Platform administrator' },
  {
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    level: 100,
    description: 'Full system access',
  },
] as const

const PERMISSIONS = [
  { code: 'wallet:read', name: 'View wallets', module: 'wallet', action: 'read' },
  { code: 'wallet:create', name: 'Create wallets', module: 'wallet', action: 'create' },
  { code: 'wallet:update', name: 'Update wallets', module: 'wallet', action: 'update' },
  { code: 'wallet:delete', name: 'Delete wallets', module: 'wallet', action: 'delete' },
  { code: 'category:read', name: 'View categories', module: 'category', action: 'read' },
  { code: 'category:create', name: 'Create categories', module: 'category', action: 'create' },
  { code: 'category:update', name: 'Update categories', module: 'category', action: 'update' },
  { code: 'category:delete', name: 'Delete categories', module: 'category', action: 'delete' },
  { code: 'transaction:read', name: 'View transactions', module: 'transaction', action: 'read' },
  { code: 'transaction:create', name: 'Create transactions', module: 'transaction', action: 'create' },
  { code: 'transaction:update', name: 'Update transactions', module: 'transaction', action: 'update' },
  { code: 'transaction:delete', name: 'Delete transactions', module: 'transaction', action: 'delete' },
  { code: 'budget:read', name: 'View budgets', module: 'budget', action: 'read' },
  { code: 'budget:create', name: 'Create budgets', module: 'budget', action: 'create' },
  { code: 'budget:update', name: 'Update budgets', module: 'budget', action: 'update' },
  { code: 'budget:delete', name: 'Delete budgets', module: 'budget', action: 'delete' },
  { code: 'profile:read', name: 'View profile', module: 'profile', action: 'read' },
  { code: 'profile:update', name: 'Update profile', module: 'profile', action: 'update' },
  { code: 'attachment:read', name: 'View attachments', module: 'attachment', action: 'read' },
  { code: 'attachment:create', name: 'Upload attachments', module: 'attachment', action: 'create' },
  { code: 'attachment:delete', name: 'Delete attachments', module: 'attachment', action: 'delete' },
  { code: 'user:read', name: 'View users', module: 'user', action: 'read' },
  { code: 'user:manage', name: 'Manage users', module: 'user', action: 'manage' },
  { code: 'role:read', name: 'View roles', module: 'role', action: 'read' },
  { code: 'role:manage', name: 'Manage roles', module: 'role', action: 'manage' },
  { code: 'permission:read', name: 'View permissions', module: 'permission', action: 'read' },
] as const

const ROLE_PERMISSION_CODES: Record<string, readonly string[]> = {
  USER: [
    'wallet:read',
    'wallet:create',
    'wallet:update',
    'wallet:delete',
    'category:read',
    'category:create',
    'category:update',
    'category:delete',
    'transaction:read',
    'transaction:create',
    'transaction:update',
    'transaction:delete',
    'budget:read',
    'budget:create',
    'budget:update',
    'budget:delete',
    'profile:read',
    'profile:update',
    'attachment:read',
    'attachment:create',
    'attachment:delete',
  ],
  ADMIN: [
    'user:read',
    'role:read',
    'permission:read',
  ],
  SUPER_ADMIN: ['user:manage', 'role:manage'],
}

async function upsertRole(data: (typeof ROLES)[number]) {
  const existing = await prisma.role.findFirst({
    where: { code: data.code, deletedAt: null },
  })
  if (existing) {
    return prisma.role.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        level: data.level,
        description: data.description,
        status: 'ACTIVE',
      },
    })
  }
  return prisma.role.create({
    data: { ...data, status: 'ACTIVE' },
  })
}

async function upsertPermission(data: (typeof PERMISSIONS)[number]) {
  const existing = await prisma.permission.findFirst({
    where: { code: data.code, deletedAt: null },
  })
  if (existing) {
    return prisma.permission.update({
      where: { id: existing.id },
      data: { ...data, status: 'ACTIVE' },
    })
  }
  return prisma.permission.create({
    data: { ...data, status: 'ACTIVE' },
  })
}

async function main() {
  const roleMap = new Map<string, string>()
  for (const role of ROLES) {
    const record = await upsertRole(role)
    roleMap.set(role.code, record.id)
  }

  const permissionMap = new Map<string, string>()
  for (const permission of PERMISSIONS) {
    const record = await upsertPermission(permission)
    permissionMap.set(permission.code, record.id)
  }

  for (const [roleCode, permissionCodes] of Object.entries(ROLE_PERMISSION_CODES)) {
    const roleId = roleMap.get(roleCode)
    if (!roleId) continue

    let inheritedCodes: readonly string[] = permissionCodes
    if (roleCode === 'ADMIN') {
      inheritedCodes = [...ROLE_PERMISSION_CODES.USER, ...permissionCodes]
    } else if (roleCode === 'SUPER_ADMIN') {
      inheritedCodes = [
        ...ROLE_PERMISSION_CODES.USER,
        ...ROLE_PERMISSION_CODES.ADMIN,
        ...permissionCodes,
      ]
    }

    for (const code of inheritedCodes) {
      const permissionId = permissionMap.get(code)
      if (!permissionId) continue

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId },
        },
        create: { roleId, permissionId },
        update: {},
      })
    }
  }

  console.log('Seed completed: roles, permissions, role_permissions')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
