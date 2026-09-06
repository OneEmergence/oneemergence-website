'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, type ComponentProps, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

type ButtonLinkProps = ComponentProps<typeof Link> & Pick<ButtonProps, 'variant' | 'size'>

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-oe-aurora-violet-deep text-white hover:opacity-90 active:opacity-80',
  outline:
    'border border-oe-spirit-cyan text-oe-spirit-cyan hover:bg-oe-spirit-cyan/10 active:bg-oe-spirit-cyan/20',
  ghost: 'text-oe-pure-light hover:text-oe-solar-gold active:text-oe-solar-gold/80',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
    variantStyles[variant],
    sizeStyles[size],
    className
  )
}

/** Navigation uses one anchor; buttons remain reserved for actions. */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={buttonClasses(variant, size, className)}
        disabled={disabled}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
