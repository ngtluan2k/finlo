import { UsersManagement } from '@/components/system/users-management'

export const metadata = {
  title: 'Quản lý người dùng - Finlo Admin',
  description: 'Quản trị danh sách người dùng và phân quyền hệ thống Finlo.',
}

export default function SystemUsersPage() {
  return <UsersManagement />
}
