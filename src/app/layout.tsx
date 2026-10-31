import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import NextTopLoader from '@/components/NextTopLoader';
import SupportChatWidget from '@/components/SupportChatWidget';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'DataAbeg | Buy Cheap Nigerian Mobile Data Instantly',
  description:
    'Buy cheap mobile data bundles in Nigeria starting from ₦290/GB with 30-day validity. Instant 5-second automated delivery with automated bank transfer & instant wallet funding.',
  manifest: '/manifest.json',
  icons: {
    icon: '/playstore-icon-512.png',
    apple: '/playstore-icon-512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DataAbeg',
  },
  keywords: [
    'cheap data nigeria',
    'buy mtn sme data',
    'airtel cg data',
    'glo cheap data',
    '9mobile data reselling',
    'smeplug vtu',
    'dataabeg',
    'instant data topup nigeria'
  ],
  authors: [{ name: 'DataAbeg Team' }],
  openGraph: {
    title: 'DataAbeg - Super Cheap Mobile Data in Nigeria',
    description: 'Instant 5-second delivery of MTN, Airtel, Glo & 9mobile data bundles with 30 days validity from ₦290.',
    url: 'https://dataabeg.com',
    siteName: 'DataAbeg',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DataAbeg - Cheap Nigerian Mobile Data',
    description: 'Get MTN 1GB for ₦290 with 30 days validity. Instant automated dispensing.'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      style={{ backgroundColor: '#f8fafc', color: '#0f172a', colorScheme: 'light' }}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/playstore-icon-512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DataAbeg" />
        <meta name="application-name" content="DataAbeg" />
        <meta name="theme-color" content="#4f46e5" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background-color: #f8fafc !important;
                color: #0f172a !important;
                color-scheme: light;
              }
            `
          }}
        />
      </head>
      <body
        className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-blue-600 selection:text-white font-sans"
        suppressHydrationWarning
        style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}
      >
        <NextTopLoader color="#4F46E5" height={3} showSpinner={false} />
        <AuthProvider>
          {children}
          <SupportChatWidget />
          <PwaInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
