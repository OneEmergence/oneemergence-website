import Link from 'next/link'
import { cn } from '@/lib/utils'

export type Depth = 'cosmic' | 'solarpunk' | 'warm'

/**
 * Roman numeral + depth name on the orb the homepage ecliptic uses
 * (`.oe-depth-mark` in globals.css). With `href` it becomes the link onward
 * along the descent.
 */
export function DepthMark({
  depth,
  numeral,
  label,
  href,
  className,
  children,
}: {
  depth: Depth
  numeral: string
  label: string
  href?: string
  className?: string
  children?: React.ReactNode
}) {
  const content = (
    <>
      <span aria-hidden="true" className="oe-depth-orb" />
      <span>
        {numeral} · {label}
      </span>
      {children}
    </>
  )

  return href ? (
    <Link href={href} data-depth={depth} className={cn('oe-depth-mark', className)}>
      {content}
    </Link>
  ) : (
    <p data-depth={depth} className={cn('oe-depth-mark', className)}>
      {content}
    </p>
  )
}
