import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import ClosedBanner from "../features/shop/components/ClosedBanner";
import ShopOverlays from "../features/shop/components/overlays/ShopOverlays";
import { ShopProvider } from "../features/shop/context/ShopContext";

// Carta, producto y "Quiénes somos" comparten header, carrito y footer.
// El estado del carrito persiste al navegar entre estas páginas.
export default function ShopLayout({ children }) {
  return (
    <ShopProvider>
      <a
        href="#contenido"
        className="sr-only z-[80] rounded-xl bg-bj-yellow px-4 py-3 font-bold text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <div className="flex min-h-dvh flex-col overflow-x-clip">
        <SiteHeader />
        <ClosedBanner />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
      <ShopOverlays />
    </ShopProvider>
  );
}
