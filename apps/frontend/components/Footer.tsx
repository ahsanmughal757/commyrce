import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-separator">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 text-sm text-foreground/60 sm:px-6 lg:px-8">
        <div role="separator" className="h-px w-full max-w-3xl bg-separator" />
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="text-base font-bold text-foreground">
            Comm:rce
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/products">Shop</Link>
          <Link href="/account">Account</Link>
          <Link href="/admin">Admin</Link>
        </div>
        <p>Demo storefront — powered by Comm:rce.</p>
      </div>
    </footer>
  )
}