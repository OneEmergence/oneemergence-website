'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GuideMessage } from './GuideMessage'
import { GuideInput } from './GuideInput'
import { GuideWelcome } from './GuideWelcome'
import type { GuideRole, GuideResponse } from '../types'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  guideRole?: GuideRole
  structuredResponse?: GuideResponse | null
}

interface Failure {
  text: string
  calm: boolean
  retry: { message: string; role: GuideRole } | null
}

interface GuideChatViewProps {
  initialMessages?: ChatMessage[]
  initialRole?: GuideRole
  conversationId?: string
}

export function GuideChatView({
  initialMessages = [],
  initialRole,
  conversationId: initialConversationId,
}: GuideChatViewProps) {
  const t = useTranslations('guide')
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [activeRole, setActiveRole] = useState<GuideRole>(initialRole ?? 'mirror')
  // Stable before the first request: a lost, failed or cancelled first
  // response retries into the same conversation instead of creating another.
  const [conversationId] = useState(() => initialConversationId ?? crypto.randomUUID())
  const [isLoading, setIsLoading] = useState(false)
  const [failure, setFailure] = useState<Failure | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasStarted = messages.length > 0

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const send = useCallback(
    async (message: string, role: GuideRole, isRetry: boolean) => {
      setFailure(null)
      setIsLoading(true)

      // A retry resends the message that is already shown.
      if (!isRetry) {
        const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content: message,
        }
        setMessages((prev) => [...prev, userMsg])
      }

      const controller = new AbortController()
      abortRef.current = controller
      const retry = { message, role }

      try {
        const res = await fetch('/api/guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            role,
            conversationId,
          }),
          signal: controller.signal,
        })

        const data = await res.json()

        // Once the server confirms the conversation, keep it addressable.
        const path = `/inner/guide/${conversationId}`
        if (data.conversationId && window.location.pathname !== path) {
          window.history.replaceState({}, '', path)
        }

        if (!res.ok) {
          if (data.code === 'limit_reached') {
            setFailure({ text: t('limitReached'), calm: true, retry: null })
          } else if (res.status === 503 && data.configurationRequired) {
            setFailure({ text: t('notConfigured'), calm: false, retry })
          } else {
            setFailure({ text: data.error ?? t('error'), calm: false, retry })
          }
          return
        }

        const response = data.response as GuideResponse

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.text,
          guideRole: response.role,
          structuredResponse: response,
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch {
        setFailure(
          controller.signal.aborted
            ? { text: t('cancelled'), calm: true, retry }
            : { text: t('connectionError'), calm: false, retry }
        )
      } finally {
        abortRef.current = null
        setIsLoading(false)
      }
    },
    [conversationId, t]
  )

  const handleSend = useCallback(
    (message: string, role: GuideRole) => send(message, role, false),
    [send]
  )

  const handleCancel = useCallback(() => abortRef.current?.abort(), [])

  const handleRoleSelect = (role: GuideRole) => {
    setActiveRole(role)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!hasStarted ? (
          <GuideWelcome onRoleSelect={handleRoleSelect} />
        ) : (
          <div
            // On the list, not the scroll container, so scroll position
            // changes are not announced. SC 4.1.3: focus stays in the composer
            // after send, so without this nothing announced that the request
            // started, that the guide replied, or that it failed.
            // Phase 2 token streaming must buffer and promote finished
            // sentences here, otherwise this fires once per token.
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label={t('conversation')}
            className="space-y-4 px-4 py-6"
          >
            {messages.map((msg) => (
              <GuideMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                guideRole={msg.guideRole}
                structuredResponse={msg.structuredResponse}
                conversationId={conversationId}
              />
            ))}

            {/* Loading indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  role="status"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-oe-pure-light/55"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-oe-aurora-violet/10">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  </div>
                  <span className="text-xs">{t('thinking')}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Failure display: calm for cancel/limit, alert for errors */}
            {failure && (
              <motion.div
                role={failure.calm ? 'status' : 'alert'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'mx-auto max-w-md rounded-xl border px-4 py-3 text-center text-sm',
                  failure.calm
                    ? 'border-oe-pure-light/10 bg-oe-pure-light/[0.03] text-oe-pure-light/75'
                    : 'border-red-500/25 bg-red-500/5 text-red-300'
                )}
              >
                <p>{failure.text}</p>
                {failure.retry && (
                  <button
                    type="button"
                    onClick={() =>
                      failure.retry && send(failure.retry.message, failure.retry.role, true)
                    }
                    className="mt-2 rounded-lg bg-oe-aurora-violet/20 px-3 py-1.5 text-xs text-oe-aurora-violet-ink transition-colors hover:bg-oe-aurora-violet/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet"
                  >
                    {t('retry')}
                  </button>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <GuideInput
        onSend={handleSend}
        activeRole={activeRole}
        onRoleChange={handleRoleSelect}
        disabled={isLoading}
        onCancel={isLoading ? handleCancel : undefined}
      />
    </div>
  )
}
