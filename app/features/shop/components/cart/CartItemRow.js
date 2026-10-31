"use client";

import Image from "next/image";
import { formatPrice } from "../../../../lib/format";
import { MAX_QTY_PER_ITEM } from "../../constants";
import QuantityStepper from "../QuantityStepper";

export default function CartItemRow({ item, onQuantity, onRemove }) {
  return (
    <li className="flex gap-4 py-5">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-black">
        {item.image && <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="font-semibold leading-tight text-white">{item.name}</p>
        <p className="mt-1 truncate text-xs text-neutral-500">{item.optionLabel}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={MAX_QTY_PER_ITEM}
            label={`Cantidad de ${item.name}`}
            onChange={(next) => onQuantity(item.id, next - item.quantity)}
            onRemove={() => onRemove(item.id)}
          />
          <p className="font-anton text-xl text-white">{formatPrice(item.price * item.quantity)}</p>
        </div>
      </div>
    </li>
  );
}
