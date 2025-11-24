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
  description: 'Hamburguesas brutales con sabor que prende fuego. Pide online o recoge en tienda. Ubicados en Jirón Bartolomé Herrera 133, Lince, Lima. Delivery disponible.',
  keywords: ['hamburguesas', 'burgers', 'comida rápida', 'Lince', 'Lima', 'delivery', 'fast food', 'BIG JACK', 'hamburguesas Lima', 'mejor hamburguesa'],
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
    description: 'Hamburguesas brutales con sabor que prende fuego. Pide online o recoge en tienda.',
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
    description: 'Hamburguesas brutales con sabor que prende fuego en Lince, Lima.',
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
