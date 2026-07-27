import { getTranslations } from 'next-intl/server'
import { CustomCursor } from '@/components/motion/CustomCursor'
import { AudioProvider } from './AudioProvider'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { SmoothScroll } from './SmoothScroll'

export async function PublicChrome({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('common')

  return (
    <SmoothScroll>
      <AudioProvider>
        <div className="oe-marketing-shell min-h-[100dvh] bg-oe-deep-space">
          <CustomCursor />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-oe-aurora-violet-deep focus:px-4 focus:py-2 focus:text-oe-pure-light focus:outline-none focus:ring-2 focus:ring-oe-solar-gold"
          >
            {t('skipToContent')}
          </a>
          <Navbar />
          <main id="main-content" className="min-h-[100dvh]">
            {children}
          </main>
          <Footer />
        </div>
      </AudioProvider>
    </SmoothScroll>
  )
}
