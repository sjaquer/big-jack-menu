import { Anton, Parkinsans, Poppins } from "next/font/google";
import "./globals.css";
import { menuItems, restaurantInfo, categories } from "./data/menuData";
import {
  buildOpeningHoursSpecification,
  buildMenuSections,
  buildRestaurantSchema,
  buildFaqSchema,
  getComputedPriceRange,
} from "./features/home/seo";
import { DEFAULT_SITE_URL, MARKETING_DESCRIPTION, AREA_SERVED } from "./features/home/constants";

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
    default: 'BIG JACK | Hamburguesas Artesanales en Centro de Lima',
    template: '%s | BIG JACK'
  },
  description: 'Hamburguesas artesanas gruesas con carne 100% de res, queso derretido y salsas de la casa en Centro de Lima. Delivery rápido y recojo al toque.',
  keywords: [
    'hamburguesas artesanales lima',
    'hamburguesas centro de lima',
    'hamburguesas lince',
    'delivery de hamburguesas lima',
    'big jack lima',
    'hamburguesas gruesas',
    'fast food artesanal lima',
    'mejores hamburguesas lima centro'
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
    title: 'BIG JACK | Hamburguesas Artesanales en Centro de Lima',
    description: 'Hamburguesas gruesas con carne 100% de res, queso derretido y salsas de la casa. Pide online con delivery o recojo rápido.',
    url: 'https://bigjack.vercel.app',
    siteName: 'BIG JACK',
    locale: 'es_PE',
    type: 'website',
    images: [
      {
        url: '/images/og-bigjack.png',
        width: 1200,
        height: 630,
        alt: 'BIG JACK - Hamburguesas Artesanales en Centro de Lima',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BIG JACK | Hamburguesas Artesanales en Centro de Lima',
    description: 'Hamburguesas gruesas y jugosas en Centro de Lima. Pide por WhatsApp o recoge en tienda al toque.',
    images: ['/images/og-bigjack.png'],
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
  const computedPriceRange = getComputedPriceRange(menuItems);
  const openingHoursSpecification = buildOpeningHoursSpecification(restaurantInfo.hours);
  const menuSections = buildMenuSections(menuItems, categories);

  const restaurantSchema = buildRestaurantSchema({
    restaurantInfo,
    siteUrl: DEFAULT_SITE_URL,
    marketingDescription: MARKETING_DESCRIPTION,
    computedPriceRange,
    openingHoursSpecification,
    menuSections,
    areaServed: AREA_SERVED,
  });

  const faqSchema = buildFaqSchema();

  return (
    <html lang="es">
      <body
        className={`${poppins.variable} ${anton.variable} ${parkinsans.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
