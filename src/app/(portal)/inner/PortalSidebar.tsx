'use client'

import { useRef, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  BookOpen,
  Building2,
  Compass,
  Flame,
  Home,
  LogOut,
  Map,
  Menu,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { signOut } from '@/features/auth'
import { WorkspaceSwitcher, type AppRole } from '@/features/workspaces/components'
import { cn } from '@/lib/utils'

interface PortalSidebarProps {
  userName?: string | null
  userImage?: string | null
  role: AppRole
  workspaces: Array<{ id: string; name: string }>
  activeWorkspaceId?: string | null
}

const navItems = [
  { href: '/inner', key: 'dashboard', icon: Home, disabled: false },
  { href: '/inner/journal', key: 'journal', icon: BookOpen, disabled: false },
  { href: '/inner/practice', key: 'practice', icon: Flame, disabled: false },
  { href: '/inner/map', key: 'map', icon: Map, disabled: false },
  { href: '/inner/guide', key: 'guide', icon: Sparkles, disabled: false },
  { href: '/inner/settings', key: 'settings', icon: Settings, disabled: false },
  { href: '/inner/paths', key: 'paths', icon: Compass, disabled: true },
] as const

const adminItems = [
  { href: '/inner/admin/members', key: 'members', icon: Users },
  { href: '/inner/admin/workspaces', key: 'workspaces', icon: Building2 },
] as const

export function PortalSidebar({
  userName,
  userImage,
  role,
  workspaces,
  activeWorkspaceId,
}: PortalSidebarProps) {
  const pathname = usePathname()
  const navigation = useTranslations('workspace.navigation')
  const sidebar = useTranslations('workspace.sidebar')
  const roles = useTranslations('roles')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isSigningOut, startSignOut] = useTransition()

  function closeMenu() {
    dialogRef.current?.close()
  }

  function handleSignOut() {
    startSignOut(() => {
      void signOut()
    })
  }

  function navLink(
    item: (typeof navItems)[number] | (typeof adminItems)[number],
    closeAfterNavigation = false
  ) {
    const isDisabled = 'disabled' in item && item.disabled
    const isActive = item.href === '/inner' ? pathname === '/inner' : pathname.startsWith(item.href)
    const className = cn(
      'flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold',
      isActive
        ? 'bg-oe-warm-sand/10 text-oe-warm-sand'
        : 'text-oe-pure-light/55 hover:bg-oe-warm-sand/5 hover:text-oe-warm-sand',
      isDisabled && 'opacity-35'
    )
    const content = (
      <>
        <item.icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        <span>{navigation(item.key)}</span>
        {isDisabled ? (
          <span className="ml-auto text-[10px] text-oe-pure-light/45">{sidebar('comingSoon')}</span>
        ) : null}
      </>
    )

    return isDisabled ? (
      <span key={item.href} className={className} aria-disabled="true">
        {content}
      </span>
    ) : (
      <Link
        key={item.href}
        href={item.href}
        onClick={closeAfterNavigation ? closeMenu : undefined}
        aria-current={isActive ? 'page' : undefined}
        className={className}
      >
        {content}
      </Link>
    )
  }

  function sidebarContent(id: string, closeAfterNavigation = false) {
    return (
      <>
        <div className="border-b border-oe-warm-sand/10 px-6 py-5">
          <Link
            href="/inner"
            onClick={closeAfterNavigation ? closeMenu : undefined}
            className="font-serif text-lg text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
          >
            OneEmergence
          </Link>
        </div>

        <div className="border-b border-oe-warm-sand/10 py-4">
          <WorkspaceSwitcher
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            id={`workspace-switcher-${id}`}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav aria-label={navigation('dashboard')} className="space-y-1">
            {navItems.map((item) => navLink(item, closeAfterNavigation))}
          </nav>

          {role === 'admin' ? (
            <nav aria-label={sidebar('administration')} className="mt-7 space-y-1">
              <p className="px-3 pb-2 text-xs font-medium text-oe-pure-light/40">
                {sidebar('administration')}
              </p>
              {adminItems.map((item) => navLink(item, closeAfterNavigation))}
            </nav>
          ) : null}
        </div>

        <div className="border-t border-oe-warm-sand/10 px-3 py-4">
          <div className="flex items-center gap-3 px-3 pb-3">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-oe-warm-sand/15 text-xs text-oe-warm-sand"
                aria-hidden="true"
              >
                {userName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm text-oe-pure-light/75">
                {userName ?? sidebar('traveler')}
              </p>
              <p className="text-xs text-oe-pure-light/40">{roles(role)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-oe-pure-light/50 transition-colors hover:bg-oe-warm-sand/5 hover:text-oe-warm-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {isSigningOut ? sidebar('signingOut') : sidebar('signOut')}
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="fixed left-4 top-4 z-30 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-oe-warm-sand/20 bg-oe-depth-warm text-oe-warm-sand md:hidden"
        aria-label={sidebar('menuOpen')}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeMenu()
        }}
        className="fixed inset-y-0 left-0 m-0 h-[100dvh] max-h-none w-72 max-w-[88vw] bg-transparent p-0 text-oe-pure-light backdrop:bg-oe-deep-space/75 md:hidden"
      >
        <aside className="flex h-full flex-col border-r border-oe-warm-sand/10 bg-oe-depth-warm">
          <button
            type="button"
            onClick={closeMenu}
            aria-label={sidebar('menuClose')}
            className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-full text-oe-warm-sand/70 hover:text-oe-warm-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          {sidebarContent('mobile', true)}
        </aside>
      </dialog>

      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-oe-warm-sand/10 bg-oe-depth-warm md:flex">
        {sidebarContent('desktop')}
      </aside>
    </>
  )
}
