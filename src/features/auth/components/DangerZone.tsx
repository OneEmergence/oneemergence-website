'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { deleteAccount, exportUserData } from '../actions'
import { DELETE_CONFIRMATION } from '../schemas'

type ExportFeedback = { kind: 'success' | 'error'; message: string } | null

export function DangerZone() {
  const t = useTranslations('profile.danger')
  const [confirmation, setConfirmation] = useState('')
  const [exportFeedback, setExportFeedback] = useState<ExportFeedback>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isExporting, startExport] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const canDelete = confirmation === DELETE_CONFIRMATION

  function translatedDeleteError(error: string) {
    switch (error) {
      case 'deletion-unavailable':
        return t('errors.deletionUnavailable')
      case 'recent-sign-in-required':
        return t('errors.recentSignInRequired')
      case 'admin-deletion-forbidden':
        return t('errors.adminDeletionForbidden')
      case 'deletion-failed':
        return t('errors.deletionFailed')
      default:
        return error
    }
  }

  function handleExport() {
    setExportFeedback(null)
    startExport(async () => {
      try {
        const result = await exportUserData()
        if (!result.success) {
          setExportFeedback({ kind: 'error', message: result.error })
          return
        }

        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json',
        })
        const href = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = href
        anchor.download = `oneemergence-data-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        URL.revokeObjectURL(href)
        setExportFeedback({ kind: 'success', message: t('exportSuccess') })
      } catch {
        setExportFeedback({ kind: 'error', message: t('exportFailed') })
      }
    })
  }

  function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canDelete) return
    setDeleteError(null)
    const formData = new FormData()
    formData.set('confirmation', confirmation)
    startDelete(async () => {
      try {
        const result = await deleteAccount(formData)
        if (result.status === 'error') {
          setDeleteError(translatedDeleteError(result.error))
        }
      } catch {
        setDeleteError(t('errors.deletionFailed'))
      }
    })
  }

  return (
    <section className="space-y-6" aria-labelledby="danger-zone-title">
      <div>
        <h2 id="danger-zone-title" className="font-serif text-xl text-oe-pure-light">
          {t('title')}
        </h2>
        <p className="mt-1 text-sm text-oe-pure-light/45">{t('description')}</p>
      </div>

      <div className="rounded-xl border border-oe-warm-sand/10 p-5">
        <h3 className="text-sm font-medium text-oe-pure-light">{t('exportTitle')}</h3>
        <p className="mt-1 text-xs leading-relaxed text-oe-pure-light/45">
          {t('exportDescription')}
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className={cn(
            'mt-3 min-h-10 rounded-full border border-oe-warm-sand/25 px-4 py-2 text-xs text-oe-pure-light/80',
            'transition-colors hover:border-oe-solar-gold hover:text-oe-pure-light',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {isExporting ? t('exporting') : t('export')}
        </button>
        <div className="mt-2 min-h-4 text-xs" aria-live="polite" aria-atomic="true">
          {exportFeedback ? (
            <p
              role={exportFeedback.kind === 'error' ? 'alert' : 'status'}
              className={exportFeedback.kind === 'error' ? 'text-red-200' : 'text-oe-living-green'}
            >
              {exportFeedback.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-red-400/30 bg-red-950/15 p-5">
        <h3 className="text-sm font-medium text-red-200">{t('deleteTitle')}</h3>
        <p className="mt-1 text-xs leading-relaxed text-oe-pure-light/55">
          {t.rich('deleteDescription', {
            confirmation: () => (
              <span className="font-semibold text-red-200">{DELETE_CONFIRMATION}</span>
            ),
          })}
        </p>
        <form onSubmit={handleDelete} className="mt-4 space-y-3" aria-busy={isDeleting}>
          <label htmlFor="delete-confirmation" className="sr-only">
            {t('confirmationLabel', { confirmation: DELETE_CONFIRMATION })}
          </label>
          <input
            id="delete-confirmation"
            name="confirmation"
            type="text"
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={DELETE_CONFIRMATION}
            aria-invalid={Boolean(deleteError) || undefined}
            aria-describedby={deleteError ? 'delete-account-error' : undefined}
            className={cn(
              'w-full max-w-xs rounded-lg border border-red-300/35 bg-transparent px-4 py-3',
              'text-sm text-oe-pure-light placeholder:text-oe-pure-light/30',
              'focus:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-200/30'
            )}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!canDelete || isDeleting}
              className={cn(
                'min-h-10 rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white',
                'transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300',
                'disabled:cursor-not-allowed disabled:opacity-40'
              )}
            >
              {isDeleting ? t('deleting') : t('delete')}
            </button>
            <div
              id="delete-account-error"
              className="min-h-4 text-xs text-red-200"
              aria-live="assertive"
              aria-atomic="true"
            >
              {deleteError ? <p role="alert">{deleteError}</p> : null}
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
