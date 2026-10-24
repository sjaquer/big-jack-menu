"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { readJson, writeJson } from "../../../lib/safeStorage";

const INITIAL_FORM = {
  orderType: "pickup",
  customerName: "",
  customerPhone: "",
  deliveryAddress: "",
  deliveryReference: "",
  deliveryDetails: "",
  locationLink: "",
  paymentMethod: "efectivo",
  notes: "",
};

const PERSISTED_KEYS = [
  "customerName",
  "customerPhone",
  "orderType",
  "deliveryAddress",
  "deliveryReference",
  "deliveryDetails",
  "paymentMethod",
  "notes",
];

function pickPersisted(form) {
  return PERSISTED_KEYS.reduce((data, key) => {
    data[key] = form[key];
    return data;
  }, {});
}

export default function useCheckoutForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = readJson("bj_checkout", null);
    if (saved && typeof saved === "object") {
      setForm((current) => ({ ...current, ...pickPersisted(saved) }));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const timeout = setTimeout(() => {
      writeJson("bj_checkout", pickPersisted(form));
    }, 400);
    return () => clearTimeout(timeout);
  }, [form, isHydrated]);

  const setField = useCallback((key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const setters = useMemo(
    () => ({
      setOrderType: (value) => setField("orderType", value),
      setCustomerName: (value) => setField("customerName", value),
      setCustomerPhone: (value) => setField("customerPhone", value),
      setDeliveryAddress: (value) => setField("deliveryAddress", value),
      setDeliveryReference: (value) => setField("deliveryReference", value),
      setDeliveryDetails: (value) => setField("deliveryDetails", value),
      setLocationLink: (value) => setField("locationLink", value),
      setPaymentMethod: (value) => setField("paymentMethod", value),
      setNotes: (value) => setField("notes", value),
    }),
    [setField]
  );

  const resetAfterOrder = useCallback(() => {
    setForm((current) => ({
      ...current,
      notes: "",
      locationLink: "",
      deliveryDetails: "",
    }));
  }, []);

  return { ...form, ...setters, resetAfterOrder };
}
