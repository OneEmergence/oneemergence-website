import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Praxis',
  description: 'Meditation, Atemarbeit und Klanglandschaften für deine tägliche Praxis.',
}

const practices = [
  {
    title: 'Meditation',
    description:
      'Stille finden. Ein Timer begleitet dich durch deine Sitzung — ohne Ablenkung, ohne Bewertung.',
    href: '/inner/practice/meditation',
    accent: 'oe-aurora-violet',
  },
  {
    title: 'Atemarbeit',
    description:
      'Geführte Atemmuster für Ruhe, Klarheit und innere Kohärenz. Der Atem als Brücke zwischen Körper und Geist.',
    href: '/inner/practice/breathwork',
    accent: 'oe-spirit-cyan',
  },
  {
    title: 'Klanglandschaft',
    description:
      'Heilsame Klänge und Frequenzen für tiefere Präsenz.',
    href: '#',
    accent: 'oe-solar-gold',
    disabled: true,
  },
]

export default function PracticePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold text-oe-pure-light md:text-4xl">
        Praxis
      </h1>
      <p className="mt-3 text-sm text-oe-pure-light/50">
        Wähle eine Praxis. Kein Ziel, kein Leistungsdruck — nur Präsenz.
      </p>

      <div className="mt-8 grid gap-4">
        {practices.map((practice) => {
          const content = (
            <div
              key={practice.title}
              className={`rounded-xl border p-6 transition-colors ${
                practice.disabled
                  ? 'cursor-not-allowed border-oe-pure-light/5 bg-oe-pure-light/[0.02] opacity-50'
                  : 'border-oe-pure-light/10 bg-oe-pure-light/[0.03] hover:border-oe-pure-light/20'
              }`}
            >
              <h2 className="font-serif text-xl font-semibold text-oe-pure-light">
                {practice.title}
              </h2>
              <p className="mt-2 text-sm text-oe-pure-light/50">
                {practice.description}
              </p>
              {practice.disabled && (
                <span className="mt-3 inline-block text-xs text-oe-pure-light/30">
                  Bald verfügbar
                </span>
              )}
            </div>
          )

          if (practice.disabled) {
            return <div key={practice.title}>{content}</div>
          }

          return (
            <Link key={practice.title} href={practice.href}>
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
