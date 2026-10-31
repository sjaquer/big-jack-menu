"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useShop } from "../context/ShopContext";

// Compatibilidad con links antiguos `/?openCart=true`: abre el carrito una vez y limpia la URL.
export default function ClientSearchParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { openCart } = useShop();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current || searchParams?.get("openCart") !== "true") return;
    handled.current = true;
    openCart();
    router.replace(pathname, { scroll: false });
  }, [searchParams, openCart, router, pathname]);

  return null;
}
