import { Anton, Poppins } from "next/font/google";
import "./globals.css";
import { restaurantInfo } from "./data/menuData";
import JsonLd from "./components/JsonLd";
import { buildRestaurantSchema } from "./features/shop/seo";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { GA_MEASUREMENT_ID, GOOGLE_SITE_VERIFICATION, GTM_ID, SITE_URL } from "./lib/site";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const TITLE = "BIG JACK | Hamburguesas artesanales en el Centro de Lima";
const DESCRIPTION =
  "Hamburguesas gruesas a la plancha en el Centro de Lima: carne de res, queso derretido y salsas de la casa. Mira la carta con precios y pide para recojo o delivery.";
const OG_IMAGE = {
  url: "/images/og-bigjack.jpg",
  width: 1200,
  height: 630,
  alt: "BIG JACK, hamburguesas en el Centro de Lima",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f0f12",
  colorScheme: "dark",
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s | ${restaurantInfo.name}` },
  description: DESCRIPTION,
  applicationName: restaurantInfo.name,
  keywords: [
    "hamburguesas centro de lima",
    "hamburguesas artesanales lima",
    "hamburguesas gruesas",
    "delivery de hamburguesas lima",
    "big jack lima",
    "carta big jack",
  ],
  authors: [{ name: restaurantInfo.name }],
  creator: restaurantInfo.name,
  publisher: restaurantInfo.name,
  category: "food",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: restaurantInfo.name,
    locale: "es_PE",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: { google: GOOGLE_SITE_VERIFICATION },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-PE" className={`${poppins.variable} ${anton.variable}`}>
      <body className="antialiased">
        <JsonLd data={buildRestaurantSchema()} />
        {children}
      </body>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      {GA_MEASUREMENT_ID && !GTM_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
    </html>
  );
}
