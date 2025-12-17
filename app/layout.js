import { Anton, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bigjack.vercel.app'),
  title: {
    default: 'BIG JACK | Hamburguesas Brutales en Lince, Lima',
    template: '%s | BIG JACK'
  },
  description: 'Hamburguesas gruesas (no smash) estilo fast food de barrio en Lince. Pide online o recoge en Jr. Bartolomé Herrera 133. Delivery rápido en zonas cercanas.',
  keywords: [
    'hamburguesas lince',
    'hamburguesas lima',
    'comida rápida lince',
    'fast food barrio',
    'no smash burger',
    'delivery lince',
    'big jack',
    'hamburguesas con queso',
    'jr bartolome herrera 133'
  ],
  authors: [{ name: 'BIG JACK Perú' }],
  creator: 'BIG JACK Perú S.A.C.',
  publisher: 'BIG JACK Perú',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'BIG JACK | Hamburguesas Brutales en Lince',
    description: 'Hamburguesas gruesas, no smash. Fast food de barrio en Lince con delivery cercano y recojo rápido.',
    url: 'https://bigjack.vercel.app',
    siteName: 'BIG JACK',
    locale: 'es_PE',
    type: 'website',
    images: [
      {
        url: '/images/baconjack.webp',
        width: 1200,
        height: 630,
        alt: 'BIG JACK - Hamburguesas Brutales',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BIG JACK | Hamburguesas Brutales',
    description: 'Hamburguesas gruesas y rápidas en Lince. Pide por WhatsApp o recoge en tienda.',
    images: ['/images/baconjack.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
