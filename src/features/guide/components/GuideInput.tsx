'use client'

import { useState, useRef, useCallback, useId } from 'react'
import { useTranslations } from 'next-intl'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RoleSelector } from './RoleSelector'
import type { GuideRole } from '../types'

interface GuideInputProps {
  onSend: (message: string, role: GuideRole) => void
  activeRole: GuideRole
  onRoleChange: (role: GuideRole) => void
  disabled?: boolean
}

export function GuideInput({
  onSend,
  activeRole,
  onRoleChange,
  disabled,
}: GuideInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const t = useTranslations('guide')
  // A placeholder is not an accessible name — it disappears on input and is
  // not reliably announced. The composer needs a real label.
  const composerId = useId()

  const handleSubmit = useCallback(() => {
    const trimmed = message.trim()
    if (!trimmed || disabled) return
    onSend(trimmed, activeRole)
    setMessage('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [message, disabled, onSend, activeRole])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  return (
    <div className="border-t border-oe-pure-light/5 bg-oe-deep-space/80 px-4 py-3 backdrop-blur-sm">
      <div className="mb-2">
        <RoleSelector
          activeRole={activeRole}
          onSelect={onRoleChange}
          disabled={disabled}
        />
      </div>

      <div className="flex items-end gap-2">
        <label htmlFor={composerId} className="sr-only">
          {t('composerLabel')}
        </label>
        <textarea
          id={composerId}
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder={t('composerPlaceholder')}
          rows={1}
          className={cn(
            'max-h-[200px] min-h-[44px] flex-1 resize-none rounded-xl border border-oe-pure-light/10 bg-oe-pure-light/5 px-4 py-3 text-sm text-oe-pure-light/90 placeholder-oe-pure-light/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet transition-colors',
            'focus:border-oe-aurora-violet/30 focus:bg-oe-pure-light/[0.07]',
            'disabled:opacity-50'
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all',
            message.trim() && !disabled
              ? 'bg-oe-aurora-violet/20 text-oe-aurora-violet-ink hover:bg-oe-aurora-violet/30'
              : 'bg-oe-pure-light/5 text-oe-pure-light/55'
          )}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
