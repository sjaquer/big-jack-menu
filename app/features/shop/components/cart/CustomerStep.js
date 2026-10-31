"use client";

import { useShop } from "../../context/ShopContext";
import Field from "./Field";
import FormSection from "./FormSection";

export default function CustomerStep() {
  const { checkout } = useShop();

  return (
    <FormSection title="Tus datos">
      <Field
        id="checkout-name"
        label="Nombre"
        value={checkout.customerName}
        onChange={(event) => checkout.setCustomerName(event.target.value)}
        autoComplete="name"
        placeholder="¿A nombre de quién?"
        maxLength={60}
      />
      <Field
        id="checkout-phone"
        label="Teléfono"
        type="tel"
        inputMode="tel"
        value={checkout.customerPhone}
        onChange={(event) => checkout.setCustomerPhone(event.target.value)}
        autoComplete="tel"
        placeholder="9 dígitos"
        hint="Solo para avisarte si hay algún cambio."
        maxLength={20}
      />
    </FormSection>
  );
}
