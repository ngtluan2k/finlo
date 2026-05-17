import { RolesManagement } from '@/components/system/roles-management'

export const metadata = {
  title: 'Vai trò & Quyền hạn - Finlo Admin',
  description: 'Quản lý danh sách vai trò và thiết lập ma trận phân quyền hệ thống.',
}

export default function SystemRolesPage() {
  return <RolesManagement />
}
