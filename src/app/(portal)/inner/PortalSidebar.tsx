'use client'

import { useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from '@/features/auth'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  Compass,
  Flame,
  Home,
  LogOut,
  Map,
  Menu,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'

interface PortalSidebarProps {
  userName?: string | null
  userImage?: string | null
}

const navItems = [
  { href: '/inner', label: 'Dashboard', icon: Home, disabled: false },
  { href: '/inner/journal', label: 'Journal', icon: BookOpen, disabled: false },
  { href: '/inner/practice', label: 'Praxis', icon: Flame, disabled: false },
  { href: '/inner/map', label: 'Karte', icon: Map, disabled: false },
  { href: '/inner/guide', label: 'Guide', icon: Sparkles, disabled: false },
  { href: '/inner/settings', label: 'Einstellungen', icon: Settings, disabled: false },
  { href: '/inner/paths', label: 'Pfade', icon: Compass, disabled: true },
] as const

export function PortalSidebar({ userName, userImage }: PortalSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isSigningOut, startSignOut] = useTransition()

  function handleSignOut() {
    // Server action clears the session cookies and redirects to '/'.
    startSignOut(() => {
      void signOut()
    })
  }

  function renderNav(onNavigate?: () => void) {
    return (
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/inner'
              ? pathname === '/inner'
              : pathname.startsWith(item.href)

          const isGuide = item.href === '/inner/guide'

          return (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-warm-sand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-oe-depth-warm',
                isActive
                  ? 'bg-oe-warm-sand/10 text-oe-warm-sand'
                  : 'text-oe-pure-light/50 hover:bg-oe-warm-sand/5 hover:text-oe-warm-sand/80',
                item.disabled && 'pointer-events-none opacity-30'
              )}
              aria-disabled={item.disabled}
            >
              <item.icon
                className={cn(
                  'h-4 w-4',
                  isGuide && (isActive ? 'text-oe-aurora-violet' : 'text-oe-aurora-violet/50')
                )}
              />
              {item.label}
              {item.disabled && (
                <span className="ml-auto text-[10px] uppercase tracking-wider text-oe-pure-light/20">
                  Bald
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    )
  }

  function renderUserSection() {
    return (
      <div className="border-t border-oe-warm-sand/10 px-3 py-4">
        <div className="flex items-center gap-3 px-3 pb-3">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImage}
              alt=""
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-oe-warm-sand/20 text-xs text-oe-warm-sand">
              {userName?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <span className="truncate text-sm text-oe-pure-light/70">
            {userName ?? 'Reisender'}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-oe-pure-light/40 transition-colors hover:bg-oe-warm-sand/5 hover:text-oe-warm-sand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-warm-sand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-oe-depth-warm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {isSigningOut ? 'Wird abgemeldet …' : 'Abmelden'}
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-full border border-oe-warm-sand/10 bg-oe-depth-warm/80 p-2 backdrop-blur-sm md:hidden"
        aria-label="Menü öffnen"
      >
        <Menu className="h-5 w-5 text-oe-warm-sand/70" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar (animated drawer) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-oe-warm-sand/10 bg-oe-depth-warm md:hidden"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-oe-warm-sand/10 px-6 py-5">
              <Link href="/inner" className="font-serif text-lg text-oe-pure-light">
                OneEmergence
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5 text-oe-warm-sand/50" />
              </button>
            </div>
            {renderNav(() => setMobileOpen(false))}
            {renderUserSection()}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar (always visible) */}
      <aside className="hidden w-64 flex-col border-r border-oe-warm-sand/10 bg-oe-depth-warm md:flex">
        <div className="border-b border-oe-warm-sand/10 px-6 py-5">
          <Link href="/inner" className="font-serif text-lg text-oe-pure-light">
            OneEmergence
          </Link>
        </div>
        {renderNav()}
        {renderUserSection()}
      </aside>
    </>
  )
}
