import './globals.css';
import { Comfortaa, Inter, Roboto, Sarabun } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

import { Notification } from '@/components/ui';

const comfortaa = Comfortaa({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-comfortaa',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const sarabun = Sarabun({
  subsets: ['latin', 'thai'],
  variable: '--font-sarabun',
  display: 'swap',
  weight: ['400', '700', '800'],
});

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-roboto',
  display: 'swap',
  weight: ['400', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400'],
});

const shellBg = '#0d0524';

export const viewport: Viewport = {
  themeColor: shellBg,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Blunno',
  description: 'Your gentle companion for anxiety and ADHD',
  applicationName: 'Blunno',
  appleWebApp: {
    capable: true,
    title: 'Blunno',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${comfortaa.variable} ${sarabun.variable} ${roboto.variable} ${inter.variable} min-h-dvh overflow-x-hidden bg-blunno-bg`}
    >
      <body className="min-h-dvh w-full max-w-[100vw] overflow-x-hidden font-sans text-blunno-foreground antialiased">
        {children}
        <Notification />
      </body>
    </html>
  );
}
