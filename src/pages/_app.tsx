import type { AppProps } from 'next/app'
import '@/lib/polyfills' // استيراد polyfills في بداية التطبيق

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}