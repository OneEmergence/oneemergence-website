'use client'

import { useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { updateAvatarUrl } from '../actions'

const MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

interface AvatarUploadProps {
  userId: string
  initialUrl: string | null
  displayName: string | null
}

export function AvatarUpload({ userId, initialUrl, displayName }: AvatarUploadProps) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!ALLOWED.includes(file.type)) {
      setError('Bitte wähle ein Bild (JPG, PNG, WebP oder GIF).')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Das Bild ist zu groß (max. 2 MB).')
      return
    }

    startTransition(async () => {
      try {
        const supabase = createClient()
        // Path MUST be prefixed with the user id — the storage RLS policy only
        // allows writes inside the user's own `auth.uid()` folder.
        // A stable key makes replacements overwrite the previous avatar instead
        // of accumulating personal files that later need separate retention.
        const path = `${userId}/avatar`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, file, {
            upsert: true,
            contentType: file.type,
            cacheControl: '0',
          })

        if (uploadError) {
          setError('Upload fehlgeschlagen. Bitte versuche es erneut.')
          return
        }

        const publicUrl = supabase.storage.from('avatars').getPublicUrl(path)
          .data.publicUrl

        const result = await updateAvatarUrl(publicUrl)
        if (result.status === 'error') {
          setError(result.error)
          return
        }
        setUrl(`${publicUrl}?v=${Date.now()}`)
      } catch {
        setError('Upload fehlgeschlagen. Bitte versuche es erneut.')
      }
    })
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 overflow-hidden rounded-full border border-oe-warm-sand/20 bg-oe-warm-sand/10">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg text-oe-warm-sand">
            {displayName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className={cn(
            'rounded-full border border-oe-warm-sand/20 px-4 py-2 text-xs text-oe-pure-light/70',
            'transition-colors hover:border-oe-solar-gold/50 hover:text-oe-pure-light',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold/40',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {isPending ? 'Lädt hoch …' : 'Profilbild ändern'}
        </button>
        <p className="text-[11px] text-oe-pure-light/55">JPG, PNG, WebP · max. 2 MB</p>
        {error && <p className="text-[11px] text-red-300">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
