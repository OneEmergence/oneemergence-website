'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useMotionLevel } from '@/hooks/useMotionLevel'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

function InputField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  id: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`block text-xs font-semibold uppercase tracking-widest mb-2 transition-colors duration-200 ${
          focused ? 'text-oe-spirit-cyan' : 'text-oe-pure-light/55'
        }`}
      >
        {label}
        {required && <span className="ml-1 text-oe-solar-gold">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-oe-aurora-violet/5 border rounded-xl px-5 py-3.5 text-sm text-oe-pure-light placeholder-oe-pure-light/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet transition-all duration-200 ${
          focused
            ? 'border-oe-spirit-cyan/50 ring-1 ring-oe-spirit-cyan/20'
            : 'border-oe-aurora-violet/20 hover:border-oe-aurora-violet/40'
        }`}
      />
    </div>
  )
}

function SelectField({
  label,
  id,
  value,
  onChange,
  options,
}: {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`block text-xs font-semibold uppercase tracking-widest mb-2 transition-colors duration-200 ${
          focused ? 'text-oe-spirit-cyan' : 'text-oe-pure-light/55'
        }`}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-oe-aurora-violet/5 border rounded-xl px-5 py-3.5 text-sm text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet transition-all duration-200 appearance-none cursor-pointer ${
          focused
            ? 'border-oe-spirit-cyan/50 ring-1 ring-oe-spirit-cyan/20'
            : 'border-oe-aurora-violet/20 hover:border-oe-aurora-violet/40'
        }`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-oe-deep-space text-oe-pure-light">
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-4 top-[2.85rem] text-oe-pure-light/55">
        ↓
      </div>
    </div>
  )
}

function TextareaField({
  label,
  id,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`block text-xs font-semibold uppercase tracking-widest mb-2 transition-colors duration-200 ${
          focused ? 'text-oe-spirit-cyan' : 'text-oe-pure-light/55'
        }`}
      >
        {label}
        {required && <span className="ml-1 text-oe-solar-gold">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        rows={6}
        className={`w-full bg-oe-aurora-violet/5 border rounded-xl px-5 py-3.5 text-sm text-oe-pure-light placeholder-oe-pure-light/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet transition-all duration-200 resize-none ${
          focused
            ? 'border-oe-spirit-cyan/50 ring-1 ring-oe-spirit-cyan/20'
            : 'border-oe-aurora-violet/20 hover:border-oe-aurora-violet/40'
        }`}
      />
    </div>
  )
}

export default function ContactPage() {
  const t = useTranslations('contact')
  const flowEnabled = useMotionLevel('flow')
  const subjects = [
    t('subjects.general'),
    t('subjects.events'),
    t('subjects.community'),
    t('subjects.press'),
    t('subjects.technical'),
    t('subjects.other'),
  ]
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    subject: subjects[0],
    message: '',
  })
  const [draftPrepared, setDraftPrepared] = useState(false)
  const emailBody = `${form.message}\n\n${t('name')}: ${form.name}\n${t('email')}: ${form.email}`
  const draftHref = `mailto:hello@oneemergence.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(emailBody)}`

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDraftPrepared(true)
  }

  return (
    <div className="relative isolate overflow-hidden bg-oe-deep-space text-oe-pure-light">
      <LayerAtmosphere variant="transitional" />
      <section className="flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[50vh] px-6 pt-20 sm:pt-24 pb-10 sm:pb-12 text-center">
        <motion.p
          data-motion-level="flow"
          initial={flowEnabled ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet-ink"
        >
          {t('eyebrow')}
        </motion.p>
        <motion.h1
          data-motion-level="flow"
          initial={flowEnabled ? { opacity: 0, y: 24 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-4xl sm:text-5xl leading-tight text-oe-solar-gold md:text-6xl"
        >
          {t('title')}
        </motion.h1>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-oe-pure-light/60">
          {t('intro')}
        </p>
      </section>

      <section className="px-4 sm:px-6 pb-24 sm:pb-32">
        <div className="mx-auto max-w-2xl">
          <form
            onSubmit={handleSubmit}
            aria-label={t('formLabel')}
            aria-describedby="contact-draft-help"
            className="rounded-2xl border border-oe-aurora-violet/20 bg-oe-aurora-violet/5 px-4 py-7 sm:px-8 sm:py-10 md:px-12 space-y-5 sm:space-y-7"
          >
            <p id="contact-draft-help" className="text-sm leading-relaxed text-oe-pure-light/70">
              {t('draftHelp')}
            </p>
            <div className="grid grid-cols-1 gap-5 md:gap-7 md:grid-cols-2">
              <InputField
                label={t('name')}
                id="name"
                value={form.name}
                onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                placeholder={t('namePlaceholder')}
                required
              />
              <InputField
                label={t('email')}
                id="email"
                type="email"
                value={form.email}
                onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                placeholder={t('emailPlaceholder')}
                required
              />
            </div>
            <SelectField
              label={t('subject')}
              id="subject"
              value={form.subject}
              onChange={(value) => setForm((current) => ({ ...current, subject: value }))}
              options={subjects}
            />
            <TextareaField
              label={t('message')}
              id="message"
              value={form.message}
              onChange={(value) => setForm((current) => ({ ...current, message: value }))}
              placeholder={t('messagePlaceholder')}
              required
            />
            <p className="text-xs text-oe-pure-light/55">{t('requiredFields')}</p>
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-xl bg-oe-aurora-violet/20 border border-oe-aurora-violet/40 text-sm font-semibold text-oe-pure-light hover:bg-oe-aurora-violet/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan transition-colors duration-200"
            >
              {t('prepareDraft')}
            </button>
            {draftPrepared && (
              <div className="rounded-xl border border-oe-spirit-cyan/30 bg-oe-spirit-cyan/5 p-5">
                <p role="status" className="text-sm leading-relaxed text-oe-pure-light/80">
                  {t('draftReady')}
                </p>
                <a
                  href={draftHref}
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-oe-spirit-cyan underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
                >
                  {t('openDraft')}
                </a>
              </div>
            )}
          </form>
          <p className="mt-6 text-center text-sm leading-relaxed text-oe-pure-light/70">
            {t('emailFallback')}{' '}
            <a
              href="mailto:hello@oneemergence.com"
              className="inline-flex min-h-11 items-center text-oe-spirit-cyan underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
            >
              hello@oneemergence.com
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
