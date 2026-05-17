import { ProfileDetails } from '@/components/dashboard/profile-details'

export const metadata = {
  title: 'Hồ sơ cá nhân | Finlo',
  description: 'Quản lý thông tin tài khoản và cấu hình bảo mật cá nhân trên Finlo.',
}

export default function ProfilePage() {
  return <ProfileDetails />
}
