'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { exportUserData, deleteAccount } from '../actions'
import { DELETE_CONFIRMATION } from '../schemas'

export function DangerZone() {
  const [confirmation, setConfirmation] = useState('')
  const [exportMsg, setExportMsg] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isExporting, startExport] = useTransition()
  const [isDeleting, startDelete] = useTransition()

  const canDelete = confirmation === DELETE_CONFIRMATION

  function handleExport() {
    setExportMsg(null)
    startExport(async () => {
      const result = await exportUserData()
      if (!result.success) {
        setExportMsg(result.error)
        return
      }
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: 'application/json',
      })
      const href = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = href
      const date = new Date().toISOString().slice(0, 10)
      a.download = `oneemergence-daten-${date}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(href)
      setExportMsg('Deine Daten wurden als JSON-Datei heruntergeladen.')
    })
  }

  function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    if (!canDelete) return
    setDeleteError(null)
    const fd = new FormData()
    fd.set('confirmation', confirmation)
    startDelete(async () => {
      // On success the account is gone and the action redirects to '/'.
      const result = await deleteAccount(fd)
      if (result.status === 'error') setDeleteError(result.error)
    })
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-oe-pure-light">Deine Daten</h2>
        <p className="mt-1 text-sm text-oe-pure-light/40">
          Privatsphäre ist absolut. Nimm alles mit — oder lösche alles.
        </p>
      </div>

      {/* Export */}
      <div className="rounded-xl border border-oe-warm-sand/10 p-5">
        <h3 className="text-sm font-medium text-oe-pure-light">Daten exportieren</h3>
        <p className="mt-1 text-xs text-oe-pure-light/40">
          Lade alles herunter, was du hier geschrieben, praktiziert und
          besprochen hast — als offene JSON-Datei.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className={cn(
            'mt-3 rounded-full border border-oe-warm-sand/20 px-4 py-2 text-xs text-oe-pure-light/80',
            'transition-colors hover:border-oe-solar-gold/50 hover:text-oe-pure-light',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold/40',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {isExporting ? 'Sammle deine Daten …' : 'Daten herunterladen (JSON)'}
        </button>
        {exportMsg && <p className="mt-2 text-xs text-oe-pure-light/50">{exportMsg}</p>}
      </div>

      {/* Delete */}
      <div className="rounded-xl border border-red-500/25 bg-red-500/[0.04] p-5">
        <h3 className="text-sm font-medium text-red-300">Konto löschen</h3>
        <p className="mt-1 text-xs text-oe-pure-light/50">
          Dies entfernt dein Konto und alle deine Daten unwiderruflich. Es gibt
          kein Zurück. Tippe{' '}
          <span className="font-semibold text-red-300">{DELETE_CONFIRMATION}</span>,
          um zu bestätigen.
        </p>
        <form onSubmit={handleDelete} className="mt-3 space-y-3">
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={DELETE_CONFIRMATION}
            aria-label={`Tippe ${DELETE_CONFIRMATION} zur Bestätigung`}
            className={cn(
              'w-full max-w-xs rounded-lg border border-red-500/30 bg-transparent px-4 py-2.5',
              'text-sm text-oe-pure-light placeholder:text-oe-pure-light/25',
              'focus:border-red-500/60 focus:outline-none focus:ring-1 focus:ring-red-500/40'
            )}
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canDelete || isDeleting}
              className={cn(
                'rounded-full bg-red-500/90 px-5 py-2 text-xs font-medium text-white',
                'transition-colors hover:bg-red-500',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400',
                'disabled:cursor-not-allowed disabled:opacity-40'
              )}
            >
              {isDeleting ? 'Wird gelöscht …' : 'Konto endgültig löschen'}
            </button>
            {deleteError && <span className="text-xs text-red-300">{deleteError}</span>}
          </div>
        </form>
      </div>
    </section>
  )
}
