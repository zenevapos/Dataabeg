import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#080d1a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  title: 'DataAbeg | Super Cheap Mobile Data Bundles (MTN, Airtel, Glo, 9mobile)',
  description:
    'Buy cheap mobile data bundles in Nigeria starting from ₦290 per GB with 30-day validity. Instant 5-second automated delivery powered by SMEPlug.',
  keywords: [
    'cheap data nigeria',
    'buy mtn sme data',
    'airtel cg data',
    'glo cheap data',
    '9mobile data reselling',
    'smeplug vtu',
    'dataabeg',
    'buy 1gb for 300'
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
      className="dark scroll-smooth"
      suppressHydrationWarning
      style={{ backgroundColor: '#080d1a', color: '#f8fafc', colorScheme: 'dark' }}
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background-color: #080d1a !important;
                color: #f8fafc !important;
                color-scheme: dark;
              }
            `
          }}
        />
      </head>
      <body
        className="min-h-screen bg-[#080d1a] text-slate-100 antialiased selection:bg-blue-600 selection:text-white font-sans"
        suppressHydrationWarning
        style={{ backgroundColor: '#080d1a', color: '#f8fafc' }}
      >
        {children}
      </body>
    </html>
  );
}
