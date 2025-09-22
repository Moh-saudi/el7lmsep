import type { Metadata } from 'next';
import '@/lib/polyfills';
import './globals.css';
import { Providers } from './providers';
// import { Toaster } from 'react-hot-toast';
// import { MantineProvider, ColorSchemeScript } from '@mantine/core';
// import { ToastContainer } from 'react-toastify';
// import { Analytics } from '@vercel/analytics/react';
// import ClarityProvider from '@/components/analytics/ClarityProvider';
// import ClarityUserTracker from '@/components/analytics/ClarityUserTracker';
// import GoogleTagManager from '@/components/analytics/GoogleTagManager';
// import GTMDataLayer from '@/components/analytics/GTMDataLayer';
// import { inter, cairo, optimizeFontLoading } from '@/lib/fonts';
// import { handleRuntimeErrors } from '@/lib/runtime-error-handler';
// import '@mantine/core/styles.css';
// import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: 'El7lm - منصة كرة القدم المتكاملة',
  description: 'منصة شاملة لإدارة كرة القدم واللاعبين والأندية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
