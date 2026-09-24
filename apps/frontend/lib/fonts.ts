import { Inter, Space_Grotesk } from 'next/font/google'

/**
 * Premium type system. `variable` injects the families as CSS custom properties
 * on <html>, which the `font-sans` / `font-display` utilities resolve. If the
 * Google Fonts fetch fails at build/dev time, the font stack gracefully falls
 * back to system families via the fallbacks baked into the assignments below.
 */
export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
})

export const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
})

export const fontVariables = `${fontSans.variable} ${fontDisplay.variable}`