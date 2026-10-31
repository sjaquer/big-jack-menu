"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Toast from "../../../../components/Toast";
import { useShop } from "../../context/ShopContext";
import ClientSearchParams from "../ClientSearchParams";
import FloatingCartBar from "../FloatingCartBar";

// Los diálogos se descargan solo cuando se abren por primera vez.
const CartDrawer = dynamic(() => import("../CartDrawer"));
const ProductSheet = dynamic(() => import("./ProductSheet"));
const UpsellSheet = dynamic(() => import("./UpsellSheet"));
const OrderConfirmation = dynamic(() => import("./OrderConfirmation"));

export default function ShopOverlays() {
  const { toast, dismissToast, confirmToast, isCartOpen, sheet, upsell, order } = useShop();

  return (
    <>
      <FloatingCartBar />
      {isCartOpen && <CartDrawer />}
      {sheet && <ProductSheet />}
      {upsell.isOpen && <UpsellSheet />}
      {order.confirmation && <OrderConfirmation />}
      <Toast toast={toast} onDismiss={dismissToast} onConfirm={confirmToast} />
      <Suspense fallback={null}>
        <ClientSearchParams />
      </Suspense>
    </>
  );
}
