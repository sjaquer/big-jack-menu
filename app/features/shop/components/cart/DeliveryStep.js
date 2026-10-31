"use client";

import { ArrowUpRight, Loader2, LocateFixed } from "lucide-react";
import { restaurantInfo } from "../../../../data/menuData";
import { formatPrepTime } from "../../../../lib/schedule";
import { formatAddress } from "../../../../lib/site";
import { useShop } from "../../context/ShopContext";
import Field from "./Field";
import FormSection from "./FormSection";
import SegmentedChoice from "./SegmentedChoice";

export default function DeliveryStep() {
  const { checkout, selectOrderType, geo, isOpen } = useShop();
  const isPreOrder = !isOpen;
  // Pre-orden solo recojo (regla de negocio).
  const orderType = isPreOrder ? "pickup" : checkout.orderType;

  return (
    <FormSection title="¿Cómo lo recibes?">
      <SegmentedChoice
        name="order-type"
        label="Tipo de entrega"
        value={orderType}
        onChange={selectOrderType}
        options={[
          { id: "pickup", label: "Recojo" },
          { id: "delivery", label: "Delivery", disabled: isPreOrder },
        ]}
      />

      {orderType === "pickup" ? (
        <div className="flex items-start justify-between gap-4 pt-1">
          <p className="text-sm leading-relaxed text-neutral-400">
            {isPreOrder ? (
              <>
                <span className="font-semibold text-bj-yellow">Pre-orden.</span> Ya cerramos: recoges cuando
                abramos. Fuera de horario no hay delivery.
              </>
            ) : (
              <>
                Recoges en <span className="text-white">{formatAddress()}</span>. Listo en {formatPrepTime()}.
              </>
            )}
          </p>
          <a
            href={restaurantInfo.contact.googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-bj-yellow"
          >
            Mapa <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <Field
            id="checkout-address"
            label="Dirección"
            value={checkout.deliveryAddress}
            onChange={(event) => checkout.setDeliveryAddress(event.target.value)}
            autoComplete="street-address"
            placeholder="Calle, número y distrito"
            maxLength={160}
          />
          <button
            type="button"
            onClick={() => geo.locate()}
            className={`inline-flex min-h-11 items-center gap-2 text-sm font-semibold transition-colors ${
              checkout.locationLink ? "text-green-400" : "text-bj-yellow hover:text-bj-yellow-hover"
            }`}
          >
            {geo.isLocating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
            {checkout.locationLink ? "Ubicación compartida" : geo.isLocating ? "Buscando tu ubicación…" : "Usar mi ubicación actual"}
          </button>
          <Field
            id="checkout-reference"
            label="Referencia"
            value={checkout.deliveryReference}
            onChange={(event) => checkout.setDeliveryReference(event.target.value)}
            placeholder="Frente al parque, portón negro…"
            maxLength={120}
          />
          <Field
            id="checkout-details"
            label="Depa, piso o interior (opcional)"
            value={checkout.deliveryDetails}
            onChange={(event) => checkout.setDeliveryDetails(event.target.value)}
            placeholder="Dpto. 302, torre B…"
            maxLength={160}
          />
          <p className="text-xs leading-relaxed text-neutral-500">
            El envío se coordina por inDrive (tarifa aparte). También estamos en{" "}
            <a href={restaurantInfo.deliveryApps.rappi} target="_blank" rel="noopener noreferrer" className="text-neutral-300 underline underline-offset-2">
              Rappi
            </a>
            .
          </p>
        </div>
      )}
    </FormSection>
  );
}
