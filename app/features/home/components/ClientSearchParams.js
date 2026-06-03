"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ClientSearchParams({ onOpenCart }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      if (searchParams?.get("openCart") === "true") {
        onOpenCart?.();
      }
    } catch (e) {}
  }, [searchParams, onOpenCart]);

  return null;
}
