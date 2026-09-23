'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@heroui/react'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger' | 'danger-soft'

interface ButtonLinkProps {
  href: string
  children: ReactNode
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullWidth?: boolean
  isDisabled?: boolean
  isIconOnly?: boolean
  ariaLabel?: string
  onNavigate?: () => void
}

/**
 * HeroUI Button that renders as a Next.js Link, avoiding the v2 `asChild` pattern.
 */
export default function ButtonLink({
  href,
  children,
  variant,
  size,
  className,
  fullWidth,
  isDisabled,
  isIconOnly,
  ariaLabel,
  onNavigate
}: ButtonLinkProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      fullWidth={fullWidth}
      isDisabled={isDisabled}
      isIconOnly={isIconOnly}
      aria-label={ariaLabel}
      render={(props) => {
        const anchorProps = props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>
        return (
          <Link
            href={href}
            {...anchorProps}
            onClick={(e) => {
              anchorProps.onClick?.(e)
              onNavigate?.()
            }}
          />
        )
      }}
    >
      {children}
    </Button>
  )
}