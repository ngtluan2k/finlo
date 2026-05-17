import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hash } from 'bcryptjs'
import { faker } from '@faker-js/faker'
import { PrismaClient } from '../src/generated/prisma/client'
import { getDatabaseUrl } from '../src/lib/database-url'

const pool = new Pool({ connectionString: getDatabaseUrl() })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const ROLES = [
  { code: 'USER', name: 'User', level: 10, description: 'Standard personal finance user' },
  { code: 'CASHIER', name: 'Cashier', level: 20, description: 'Store Cashier' },
  { code: 'ACCOUNTANT', name: 'Accountant', level: 30, description: 'Staff Accountant' },
  { code: 'CHIEF_ACCOUNTANT', name: 'Chief Accountant', level: 40, description: 'Chief Accountant' },
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
  CASHIER: [
    'wallet:read',
    'transaction:read',
    'transaction:create',
    'transaction:update',
    'category:read',
  ],
  ACCOUNTANT: [
    'wallet:read',
    'wallet:create',
    'wallet:update',
    'transaction:read',
    'transaction:create',
    'transaction:update',
    'category:read',
    'category:create',
    'category:update',
    'budget:read',
    'budget:create',
    'budget:update',
  ],
  CHIEF_ACCOUNTANT: [
    'wallet:read',
    'wallet:create',
    'wallet:update',
    'wallet:delete',
    'transaction:read',
    'transaction:create',
    'transaction:update',
    'transaction:delete',
    'category:read',
    'category:create',
    'category:update',
    'category:delete',
    'budget:read',
    'budget:create',
    'budget:update',
    'budget:delete',
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

const DEFAULT_CATEGORIES = [
  // Expenses
  { name: 'Ăn uống', type: 'EXPENSE' as const },
  { name: 'Mua sắm', type: 'EXPENSE' as const },
  { name: 'Di chuyển', type: 'EXPENSE' as const },
  { name: 'Giải trí', type: 'EXPENSE' as const },
  { name: 'Hóa đơn', type: 'EXPENSE' as const },
  { name: 'Sức khỏe', type: 'EXPENSE' as const },
  { name: 'Giáo dục', type: 'EXPENSE' as const },
  { name: 'Khác', type: 'EXPENSE' as const },
  // Incomes
  { name: 'Lương', type: 'INCOME' as const },
  { name: 'Thưởng', type: 'INCOME' as const },
  { name: 'Đầu tư', type: 'INCOME' as const },
  { name: 'Khác', type: 'INCOME' as const },
]

const DEFAULT_WALLETS = [
  { name: 'Ví tiền mặt', type: 'CASH' as const, initialBalance: 500 },
  { name: 'Tài khoản Techcombank', type: 'BANK' as const, initialBalance: 5000 },
  { name: 'Ví điện tử MoMo', type: 'E_WALLET' as const, initialBalance: 300 },
]

const EXPENSE_NOTES: Record<string, string[]> = {
  'Ăn uống': [
    'Ăn sáng phở bò',
    'Cà phê sáng Highlands',
    'Ăn trưa cùng đồng nghiệp',
    'Trà sữa Gongcha',
    'Ăn tối gia đình',
    'Mua đồ ăn vặt',
    'Tiệc buffet cuối tuần',
    'Cà phê Starbucks',
    'Đặt đồ ăn GrabFood',
    'Ăn nhẹ buổi chiều'
  ],
  'Mua sắm': [
    'Mua quần áo Uniqlo',
    'Siêu thị Co.opmart',
    'Mua sắm đồ gia dụng Shopee',
    'Mua sách Tiki',
    'Đồ dùng cá nhân',
    'Mua mỹ phẩm',
    'Sắm đồ trang trí nhà cửa',
    'Mua quà sinh nhật',
    'Siêu thị WinMart',
    'Đồ điện tử mới'
  ],
  'Di chuyển': [
    'Đổ xăng xe máy',
    'Đặt Grab Car đi làm',
    'Cước GrabBike',
    'Vé gửi xe tháng',
    'Bảo dưỡng sửa xe',
    'Vé tàu cao tốc',
    'Cước Taxi Mai Linh',
    'Phí đường bộ'
  ],
  'Giải trí': [
    'Vé xem phim CGV',
    'Đăng ký tài khoản Netflix',
    'Đi hát Karaoke',
    'Vé xem ca nhạc',
    'Mua game Steam',
    'Chơi bowling cuối tuần',
    'Thuê truyện tranh'
  ],
  'Hóa đơn': [
    'Thanh toán tiền điện',
    'Đóng tiền nước tháng',
    'Cước Internet Viettel',
    'Gói cước 4G Mobifone',
    'Phí quản lý chung cư',
    'Thanh toán truyền hình cáp'
  ],
  'Sức khỏe': [
    'Mua thuốc nhà thuốc Pharmacity',
    'Khám sức khỏe định kỳ',
    'Mua thực phẩm chức năng',
    'Phí mua thẻ bảo hiểm y tế',
    'Mua sữa hạt dinh dưỡng',
    'Hộp khẩu trang y tế'
  ],
  'Giáo dục': [
    'Mua khóa học trực tuyến',
    'Mua sách chuyên ngành',
    'Học phí ngoại ngữ',
    'Đăng ký thi chứng chỉ',
    'Mua văn phòng phẩm'
  ],
  'Khác': [
    'Chi phí không tên',
    'Quyên góp từ thiện',
    'Giúp đỡ bạn bè',
    'Đóng quỹ lớp'
  ]
}

const INCOME_NOTES: Record<string, string[]> = {
  'Lương': [
    'Nhận lương cứng tháng này',
    'Tạm ứng lương',
    'Chuyển khoản lương định kỳ',
    'Lương dự án hoàn thành'
  ],
  'Thưởng': [
    'Thưởng hiệu suất KPI',
    'Thưởng ngày lễ Tết',
    'Thưởng nóng dự án',
    'Tiền hoa hồng giới thiệu khách hàng'
  ],
  'Đầu tư': [
    'Nhận cổ tức cổ phiếu',
    'Lãi tiền gửi tiết kiệm',
    'Lợi nhuận đầu tư quỹ',
    'Tiền thuê nhà nhận được'
  ],
  'Khác': [
    'Bán đồ cũ thanh lý',
    'Người thân gửi tiền',
    'Thu khoản nợ cũ',
    'Hoàn tiền mua sắm Shopee'
  ]
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

    let inheritedCodes: readonly string[] = [...permissionCodes]
    if (roleCode === 'ADMIN') {
      inheritedCodes = [
        ...ROLE_PERMISSION_CODES.USER,
        ...ROLE_PERMISSION_CODES.CHIEF_ACCOUNTANT,
        ...permissionCodes,
      ]
    } else if (roleCode === 'SUPER_ADMIN') {
      inheritedCodes = [
        ...ROLE_PERMISSION_CODES.USER,
        ...ROLE_PERMISSION_CODES.CASHIER,
        ...ROLE_PERMISSION_CODES.ACCOUNTANT,
        ...ROLE_PERMISSION_CODES.CHIEF_ACCOUNTANT,
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

  // =========================================================
  // SEED USERS & ROLES ASSIGNMENT
  // =========================================================
  const passwordHash = await hash('Password123', 12)

  const usersToSeed = [
    {
      email: 'nguyenvana@finlo.vn',
      username: 'nguyenvana',
      firstName: 'A',
      lastName: 'Nguyễn Văn',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE' as const,
    },
    {
      email: 'tranthib@finlo.vn',
      username: 'tranthib',
      firstName: 'B',
      lastName: 'Trần Thị',
      role: 'CHIEF_ACCOUNTANT',
      status: 'ACTIVE' as const,
    },
    {
      email: 'levanc@finlo.vn',
      username: 'levanc',
      firstName: 'C',
      lastName: 'Lê Văn',
      role: 'ACCOUNTANT',
      status: 'ACTIVE' as const,
    },
    {
      email: 'phamthid@finlo.vn',
      username: 'phamthid',
      firstName: 'D',
      lastName: 'Phạm Thị',
      role: 'CASHIER',
      status: 'SUSPENDED' as const,
    },
    {
      email: 'hoangvane@finlo.vn',
      username: 'hoangvane',
      firstName: 'E',
      lastName: 'Hoàng Văn',
      role: 'ACCOUNTANT',
      status: 'ACTIVE' as const,
    },
    {
      email: 'dothif@finlo.vn',
      username: 'dothif',
      firstName: 'F',
      lastName: 'Đỗ Thị',
      role: 'CASHIER',
      status: 'INACTIVE' as const,
    },
  ]

  console.log('Seeding mock users...')
  for (const u of usersToSeed) {
    const existing = await prisma.user.findFirst({
      where: { email: u.email, deletedAt: null },
    })

    let user
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          username: u.username,
          status: u.status,
          emailVerifiedAt: new Date(),
        },
      })
    } else {
      user = await prisma.user.create({
        data: {
          email: u.email,
          username: u.username,
          passwordHash,
          status: u.status,
          emailVerifiedAt: new Date(),
        },
      })
    }

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        locale: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
      },
      create: {
        userId: user.id,
        firstName: u.firstName,
        lastName: u.lastName,
        locale: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
      },
    })

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        theme: 'SYSTEM',
        preferences: {},
      },
    })

    // Assign role
    const roleId = roleMap.get(u.role)
    if (roleId) {
      // Clear existing roles
      await prisma.userRole.deleteMany({
        where: { userId: user.id },
      })
      // Create new role mapping
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId,
        },
      })
    }

    // =========================================================
    // SEED WALLETS, CATEGORIES, TRANSACTIONS, BUDGETS, RECURRING
    // =========================================================
    console.log(`Seeding dynamic financial records for user: ${u.username}...`)

    // 1. Seed Categories
    const categoriesMap = new Map<string, string>()
    for (const cat of DEFAULT_CATEGORIES) {
      let existingCat = await prisma.category.findFirst({
        where: { userId: user.id, name: cat.name, type: cat.type, deletedAt: null },
      })
      if (!existingCat) {
        existingCat = await prisma.category.create({
          data: {
            userId: user.id,
            name: cat.name,
            type: cat.type,
            status: 'ACTIVE',
          },
        })
      }
      categoriesMap.set(`${cat.name}_${cat.type}`, existingCat.id)
    }

    // 2. Seed Wallets
    const walletsMap = new Map<string, string>()
    const initialBalances = new Map<string, number>()
    for (const w of DEFAULT_WALLETS) {
      let existingWallet = await prisma.wallet.findFirst({
        where: { userId: user.id, name: w.name, deletedAt: null },
      })
      if (existingWallet) {
        // Reset balance to initial during seeding to prevent continuous growth
        existingWallet = await prisma.wallet.update({
          where: { id: existingWallet.id },
          data: { balance: w.initialBalance },
        })
      } else {
        existingWallet = await prisma.wallet.create({
          data: {
            userId: user.id,
            name: w.name,
            type: w.type,
            balance: w.initialBalance,
            status: 'ACTIVE',
          },
        })
      }
      walletsMap.set(w.name, existingWallet.id)
      initialBalances.set(existingWallet.id, w.initialBalance)
    }

    // Clear existing transactions to ensure clean seeding run
    await prisma.transaction.deleteMany({
      where: { userId: user.id },
    })

    // 3. Seed Realistic Transactions
    const walletIds = Array.from(walletsMap.values())
    const walletsTransactionsMap = new Map<string, { totalIncome: number; totalExpense: number }>()
    for (const id of walletIds) {
      walletsTransactionsMap.set(id, { totalIncome: 0, totalExpense: 0 })
    }

    // Seed salaries exactly once a month on the 5th for the last 3 months
    const salaryCatId = categoriesMap.get('Lương_INCOME')
    const bankWalletId = walletsMap.get('Tài khoản Techcombank')
    if (salaryCatId && bankWalletId) {
      const now = new Date()
      for (let i = 0; i < 3; i++) {
        const salaryDate = new Date(now.getFullYear(), now.getMonth() - i, 5, 9, 0, 0)
        if (salaryDate <= now) {
          const amount = 2500.00 // Fixed monthly salary
          await prisma.transaction.create({
            data: {
              userId: user.id,
              walletId: bankWalletId,
              categoryId: salaryCatId,
              amount,
              type: 'INCOME',
              status: 'COMPLETED',
              note: 'Nhận chuyển khoản lương định kỳ',
              transactionDate: salaryDate,
            },
          })
          const stats = walletsTransactionsMap.get(bankWalletId)!
          stats.totalIncome += amount
        }
      }
    }

    // Seed other random transactions
    const totalRandomTransactions = 45
    const now = new Date()
    faker.seed(12345 + u.username.charCodeAt(0)) // User-specific seed for variety but consistency

    for (let i = 0; i < totalRandomTransactions; i++) {
      const isExpense = faker.number.int({ min: 1, max: 100 }) <= 75 // 75% expense, 25% income
      const walletId = faker.helpers.arrayElement(walletIds)
      const stats = walletsTransactionsMap.get(walletId)!

      // Random date in the last 90 days
      const transactionDate = faker.date.between({
        from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        to: now,
      })

      if (isExpense) {
        // Pick an expense category
        const expCat = faker.helpers.arrayElement(DEFAULT_CATEGORIES.filter(c => c.type === 'EXPENSE'))
        const catId = categoriesMap.get(`${expCat.name}_EXPENSE`)!
        
        // Define amount range
        let minAmount = 5
        let maxAmount = 50
        if (expCat.name === 'Mua sắm') {
          minAmount = 15
          maxAmount = 250
        } else if (expCat.name === 'Hóa đơn') {
          minAmount = 30
          maxAmount = 120
        } else if (expCat.name === 'Di chuyển') {
          minAmount = 2
          maxAmount = 15
        }

        const amount = Math.round((faker.number.float({ min: minAmount, max: maxAmount })) * 100) / 100
        const notes = EXPENSE_NOTES[expCat.name] || ['Chi tiêu cá nhân']
        const note = faker.helpers.arrayElement(notes)

        await prisma.transaction.create({
          data: {
            userId: user.id,
            walletId,
            categoryId: catId,
            amount,
            type: 'EXPENSE',
            status: 'COMPLETED',
            note,
            transactionDate,
          },
        })
        stats.totalExpense += amount
      } else {
        // Pick an income category (excluding Lương to keep Lương clean)
        const incCat = faker.helpers.arrayElement(DEFAULT_CATEGORIES.filter(c => c.type === 'INCOME' && c.name !== 'Lương'))
        const catId = categoriesMap.get(`${incCat.name}_INCOME`)!

        let minAmount = 10
        let maxAmount = 100
        if (incCat.name === 'Thưởng') {
          minAmount = 100
          maxAmount = 400
        } else if (incCat.name === 'Đầu tư') {
          minAmount = 50
          maxAmount = 200
        }

        const amount = Math.round((faker.number.float({ min: minAmount, max: maxAmount })) * 100) / 100
        const notes = INCOME_NOTES[incCat.name] || ['Thu nhập khác']
        const note = faker.helpers.arrayElement(notes)

        await prisma.transaction.create({
          data: {
            userId: user.id,
            walletId,
            categoryId: catId,
            amount,
            type: 'INCOME',
            status: 'COMPLETED',
            note,
            transactionDate,
          },
        })
        stats.totalIncome += amount
      }
    }

    // 4. Update Wallets with Consistent Balances
    for (const [wId, stats] of walletsTransactionsMap.entries()) {
      const initBal = initialBalances.get(wId) || 0
      const finalBalance = Math.round((initBal + stats.totalIncome - stats.totalExpense) * 100) / 100
      await prisma.wallet.update({
        where: { id: wId },
        data: { balance: finalBalance },
      })
    }

    // 5. Seed Budgets
    await prisma.budget.deleteMany({
      where: { userId: user.id },
    })

    const budgetCategories = ['Ăn uống', 'Mua sắm', 'Di chuyển']
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevYear = prevMonthDate.getFullYear()
    const prevMonth = prevMonthDate.getMonth() + 1

    const seedBudgetForMonth = async (yr: number, mo: number) => {
      for (const catName of budgetCategories) {
        const catId = categoriesMap.get(`${catName}_EXPENSE`)
        if (!catId) continue

        let budgetAmount = 500
        if (catName === 'Mua sắm') budgetAmount = 300
        if (catName === 'Di chuyển') budgetAmount = 100

        await prisma.budget.create({
          data: {
            userId: user.id,
            categoryId: catId,
            amount: budgetAmount,
            year: yr,
            month: mo,
            status: 'ACTIVE',
          },
        })
      }
    }

    await seedBudgetForMonth(currentYear, currentMonth)
    await seedBudgetForMonth(prevYear, prevMonth)

    // 6. Seed Recurring Transactions
    await prisma.recurringTransaction.deleteMany({
      where: { userId: user.id },
    })

    const momoWalletId = walletsMap.get('Ví điện tử MoMo')
    const entertainmentCatId = categoriesMap.get('Giải trí_EXPENSE')
    const healthCatId = categoriesMap.get('Sức khỏe_EXPENSE')

    if (momoWalletId && entertainmentCatId) {
      await prisma.recurringTransaction.create({
        data: {
          userId: user.id,
          walletId: momoWalletId,
          categoryId: entertainmentCatId,
          amount: 15.00,
          type: 'EXPENSE',
          status: 'ACTIVE',
          note: 'Gia hạn gói Netflix Premium hàng tháng',
          frequency: 'MONTHLY',
          nextRunAt: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        },
      })
    }

    if (momoWalletId && healthCatId) {
      await prisma.recurringTransaction.create({
        data: {
          userId: user.id,
          walletId: momoWalletId,
          categoryId: healthCatId,
          amount: 40.00,
          type: 'EXPENSE',
          status: 'ACTIVE',
          note: 'Hội viên tháng Gym California',
          frequency: 'MONTHLY',
          nextRunAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        },
      })
    }

    // Seed mock activity logs
    await prisma.activityLog.deleteMany({
      where: { userId: user.id },
    })

    const mockLogs = [
      { action: 'LOGIN', details: 'Đăng nhập hệ thống thành công' },
      { action: 'UPDATE_PROFILE', details: 'Cập nhật ảnh đại diện và thông tin liên hệ' },
    ]

    if (u.role === 'SUPER_ADMIN') {
      mockLogs.push(
        { action: 'CHANGE_ROLE', details: 'Thay đổi vai trò của Trần Thị B thành Kế toán trưởng' },
        { action: 'CREATE_USER', details: 'Tạo tài khoản nhân viên mới cho Đỗ Thị F' }
      )
    } else if (u.role === 'CHIEF_ACCOUNTANT') {
      mockLogs.push(
        { action: 'APPROVE_BUDGET', details: 'Phê duyệt ngân sách quý II phòng kinh doanh' },
        { action: 'EXPORT_REPORT', details: 'Xuất báo cáo lưu chuyển tiền tệ tháng 04/2026' }
      )
    } else if (u.role === 'ACCOUNTANT') {
      mockLogs.push(
        { action: 'CREATE_TRANSACTION', details: 'Hạch toán hóa đơn tiền điện tháng 4: -$320.00' },
        { action: 'UPDATE_TRANSACTION', details: 'Cập nhật ghi chú giao dịch ID #42880' }
      )
    } else if (u.role === 'CASHIER') {
      mockLogs.push(
        { action: 'CREATE_TRANSACTION', details: 'Ghi nhận doanh thu bán hàng ca sáng: +$1,250.00' }
      )
    }

    for (const log of mockLogs) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: log.action,
          details: log.details,
          ipAddress: '127.0.0.1',
        },
      })
    }

    // Seed mock notifications
    await prisma.notification.deleteMany({
      where: { userId: user.id },
    })

    const mockNotifications = [
      {
        type: 'SYSTEM' as const,
        status: 'UNREAD' as const,
        title: 'Chào mừng đến với Finlo!',
        message: 'Finlo giúp bạn quản lý tài chính cá nhân một cách thông minh, rõ ràng và trực quan. Hãy bắt đầu bằng cách thêm các tài khoản ví của bạn nhé!',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        type: 'TRANSACTION' as const,
        status: 'UNREAD' as const,
        title: 'Giao dịch mới hoàn thành',
        message: 'Bạn đã thực hiện giao dịch chi tiêu "Ăn sáng phở bò" trị giá 45.000 đ từ Ví tiền mặt.',
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        type: 'BUDGET' as const,
        status: 'UNREAD' as const,
        title: 'Cảnh báo hạn mức ngân sách',
        message: 'Hạn mức chi tiêu cho danh mục "Ăn uống" trong tháng này đã đạt 80%. Vui lòng cân đối chi tiêu hợp lý.',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        type: 'SECURITY' as const,
        status: 'READ' as const,
        title: 'Đăng nhập từ thiết bị mới',
        message: 'Tài khoản của bạn vừa được đăng nhập thành công từ thiết bị Windows sử dụng trình duyệt Chrome tại địa chỉ IP 127.0.0.1.',
        readAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      }
    ]

    for (const notif of mockNotifications) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: notif.type,
          status: notif.status,
          title: notif.title,
          message: notif.message,
          readAt: notif.readAt ?? null,
          createdAt: notif.createdAt,
        }
      })
    }
  }

  console.log('Seed completed: roles, permissions, role_permissions, users, activity_logs, notifications')
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
