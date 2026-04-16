import { Anton, Parkinsans, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const parkinsans = Parkinsans({
  variable: "--font-parkinsans",
  weight: ["700", "800"],
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bigjack.vercel.app'),
  title: {
    default: 'BIG JACK | Hamburguesas Brutales en Centro de Lima',
    template: '%s | BIG JACK'
  },
  description: 'Hamburguesas gruesas (no smash) estilo fast food de barrio en Centro de Lima. Pide online o recoge en tienda. Delivery rápido en zonas cercanas.',
  keywords: [
    'hamburguesas centro de lima',
    'hamburguesas lima',
    'comida rápida centro de lima',
    'fast food barrio',
    'no smash burger',
    'delivery centro de lima',
    'big jack',
    'hamburguesas con queso'
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
    title: 'BIG JACK | Hamburguesas Brutales en Centro de Lima',
    description: 'Hamburguesas gruesas, no smash. Fast food de barrio en Centro de Lima con delivery cercano y recojo rápido.',
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
    description: 'Hamburguesas gruesas y rápidas en Centro de Lima. Pide por WhatsApp o recoge en tienda.',
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
        className={`${poppins.variable} ${anton.variable} ${parkinsans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
