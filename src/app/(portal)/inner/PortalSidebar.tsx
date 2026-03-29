'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'next-auth/react'
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
  { href: '/inner/paths', label: 'Pfade', icon: Compass, disabled: true },
] as const

export function PortalSidebar({ userName, userImage }: PortalSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-full border border-oe-pure-light/10 bg-oe-deep-space/80 p-2 backdrop-blur-sm md:hidden"
        aria-label="Menü öffnen"
      >
        <Menu className="h-5 w-5 text-oe-pure-light/70" />
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

      {/* Sidebar */}
      <AnimatePresence>
        {(mobileOpen || true) && (
          <motion.aside
            className={cn(
              'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-oe-pure-light/5 bg-oe-deep-space',
              'md:relative md:translate-x-0',
              !mobileOpen && 'max-md:hidden'
            )}
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-oe-pure-light/5 px-6 py-5">
              <Link href="/inner" className="font-serif text-lg text-oe-pure-light">
                OneEmergence
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden"
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5 text-oe-pure-light/50" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/inner'
                    ? pathname === '/inner'
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.disabled ? '#' : item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-oe-aurora-violet/10 text-oe-pure-light'
                        : 'text-oe-pure-light/50 hover:bg-oe-pure-light/5 hover:text-oe-pure-light/80',
                      item.disabled && 'pointer-events-none opacity-30'
                    )}
                    aria-disabled={item.disabled}
                  >
                    <item.icon className="h-4 w-4" />
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

            {/* User section */}
            <div className="border-t border-oe-pure-light/5 px-3 py-4">
              <div className="flex items-center gap-3 px-3 pb-3">
                {userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userImage}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-oe-aurora-violet/20 text-xs text-oe-pure-light">
                    {userName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <span className="truncate text-sm text-oe-pure-light/70">
                  {userName ?? 'Reisender'}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-oe-pure-light/40 transition-colors hover:bg-oe-pure-light/5 hover:text-oe-pure-light/60"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
