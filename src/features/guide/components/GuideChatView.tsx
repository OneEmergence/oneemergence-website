'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
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
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [activeRole, setActiveRole] = useState<GuideRole>(initialRole ?? 'mirror')
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasStarted = messages.length > 0

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = useCallback(
    async (message: string, role: GuideRole) => {
      setError(null)
      setIsLoading(true)

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
      }
      setMessages((prev) => [...prev, userMsg])

      try {
        const res = await fetch('/api/guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            role,
            conversationId,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          if (res.status === 503 && data.configurationRequired) {
            setError(
              'Der Guide ist noch nicht bereit — die nötigen Dienste (API-Schlüssel oder Datenbank) sind noch nicht konfiguriert. Bitte versuche es später erneut.'
            )
          } else {
            setError(data.error ?? 'Ein Fehler ist aufgetreten.')
          }
          return
        }

        // Update conversation ID if this was a new conversation
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId)
          // Update URL without navigation
          window.history.replaceState(
            {},
            '',
            `/inner/guide/${data.conversationId}`
          )
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
        setError('Verbindungsfehler. Bitte versuche es erneut.')
      } finally {
        setIsLoading(false)
      }
    },
    [conversationId]
  )

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
          <div className="space-y-4 px-4 py-6">
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-oe-pure-light/30"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-oe-aurora-violet/10">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <span className="text-xs">Der Guide reflektiert...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error display */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto max-w-md rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-center text-sm text-red-400/80"
              >
                {error}
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
      />
    </div>
  )
}
