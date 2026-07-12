'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  addWorkspaceMembership,
  approveWorkspaceMembership,
  setUserRole,
  suspendWorkspaceMembership,
} from '../actions'
import {
  APP_ROLES,
  initialWorkspaceActionState,
  type AppRole,
  type WorkspaceActionState,
  type WorkspaceMember,
} from '../types'
import { cn } from '@/lib/utils'
import { WorkspaceActionFeedback } from './WorkspaceActionFeedback'

const NEW_MEMBER = 'new-member'

export function WorkspaceMembersAdmin({
  workspaceId,
  members,
}: {
  workspaceId: string
  members: WorkspaceMember[]
}) {
  const t = useTranslations('admin.members')
  const roles = useTranslations('roles')
  const statuses = useTranslations('membershipStatus')
  const locale = useLocale()
  const router = useRouter()
  const addFormRef = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<WorkspaceActionState>(initialWorkspaceActionState)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })

  function run(
    userId: string,
    action: (formData: FormData) => Promise<WorkspaceActionState>,
    formData: FormData
  ) {
    setPendingUserId(userId)
    setState(initialWorkspaceActionState)
    startTransition(async () => {
      try {
        const result = await action(formData)
        setState(result)
        if (result.status === 'success') {
          if (userId === NEW_MEMBER) addFormRef.current?.reset()
          router.refresh()
        }
      } catch {
        setState({ status: 'error', error: 'failed' })
      } finally {
        setPendingUserId(null)
      }
    })
  }

  function membershipAction(
    userId: string,
    action: (formData: FormData) => Promise<WorkspaceActionState>
  ) {
    const formData = new FormData()
    formData.set('workspaceId', workspaceId)
    formData.set('userId', userId)
    run(userId, action, formData)
  }

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="add-workspace-member-title"
        className="border-y border-oe-warm-sand/15 py-5"
      >
        <h2 id="add-workspace-member-title" className="font-serif text-xl text-oe-pure-light">
          {t('addTitle')}
        </h2>
        <form
          ref={addFormRef}
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            formData.set('workspaceId', workspaceId)
            run(NEW_MEMBER, addWorkspaceMembership, formData)
          }}
          className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
          aria-busy={isPending && pendingUserId === NEW_MEMBER}
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <label
              htmlFor="new-member-email"
              className="block text-xs font-medium text-oe-pure-light/60"
            >
              {t('email')}
            </label>
            <input
              id="new-member-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              placeholder={t('emailPlaceholder')}
              className="w-full rounded-lg border border-oe-warm-sand/20 bg-oe-warm-sand/[0.04] px-4 py-3 text-sm text-oe-pure-light placeholder:text-oe-pure-light/35 focus:border-oe-solar-gold focus:outline-none focus:ring-2 focus:ring-oe-solar-gold/30"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="min-h-11 rounded-full bg-oe-solar-gold px-6 py-3 text-sm font-semibold text-oe-depth-warm hover:bg-oe-warm-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold focus-visible:ring-offset-2 focus-visible:ring-offset-oe-depth-warm disabled:opacity-50"
          >
            {isPending && pendingUserId === NEW_MEMBER ? t('adding') : t('add')}
          </button>
        </form>
        <WorkspaceActionFeedback state={state} className="mt-3" />
      </section>

      <dl className="grid gap-x-8 gap-y-4 border-b border-oe-warm-sand/15 pb-6 sm:grid-cols-2">
        {APP_ROLES.map((role) => (
          <div key={role} className="grid grid-cols-[6rem_1fr] gap-3">
            <dt className="text-sm font-medium text-oe-warm-sand">{roles(role)}</dt>
            <dd className="text-sm leading-relaxed text-oe-pure-light/50">
              {t(`roleDescriptions.${role}`)}
            </dd>
          </div>
        ))}
      </dl>

      {members.length === 0 ? (
        <p className="py-6 text-sm text-oe-pure-light/50">{t('empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-oe-warm-sand/15">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <caption className="sr-only">{t('description')}</caption>
            <thead className="bg-oe-warm-sand/[0.05] text-xs text-oe-pure-light/55">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t('name')}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t('role')}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t('status')}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t('joined')}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const emailName = member.email?.split('@')[0]
                const name = member.displayName?.trim() || emailName || t('unnamed')
                const rowPending = isPending && pendingUserId === member.userId
                const mustDemote = member.role === 'admin' && member.status === 'active'

                return (
                  <tr key={member.userId} className="border-t border-oe-warm-sand/10 align-top">
                    <th scope="row" className="px-4 py-4 font-medium text-oe-pure-light">
                      <span className="flex items-center gap-3">
                        {member.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.avatarUrl}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-oe-warm-sand/15 text-xs text-oe-warm-sand"
                            aria-hidden="true"
                          >
                            {name[0]?.toUpperCase() ?? '?'}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block max-w-48 truncate">{name}</span>
                          {member.email ? (
                            <span className="mt-0.5 block max-w-56 truncate text-xs font-normal text-oe-pure-light/45">
                              {member.email}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </th>
                    <td className="px-4 py-4">
                      <form
                        className="flex items-center gap-2"
                        onSubmit={(event) => {
                          event.preventDefault()
                          run(member.userId, setUserRole, new FormData(event.currentTarget))
                        }}
                      >
                        <input type="hidden" name="userId" value={member.userId} />
                        <label htmlFor={`role-${member.userId}`} className="sr-only">
                          {t('role')}: {name}
                        </label>
                        <select
                          id={`role-${member.userId}`}
                          name="role"
                          defaultValue={member.role}
                          disabled={isPending}
                          className="rounded-lg border border-oe-warm-sand/20 bg-oe-depth-warm px-2 py-2 text-xs text-oe-pure-light focus:border-oe-solar-gold focus:outline-none focus:ring-2 focus:ring-oe-solar-gold/30 disabled:opacity-50"
                        >
                          {APP_ROLES.map((role: AppRole) => (
                            <option key={role} value={role}>
                              {roles(role)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={isPending}
                          className="min-h-9 rounded-lg border border-oe-warm-sand/25 px-3 text-xs text-oe-warm-sand hover:border-oe-solar-gold hover:text-oe-solar-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold disabled:opacity-50"
                        >
                          {rowPending ? t('working') : t('saveRole')}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'font-medium',
                          member.status === 'active' && 'text-oe-living-green',
                          member.status === 'pending' && 'text-oe-solar-gold',
                          member.status === 'suspended' && 'text-red-200'
                        )}
                      >
                        {statuses(member.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-oe-pure-light/55">
                      {dateFormatter.format(new Date(member.joinedAt))}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        disabled={isPending || mustDemote}
                        title={mustDemote ? t('demoteFirst') : undefined}
                        onClick={() =>
                          membershipAction(
                            member.userId,
                            member.status === 'active'
                              ? suspendWorkspaceMembership
                              : approveWorkspaceMembership
                          )
                        }
                        className={cn(
                          'min-h-9 rounded-lg px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold disabled:opacity-50',
                          member.status === 'active'
                            ? 'border border-red-200/25 text-red-100 hover:border-red-200/60'
                            : 'bg-oe-solar-gold text-oe-depth-warm hover:bg-oe-warm-sand'
                        )}
                      >
                        {mustDemote
                          ? t('demoteFirst')
                          : rowPending
                            ? t('working')
                            : t(member.status === 'active' ? 'suspend' : 'approve')}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
