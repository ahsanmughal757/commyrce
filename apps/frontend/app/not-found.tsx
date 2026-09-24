import { SearchX } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'

export default function NotFound() {
  return (
    <div className="flex animate-fade-in flex-col items-center gap-4 py-24 text-center">
      <div className="relative">
        <div className="aurora aurora-accent -inset-8 opacity-30" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-separator bg-surface text-foreground/50 shadow-[var(--surface-shadow)]">
          <SearchX className="size-8" />
        </div>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-foreground/60">The page you are looking for doesn't exist or has been moved.</p>
      <ButtonLink href="/" className="shine">
        Back home
      </ButtonLink>
    </div>
  )
}