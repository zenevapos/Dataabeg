import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta name="theme-color" content="#090d16" />
      </head>
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
