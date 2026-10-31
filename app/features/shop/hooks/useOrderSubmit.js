"use client";

import { useCallback, useState } from "react";
import { menuItems } from "../../../data/menuData";
import { formatPrice } from "../../../lib/format";
import { formatPhone, whatsappUrl } from "../../../lib/site";
import { submitOnlineOrder } from "../checkout/submitOrder";
import {
  buildDeliveryPaymentReminder,
  buildFriendlyOrderError,
  buildWhatsappOrderMessage,
  PAYMENT_LABELS,
} from "../checkout/orderMessages";

/**
 * Envía el pedido al ERP (vía /api/online-orders) y prepara la confirmación
 * con el mensaje de WhatsApp. El carrito se limpia solo si el ERP respondió OK.
 */
export default function useOrderSubmit({ cart, total, form: rawForm, isOpen, onSuccess, onError }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const submit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const isPreOrder = !isOpen;
      // Fuera de horario solo hay pre-orden para recojo: es lo que ve el cliente en el checkout.
      const form = isPreOrder ? { ...rawForm, orderType: "pickup" } : rawForm;
      const { response, migratedCart } = await submitOnlineOrder({
        cart,
        isPreOrder,
        isOpen,
        menuItems,
        orderType: form.orderType,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        paymentMethod: form.paymentMethod,
        deliveryAddress: form.deliveryAddress,
        deliveryReference: form.deliveryReference,
        deliveryDetails: form.deliveryDetails,
        locationLink: form.locationLink,
        notes: form.notes,
      });

      const businessPhone = formatPhone();
      const paymentReminder =
        form.orderType === "delivery"
          ? buildDeliveryPaymentReminder(form.paymentMethod, businessPhone)
          : null;

      const message = buildWhatsappOrderMessage({ ...form, migratedCart, total, paymentReminder });

      setConfirmation({
        customerName: form.customerName,
        orderMode: form.orderType === "delivery" ? "Delivery" : "Recojo en el local",
        isPreOrder,
        paymentMethod: PAYMENT_LABELS[form.paymentMethod] || form.paymentMethod,
        paymentReminder,
        total: formatPrice(total),
        whatsappUrl: whatsappUrl(message),
        whatsappContact: businessPhone,
        items: migratedCart.map((item) => `${item.quantity}x ${item.name} (${item.optionLabel})`),
        orderId: response?.orderId || null,
        duplicated: Boolean(response?.duplicated),
        whatsappSent: false,
      });

      onSuccess?.();
    } catch (error) {
      const message = buildFriendlyOrderError(error?.message);
      setSubmitError(message);
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, rawForm, isOpen, isSubmitting, onError, onSuccess, total]);

  const openWhatsapp = useCallback(() => {
    if (!confirmation?.whatsappUrl) return;
    window.open(confirmation.whatsappUrl, "_blank", "noopener,noreferrer");
    setConfirmation((current) => (current ? { ...current, whatsappSent: true } : current));
  }, [confirmation]);

  const closeConfirmation = useCallback(() => setConfirmation(null), []);
  const clearSubmitError = useCallback(() => setSubmitError(""), []);

  return {
    isSubmitting,
    submitError,
    clearSubmitError,
    confirmation,
    submit,
    openWhatsapp,
    closeConfirmation,
  };
}
