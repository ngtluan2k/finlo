import { ActivityLogManagement } from '@/components/system/activity-log-management'

export const metadata = {
  title: 'Nhật ký hoạt động - Finlo Admin',
  description: 'Tra cứu kiểm toán lịch sử hoạt động và các thay đổi trong hệ thống.',
}

export default function SystemActivityLogPage() {
  return <ActivityLogManagement />
}
