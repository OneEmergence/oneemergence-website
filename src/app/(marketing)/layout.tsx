import { PublicChrome } from '@/components/layout/PublicChrome'
import { PublicIntlProvider } from '@/i18n/PublicIntlProvider'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicIntlProvider>
      <PublicChrome>{children}</PublicChrome>
    </PublicIntlProvider>
  )
}
