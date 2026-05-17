import Script from 'next/script'
import { THEME_COOKIE } from '@/lib/theme'

const themeScript = `
(function () {
  try {
    var match = document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);
    var theme = match ? decodeURIComponent(match[1]) : 'system';
    var dark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`

export function ThemeScript() {
  return (
    <Script
      id="finlo-theme"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  )
}
