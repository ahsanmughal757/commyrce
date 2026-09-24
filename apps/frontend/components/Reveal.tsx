'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/format'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Transition delay in ms — use for stagger effects in grids. */
  delay?: number
  id?: string
  style?: CSSProperties
}

/**
 * Scroll-triggered reveal. Content starts hidden only once `html.js` is present
 * (set in the root layout); an IntersectionObserver flips `.is-visible` when the
 * element enters the viewport. Respects reduced-motion via global CSS.
 */
export default function Reveal({ children, className, delay = 0, id, style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-visible')
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      id={id}
      className={cn('reveal', className)}
      style={{ ...style, ...(delay ? { ['--reveal-delay' as string]: `${delay}ms` } : {}) }}
    >
      {children}
    </div>
  )
}