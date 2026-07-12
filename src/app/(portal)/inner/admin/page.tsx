import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/inner/admin/members')
}
