'use client'

import { useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence, useMotionTemplate, useScroll, useTransform } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudio } from '@/components/layout/AudioProvider'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { IntensityToggle } from '@/components/ui/IntensityToggle'
import { useMotionLevel } from '@/hooks/useMotionLevel'

const navLinks = [
  { href: '/manifesto', key: 'manifesto' },
  { href: '/map', key: 'map' },
  { href: '/experiences', key: 'experiences' },
  { href: '/library', key: 'library' },
  { href: '/events', key: 'events' },
  { href: '/community', key: 'community' },
  { href: '/about', key: 'about' },
] as const

function AmbientAudioToggle() {
  const t = useTranslations('nav')
  const { isPlaying, toggle } = useAudio()
  const allowSacred = useMotionLevel('sacred')

  return (
    <motion.button
      type="button"
      onClick={toggle}
      disabled={!allowSacred}
      aria-label={isPlaying ? t('audioMuteAria') : t('audioUnmuteAria')}
      aria-pressed={isPlaying}
      data-motion-level="micro"
      className={cn(
        'relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-500 disabled:cursor-not-allowed disabled:opacity-50',
        isPlaying
          ? 'border-oe-spirit-cyan/60 text-oe-spirit-cyan'
          : 'border-oe-pure-light/20 text-oe-pure-light/55 hover:border-oe-pure-light/40 hover:text-oe-pure-light/70'
      )}
      whileTap={{ scale: 0.9 }}
    >
      {isPlaying && allowSacred && (
        <motion.span
          aria-hidden="true"
          data-motion-level="sacred"
          className="absolute inset-0 rounded-full bg-oe-spirit-cyan/10"
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {isPlaying ? (
        <Volume2 size={14} strokeWidth={1.5} />
      ) : (
        <VolumeX size={14} strokeWidth={1.5} />
      )}
    </motion.button>
  )
}

export function Navbar() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const allowFlow = useMotionLevel('flow')

  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.92])
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1])
  const bgColor = useMotionTemplate`rgba(10, 15, 31, ${bgOpacity})`

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !menuOpen) return
        event.preventDefault()
        closeMenu()
        menuToggleRef.current?.focus()
      }}
      style={{
        backgroundColor: bgColor,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px bg-oe-aurora-violet/30"
        style={{ opacity: borderOpacity }}
      />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="group flex min-h-11 items-center gap-2">
          <motion.span
            className="font-serif text-lg sm:text-xl text-oe-solar-gold"
            whileHover={{ opacity: 0.85 }}
            transition={{ duration: 0.2 }}
          >
            OneEmergence
          </motion.span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-6 lg:flex">
          {navLinks.map(({ href, key }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <li key={href}>
                <MagneticButton as="span" strength={0.3}>
                  <Link
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      // min-h-11 enlarges the hit area to the WCAG 2.2 target
                      // size without changing the visual row height.
                      'relative inline-flex min-h-11 items-center text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'text-oe-solar-gold'
                        : 'text-oe-pure-light/70 hover:text-oe-pure-light'
                    )}
                  >
                    {t(key)}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-px bg-oe-solar-gold"
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      />
                    )}
                  </Link>
                </MagneticButton>
              </li>
            )
          })}
        </ul>

        {/* Intensity + Audio toggle + CTA (desktop) */}
        <div className="hidden items-center gap-3 lg:flex">
          <IntensityToggle />
          <AmbientAudioToggle />

          <MagneticButton as="span" strength={0.3}>
            <Link
              href="/community"
              className="rounded-full bg-oe-aurora-violet-deep px-5 py-2 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-85"
            >
              {t('joinCta')}
            </Link>
          </MagneticButton>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={menuToggleRef}
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? t('menuCloseAria') : t('menuOpenAria')}
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          className="flex flex-col gap-1.5 p-2.5 -m-1 min-h-[44px] min-w-[44px] items-center justify-center lg:hidden"
        >
          <span
            className={cn(
              'block h-px w-6 bg-oe-pure-light origin-center transition-all duration-300',
              menuOpen ? 'translate-y-[7px] rotate-45' : ''
            )}
          />
          <span
            className={cn(
              'block h-px w-6 bg-oe-pure-light transition-all duration-300',
              menuOpen ? 'opacity-0 scale-x-0' : ''
            )}
          />
          <span
            className={cn(
              'block h-px bg-oe-pure-light origin-center transition-all duration-300',
              menuOpen ? 'w-6 -translate-y-[7px] -rotate-45' : 'w-4'
            )}
          />
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            id={menuId}
            data-motion-level="flow"
            initial={allowFlow ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: 'auto' }}
            exit={allowFlow ? { opacity: 0, height: 0 } : undefined}
            transition={{ duration: allowFlow ? 0.28 : 0, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-oe-aurora-violet/20 lg:hidden"
            style={{ backgroundColor: 'rgba(10, 15, 31, 0.97)', backdropFilter: 'blur(12px)' }}
          >
            <div className="flex flex-col px-6 py-5 gap-1 max-h-[calc(100dvh-64px)] overflow-y-auto">
              {navLinks.map(({ href, key }) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`)
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={closeMenu}
                    className={cn(
                      'py-3 text-base font-medium border-b border-oe-aurora-violet/10 last:border-0 transition-colors duration-200',
                      isActive
                        ? 'text-oe-solar-gold'
                        : 'text-oe-pure-light/70 hover:text-oe-pure-light'
                    )}
                  >
                    {t(key)}
                  </Link>
                )
              })}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-oe-pure-light/50">{t('intensityLabel')}</span>
                <div className="flex items-center gap-3">
                  <IntensityToggle />
                  <AmbientAudioToggle />
                </div>
              </div>
              <Link
                href="/community"
                onClick={closeMenu}
                className="mt-3 rounded-full bg-oe-aurora-violet-deep px-5 py-3 text-sm font-medium text-white text-center transition-opacity duration-200 hover:opacity-85"
              >
                {t('joinCta')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
