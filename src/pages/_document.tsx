import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        {/* إصلاح مشكلة self is not defined */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof self === 'undefined') {
                global.self = global;
              }
              if (typeof window === 'undefined') {
                global.window = global;
              }
              if (typeof document === 'undefined') {
                global.document = {};
              }
              if (typeof globalThis === 'undefined') {
                global.globalThis = global;
              }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}