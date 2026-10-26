import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import NextTopLoader from '@/components/NextTopLoader';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
  weight: ['500', '600', '700'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  themeColor: '#1E40AF',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  title: 'DataAbeg | Buy Cheap Nigerian Mobile Data Instantly',
  description:
    'Buy cheap mobile data bundles in Nigeria starting from ₦290/GB with 30-day validity. Instant 5-second automated delivery with automated bank transfer & instant wallet funding.',
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
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
      style={{ backgroundColor: '#f8fafc', color: '#0f172a', colorScheme: 'light' }}
    >
      <head>
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
        </AuthProvider>
      </body>
    </html>
  );
}

