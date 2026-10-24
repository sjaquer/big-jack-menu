"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ClientSearchParams({ onOpenCart }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    if (searchParams?.get("openCart") !== "true") return;

    handled.current = true;
    onOpenCart?.();
    router.replace("/");
  }, [searchParams, onOpenCart, router]);

  return null;
}
