import { SearchX } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-foreground/10">
        <SearchX className="size-7" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-foreground/60">The page you are looking for doesn&apos;t exist or has been moved.</p>
      <ButtonLink href="/">Back home</ButtonLink>
    </div>
  )
}