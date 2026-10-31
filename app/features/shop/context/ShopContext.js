"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { menuItems } from "../../../data/menuData";
import useCart from "../hooks/useCart";
import useCartActions from "../hooks/useCartActions";
import useCheckoutForm from "../hooks/useCheckoutForm";
import useGeolocation from "../hooks/useGeolocation";
import useNotice from "../hooks/useNotice";
import useOpenStatus from "../hooks/useOpenStatus";
import useOrderSubmit from "../hooks/useOrderSubmit";
import useToast from "../hooks/useToast";
import useUpsell from "../hooks/useUpsell";

const ShopContext = createContext(null);

/**
 * Estado compartido de la tienda (carta, producto, carrito y checkout).
 * Vive en `app/(shop)/layout.js`, así el carrito persiste al navegar entre páginas.
 */
export function ShopProvider({ children }) {
  const cartApi = useCart({ menuItems });
  const status = useOpenStatus();
  const toastApi = useToast();
  const noticeApi = useNotice();
  const checkout = useCheckoutForm();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sheet, setSheet] = useState(null); // { product, optionId }

  const upsell = useUpsell();
  const actions = useCartActions({
    cartApi,
    showToast: toastApi.showToast,
    showNotice: noticeApi.showNotice,
    onPrimaryAdded: upsell.maybeShow,
  });

  const { showToast } = toastApi;
  const { setLocationLink, setDeliveryReference, setOrderType, setPaymentMethod } = checkout;
  const { deliveryReference, paymentMethod } = checkout.values;

  const handleLocated = useCallback(
    (link, { silent }) => {
      setLocationLink(link);
      if (!deliveryReference.trim()) setDeliveryReference("Ubicación compartida por GPS");
      if (!silent) showToast({ type: "success", message: "Ubicación lista para tu delivery." });
    },
    [deliveryReference, setDeliveryReference, setLocationLink, showToast]
  );
  const handleGeoError = useCallback((message) => showToast({ type: "error", message }), [showToast]);
  const geo = useGeolocation({ onLocated: handleLocated, onError: handleGeoError });

  // Delivery no acepta efectivo (regla de negocio): se cambia a Yape al elegir delivery.
  const selectOrderType = useCallback(
    (type) => {
      setOrderType(type);
      if (type === "delivery" && paymentMethod === "efectivo") setPaymentMethod("yape");
    },
    [paymentMethod, setOrderType, setPaymentMethod]
  );

  const form = checkout.values;

  const order = useOrderSubmit({
    cart: cartApi.cart,
    total: cartApi.total,
    form,
    isOpen: status.isOpen,
    onSuccess: () => {
      cartApi.clearCart();
      checkout.resetAfterOrder();
      setIsCartOpen(false);
    },
    onError: (message) => showToast({ type: "error", message, duration: 8000 }),
  });

  const ui = useMemo(
    () => ({
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      sheet,
      // Hamburguesas con varias presentaciones abren la hoja de opciones;
      // el resto se agrega directo.
      requestAdd: (product, optionId) => {
        if ((product.options?.length || 0) > 1 && !optionId) {
          setSheet({ product, optionId: product.options[0].id });
          return;
        }
        actions.addProduct(product, optionId);
      },
      openSheet: (product, optionId) =>
        setSheet({ product, optionId: optionId || product.options?.[0]?.id }),
      closeSheet: () => setSheet(null),
    }),
    [actions, isCartOpen, sheet]
  );

  const value = {
    ...status,
    ...cartApi,
    ...actions,
    ...ui,
    ...toastApi,
    ...noticeApi,
    checkout,
    selectOrderType,
    form,
    geo,
    upsell: {
      ...upsell,
      confirm: () => {
        const entries = upsell.confirm();
        if (entries.length) actions.addMany(entries);
      },
    },
    order,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop debe usarse dentro de ShopProvider");
  return context;
}
