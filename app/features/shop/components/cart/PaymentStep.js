"use client";

import { formatPhone } from "../../../../lib/site";
import { useShop } from "../../context/ShopContext";
import { PAYMENT_METHODS } from "../../constants";
import Field from "./Field";
import FormSection from "./FormSection";
import SegmentedChoice from "./SegmentedChoice";

export default function PaymentStep() {
  const { checkout, isOpen } = useShop();
  const isDelivery = isOpen && checkout.orderType === "delivery";
  const method = checkout.paymentMethod;

  return (
    <FormSection title="¿Cómo pagas?">
      <SegmentedChoice
        name="payment-method"
        label="Método de pago"
        value={method}
        onChange={checkout.setPaymentMethod}
        options={PAYMENT_METHODS.map((entry) => ({
          id: entry.id,
          label: entry.label,
          disabled: isDelivery && !entry.delivery,
        }))}
      />
      {isDelivery && (
        <p className="text-sm text-neutral-400">
          {method === "tarjeta"
            ? "Te mandamos el link de pago por WhatsApp."
            : method === "efectivo"
              ? "Para delivery: Yape, Plin o tarjeta."
              : `Yapea o plinea al ${formatPhone()} y manda la captura por WhatsApp.`}
        </p>
      )}
      <div className="pt-4">
        <Field
          id="checkout-notes"
          label="Nota para la cocina (opcional)"
          multiline
          value={checkout.notes}
          onChange={(event) => checkout.setNotes(event.target.value)}
          placeholder="Sin pepinillos, salsas aparte…"
          maxLength={200}
        />
      </div>
    </FormSection>
  );
}
