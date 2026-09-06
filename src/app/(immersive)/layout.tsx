import { PublicIntlProvider } from '@/i18n/PublicIntlProvider'

export default function ImmersiveLayout({ children }: { children: React.ReactNode }) {
  return <PublicIntlProvider>{children}</PublicIntlProvider>
}
