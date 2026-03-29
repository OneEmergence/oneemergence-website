'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GUIDE_ROLES } from '../types'
import { PromptCardDisplay } from './PromptCardDisplay'
import { ExerciseDisplay } from './ExerciseDisplay'
import { VisualActivation } from './VisualActivation'
import type { GuideResponse, GuideRole } from '../types'

interface GuideMessageProps {
  role: 'user' | 'assistant'
  content: string
  guideRole?: GuideRole
  structuredResponse?: GuideResponse | null
  conversationId?: string
}

export function GuideMessage({
  role,
  content,
  guideRole,
  structuredResponse,
  conversationId,
}: GuideMessageProps) {
  const isUser = role === 'user'
  const roleMeta = guideRole
    ? GUIDE_ROLES.find((r) => r.id === guideRole)
    : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Guide avatar */}
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-oe-aurora-violet/10 text-sm">
          {roleMeta?.icon ?? '✦'}
        </div>
      )}

      <div
        className={cn(
          'max-w-[85%] space-y-3',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Role label for assistant */}
        {!isUser && roleMeta && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-oe-pure-light/30">
            {roleMeta.label}
          </span>
        )}

        {/* Text content */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-oe-aurora-violet/15 text-oe-pure-light/90'
              : 'bg-oe-pure-light/5 text-oe-pure-light/80'
          )}
        >
          {/* Render text with paragraph breaks */}
          {content.split('\n\n').map((paragraph, i) => (
            <p key={i} className={i > 0 ? 'mt-3' : ''}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Structured response elements */}
        {structuredResponse && (
          <div className="space-y-3">
            {/* Visual activation */}
            {structuredResponse.visualActivation && (
              <VisualActivation mode={structuredResponse.visualActivation} />
            )}

            {/* Prompt cards */}
            {structuredResponse.cards?.map((card, i) => (
              <PromptCardDisplay
                key={i}
                card={card}
                conversationId={conversationId}
              />
            ))}

            {/* Exercise */}
            {structuredResponse.exercise && (
              <ExerciseDisplay exercise={structuredResponse.exercise} />
            )}

            {/* Map suggestions */}
            {structuredResponse.mapSuggestions &&
              structuredResponse.mapSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {structuredResponse.mapSuggestions.map((label, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-oe-spirit-cyan/20 bg-oe-spirit-cyan/5 px-2.5 py-0.5 text-[11px] text-oe-spirit-cyan/60"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>

      {/* User avatar spacer */}
      {isUser && <div className="w-8 shrink-0" />}
    </motion.div>
  )
}
