"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { menuItems, restaurantInfo, categories } from "./data/menuData";
import {
  ShoppingCart,
  MapPin,
  Clock,
  User,
  MessageCircle,
} from "lucide-react";
import { isOpenNow, getNextOpenDate, formatMsToCountdown } from "./lib/openHours";
import { buildCartItem, migrateLegacyCartItems } from "./lib/cartModel";
import ClientSearchParams from "./features/home/components/ClientSearchParams";
import CartDrawer from "./features/home/components/CartDrawer";
import { submitOnlineOrder } from "./features/home/checkout/submitOrder";
import {
  COMPLEMENT_CATEGORIES,
  PEDIDOSYA_LINK,
  RAPPI_LINK,
  PRIMARY_CATEGORIES,
} from "./features/home/constants";
import { enforceComplementRules } from "./features/home/cartRules";
import { getHeroPriceRange } from "./features/home/seo";

// Componentes refactorizados
import HeroSection from "./features/home/components/HeroSection";
import CategoryFilter from "./features/home/components/CategoryFilter";
import MenuGrid from "./features/home/components/MenuGrid";
import LocationSection from "./features/home/components/LocationSection";
import ProductModal from "./features/home/components/ProductModal";
import SuggestionModal from "./features/home/components/SuggestionModal";
import OrderConfirmation from "./features/home/components/OrderConfirmation";
import FooterSection from "./features/home/components/FooterSection";
import FloatingCartBar from "./features/home/components/FloatingCartBar";
import ClosedNotice from "./features/home/components/ClosedNotice";

export default function BigJackMenu() {
  const PAYMENT_LABELS = {
    efectivo: "Efectivo",
    yape: "Yape",
    plin: "Plin",
    tarjeta: "Tarjeta",
  };

  const normalizePhoneForDisplay = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.startsWith("+") ? digits : `+${digits}`;
  };

  const buildDeliveryPaymentReminder = (selectedMethod, businessNumber) => {
    if (!["yape", "plin", "tarjeta"].includes(selectedMethod)) return null;

    if (selectedMethod === "tarjeta") {
      return {
        title: "Pago por tarjeta",
        body: "Recuerda solicitar por WhatsApp el link de pago para completar tu delivery.",
      };
    }

    const methodLabel = selectedMethod === "yape" ? "Yape" : "Plin";
    return {
      title: `Pago por ${methodLabel}`,
      body: `Recuerda realizar el pago al numero oficial de BIG JACK: ${businessNumber}.`,
    };
  };

  const buildFriendlyOrderError = (rawMessage) => {
    const fallback = "No se pudo registrar tu pedido. Intenta nuevamente en unos minutos.";
    if (!rawMessage || typeof rawMessage !== "string") return fallback;

    if (/webhook/i.test(rawMessage)) {
      return "No pudimos registrar tu pedido por un problema temporal. Intenta nuevamente en unos minutos.";
    }

    return rawMessage;
  };

  const buildWhatsappOrderMessage = ({
    migratedCart,
    orderType,
    customerName,
    customerPhone,
    paymentMethod,
    total,
    deliveryAddress,
    deliveryReference,
    deliveryDetails,
    locationLink,
    notes,
    paymentReminder,
  }) => {
    const cartLines = migratedCart
      .map((item) => `• *${item.quantity}x* ${item.name} _(${item.optionLabel})_`)
      .join("\n");
    const orderMode = orderType === "delivery" ? "🛵 Delivery" : "🏪 Recojo en Tienda";

    const paymentIcons = {
      efectivo: "💵 Efectivo",
      yape: "📱 Yape",
      plin: "📱 Plin",
      tarjeta: "💳 Tarjeta",
    };
    const paymentLabel = paymentIcons[paymentMethod] || paymentMethod;

    const referenceText = [deliveryReference, deliveryDetails]
      .map((value) => (value || "").trim())
      .filter(Boolean)
      .join(" | ");

    const deliveryBlock =
      orderType === "delivery"
        ? `\n📍 *DATOS DE ENTREGA*\n• *Dirección:* ${deliveryAddress || "No especificada"}\n• *Referencia:* ${referenceText || "No especificada"}\n• *Ubicación GPS:* ${locationLink || "No compartida"}`
        : "";

    const notesBlock = notes?.trim() ? `\n📝 *NOTAS DEL PEDIDO*\n• _${notes.trim()}_` : "";

    const paymentReminderBlock = paymentReminder
      ? `\n⚠️ *${paymentReminder.title.toUpperCase()}*\n• ${paymentReminder.body}`
      : "";

    const lines = [
      "🍔 *¡NUEVO PEDIDO REGISTRADO!* 🍔",
      "",
      "¡Hola *BIG JACK*! Acabo de registrar mi pedido desde el menú digital. Aquí tienes el detalle:",
      "",
      "━━━━━━━━━━━━━━━━━━━",
      "📝 *DETALLE DEL PEDIDO*",
      "━━━━━━━━━━━━━━━━━━━",
      cartLines,
      "",
      "👤 *DATOS DEL CLIENTE*",
      `• *Nombre:* ${customerName}`,
      `• *Teléfono:* ${customerPhone || "No especificado"}`,
      `• *Tipo de pedido:* ${orderMode}`,
      `• *Método de pago:* ${paymentLabel}`,
      `• *Total:* *S/ ${total.toFixed(2)}*${orderType === "delivery" ? " _(sin costo de envío)_" : ""}`,
    ];

    if (deliveryBlock) lines.push(deliveryBlock);
    if (notesBlock) lines.push(notesBlock);
    if (paymentReminderBlock) lines.push(paymentReminderBlock);

    lines.push("", "━━━━━━━━━━━━━━━━━━━", "_Quedo atento(a) a su confirmación por este WhatsApp._");

    return lines.join("\n");
  };

  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Estados para el Checkout
  const [orderType, setOrderType] = useState("pickup"); // 'pickup' | 'delivery'
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryReference, setDeliveryReference] = useState("");
  const [deliveryDetails, setDeliveryDetails] = useState("");
  const [locationLink, setLocationLink] = useState(""); // Link de Google Maps del usuario
  const [isLocating, setIsLocating] = useState(false);
  const [autoLocationAttempted, setAutoLocationAttempted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("efectivo"); // efectivo | yape | plin | tarjeta (tarjeta deshabilitada)
  const [notes, setNotes] = useState(""); // notas adicionales
  const [recentlyAdded, setRecentlyAdded] = useState(null); // resaltar última acción
  const [modalProduct, setModalProduct] = useState(null);
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  useEffect(() => {
    if (modalProduct) {
      setActiveModalProduct(modalProduct);
    }
  }, [modalProduct]);

  const [modalOptionId, setModalOptionId] = useState(null);
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  const [suggestionFor, setSuggestionFor] = useState(null);
  const [suggestedPapasQty, setSuggestedPapasQty] = useState(0);
  const [suggestedInkaQty, setSuggestedInkaQty] = useState(0);
  const [suggestedCocaQty, setSuggestedCocaQty] = useState(0);
  const [closedNoticeHidden, setClosedNoticeHidden] = useState(false);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  // Cargar estado desde localStorage al iniciar
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bj_checkout"));
      if (saved) {
        setCustomerName(saved.customerName || "");
        setCustomerPhone(saved.customerPhone || "");
        const persistedOrderType =
          saved.orderType && saved.orderType !== "pickup"
            ? "pickup"
            : saved.orderType || "pickup";
        setOrderType(persistedOrderType);
        setDeliveryAddress(saved.deliveryAddress || "");
        setDeliveryReference(saved.deliveryReference || "");
        setDeliveryDetails(saved.deliveryDetails || "");
        setPaymentMethod(saved.paymentMethod || "efectivo");
        setNotes(saved.notes || "");
      }
    } catch {}
  }, []);

  // Cargar y sincronizar carrito desde localStorage
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (Array.isArray(savedCart) && savedCart.length > 0) {
        setCart(
          enforceComplementRules(
            migrateLegacyCartItems(savedCart, menuItems),
            PRIMARY_CATEGORIES,
            COMPLEMENT_CATEGORIES
          )
        );
      }
      const pj = JSON.parse(localStorage.getItem("bj_preorder") || "false");
      if (pj) setIsPreOrder(true);
    } catch (e) {}

    const handleStorage = () => {
      try {
        const latest = JSON.parse(localStorage.getItem("cart") || "[]");
        const migrated = migrateLegacyCartItems(Array.isArray(latest) ? latest : [], menuItems);
        setCart(enforceComplementRules(migrated, PRIMARY_CATEGORIES, COMPLEMENT_CATEGORIES));
      } catch (e) {}
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Estado de abierto/cerrado y temporizador
  const [isOpen, setIsOpen] = useState(true);
  const [nextOpenMs, setNextOpenMs] = useState(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const open = isOpenNow(now);
      setIsOpen(Boolean(open));
      const next = getNextOpenDate(now);
      if (next) setNextOpenMs(next.getTime() - now.getTime());
      else setNextOpenMs(null);
      
      try { localStorage.setItem("bj_isOpen", JSON.stringify({ isOpen: !!open, nextOpen: next ? next.getTime() : null })); } catch(e){}
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // Guardar estado del formulario en localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      const data = {
        customerName,
        customerPhone,
        orderType,
        deliveryAddress,
        deliveryReference,
        deliveryDetails,
        paymentMethod,
        notes,
      };
      localStorage.setItem("bj_checkout", JSON.stringify(data));
    }, 400);
    return () => clearTimeout(timeout);
  }, [customerName, customerPhone, orderType, deliveryAddress, deliveryReference, deliveryDetails, paymentMethod, notes]);

  // Estado de búsqueda y categoría
  const [searchQuery, setSearchQuery] = useState("");

  const categoryCounts = useMemo(() => {
    const counts = { TODOS: menuItems.length };
    categories.forEach((cat) => {
      counts[cat] = menuItems.filter((i) => i.category === cat).length;
    });
    return counts;
  }, []);

  // Filtrar productos por categoría y búsqueda
  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (selectedCategory !== "TODOS") {
      items = items.filter((item) => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [selectedCategory, searchQuery]);

  const heroHighlight = menuItems[0];
  const heroPriceRange = useMemo(() => getHeroPriceRange(menuItems), []);
  const deliveryAvailable = true;

  // Sugerencias: solo productos activos para evitar agregar items no vendibles.
  const suggestedGuarn = menuItems.find((it) => (it.category === "GUARNICIONES" || it.slug === "papas-fritas") && it.available !== false);
  const suggestedInka = menuItems.find((it) => it.slug === "inka-cola" && it.available !== false);
  const suggestedCoca = menuItems.find((it) => it.slug === "coca-cola" && it.available !== false);
  const suggestionCards = useMemo(
    () =>
      [
        {
          type: "papas",
          item: suggestedGuarn,
          badge: "Guarnicion",
          accent: "text-[#FCC900]",
        },
        {
          type: "inka",
          item: suggestedInka,
          badge: "Bebida",
          accent: "text-yellow-400",
        },
        {
          type: "coca",
          item: suggestedCoca,
          badge: "Bebida",
          accent: "text-red-400",
        },
      ].filter((entry) => Boolean(entry.item)),
    [suggestedGuarn, suggestedInka, suggestedCoca]
  );

  const scrollToMenu = () => {
    if (typeof document === "undefined") return;
    const el = document.getElementById("menu-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Calcular total memoizado
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const hasPrimaryProduct = useMemo(
    () => cart.some((item) => PRIMARY_CATEGORIES.includes(item.category)),
    [cart]
  );
  
  const modalSelectedOption = useMemo(() => {
    const product = modalProduct || activeModalProduct;
    if (!product) return null;
    return product.options?.find((opt) => opt.id === modalOptionId) || product.options?.[0] || null;
  }, [modalProduct, activeModalProduct, modalOptionId]);

  const applyComplementRules = (items) =>
    enforceComplementRules(items, PRIMARY_CATEGORIES, COMPLEMENT_CATEGORIES);

  const isProductAvailable = (product) => {
    if (!product) return false;
    const canonicalProduct = menuItems.find((entry) => entry.id === product.id);
    if (!canonicalProduct) return false;
    if (canonicalProduct.available === false) return false;
    if (product.available === false) return false;
    return true;
  };

  // Persistir carrito en localStorage cuando cambia
  useEffect(() => {
    try {
      const payload = JSON.stringify(cart || []);
      localStorage.setItem("cart", payload);
      if (!cart || cart.length === 0) {
        setIsPreOrder(false);
        localStorage.removeItem("bj_preorder");
      }
    } catch (e) {}
  }, [cart]);

  const openProductModal = (product, optionId) => {
    if (!isProductAvailable(product)) {
      alert("Este producto no esta disponible en este momento.");
      return;
    }
    const preferredOption =
      product.options?.find((opt) => opt.id === optionId) || product.options?.[0];
    setModalProduct(product);
    setModalOptionId(preferredOption?.id || null);
  };

  const closeProductModal = () => {
    setModalProduct(null);
    setActiveModalProduct(null);
    setModalOptionId(null);
  };

  const confirmModalAdd = () => {
    const targetProduct = modalProduct || activeModalProduct;
    if (!targetProduct || !modalSelectedOption) return;
    handleAddProduct(targetProduct, modalSelectedOption.id);
    closeProductModal();
  };

  const addToCart = (product, option, showSuggestion = true) => {
    const addingAsPreorder = !isOpen;
    if (!option) {
      alert("No encontramos una presentacion valida para este producto.");
      return;
    }
    if (!isProductAvailable(product)) {
      alert("Este producto no esta disponible en este momento.");
      return;
    }
    const validOption = product.options?.find((opt) => opt.id === option.id) || product.options?.[0];
    if (!validOption) {
      alert("No encontramos una presentacion valida para este producto.");
      return;
    }
    const isComplementProduct = COMPLEMENT_CATEGORIES.includes(product.category);
    if (isComplementProduct && !hasPrimaryProduct) {
      alert("Para añadir acompañamientos primero agrega una hamburguesa.");
      return;
    }
    const uniqueId = `${product.id}-${validOption.id || "default"}`;
    const newItem = buildCartItem(product, validOption, 1);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === uniqueId);
      if (existing) {
        return applyComplementRules(
          prev.map((item) =>
            item.id === uniqueId
              ? {
                  ...item,
                  category: item.category || product.category,
                  quantity: item.quantity + 1,
                }
              : item
          )
        );
      }
      return applyComplementRules([
        ...prev,
        newItem,
      ]);
    });
    setSubmitResult(null);
    setRecentlyAdded(uniqueId);
    
    // Lógica inteligente de sugerencias (Smart Upselling)
    if (showSuggestion) {
      const willHaveFries = cart.some(i => i.category === "GUARNICION") || product.category === "GUARNICION";
      const willHaveDrink = cart.some(i => i.category === "BEBIDAS") || product.category === "BEBIDAS";
      const isBurger = PRIMARY_CATEGORIES.includes(product.category);

      if (isBurger && (!willHaveFries || !willHaveDrink)) {
        setSuggestionVisible(true);
      }
    }
    setSuggestionFor({ productId: product.id, uniqueId });

    if (addingAsPreorder) {
      setIsPreOrder(true);
      try { localStorage.setItem("bj_preorder", JSON.stringify(true)); } catch(e){}
      setClosedNoticeHidden(true);
    }
    setTimeout(() => {
      setRecentlyAdded((current) => (current === uniqueId ? null : current));
    }, 1200);
  };

  const handleAddProduct = (product, optionId) => {
    if (!isProductAvailable(product)) {
      alert("Este producto no esta disponible en este momento.");
      return;
    }
    const option = product.options?.find((opt) => opt.id === optionId) || product.options?.[0];
    addToCart(product, option);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    setSubmitResult(null);
    setOrderConfirmation(null);
  };

  const clearCart = () => {
    setCart([]);
    setSubmitResult(null);
    setOrderConfirmation(null);
    setIsPreOrder(false);
    try {
      localStorage.removeItem("cart");
      localStorage.removeItem("bj_preorder");
    } catch (e) {}
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      applyComplementRules(
        prev.map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      )
    );
    setSubmitResult(null);
    setOrderConfirmation(null);
  };

  const openOrderOnWhatsapp = () => {
    if (typeof window === "undefined") return;
    if (!orderConfirmation?.whatsappUrl) return;
    window.open(orderConfirmation.whatsappUrl, "_blank", "noopener,noreferrer");
    setOrderConfirmation((current) => {
      if (!current) return current;
      return { ...current, whatsappSent: true };
    });
  };

  // Sugerencias de complementos
  const changeSuggestedQty = (type, delta) => {
    if (type === 'papas') {
      setSuggestedPapasQty(prev => Math.max(0, Math.min(10, prev + delta)));
    } else if (type === 'inka') {
      setSuggestedInkaQty(prev => Math.max(0, Math.min(10, prev + delta)));
    } else if (type === 'coca') {
      setSuggestedCocaQty(prev => Math.max(0, Math.min(10, prev + delta)));
    }
  };

  const getSuggestedQty = (type) => {
    if (type === "papas") return suggestedPapasQty;
    if (type === "inka") return suggestedInkaQty;
    if (type === "coca") return suggestedCocaQty;
    return 0;
  };

  const handleConfirmSuggestions = () => {
    if (suggestedPapasQty > 0 && suggestedGuarn) {
      const option = suggestedGuarn.options?.[0];
      if (option) {
        for (let i = 0; i < suggestedPapasQty; i++) {
          addToCart(suggestedGuarn, option, false);
        }
      }
    }
    
    if (suggestedInkaQty > 0 && suggestedInka) {
      const option = suggestedInka.options?.[0];
      if (option) {
        for (let i = 0; i < suggestedInkaQty; i++) {
          addToCart(suggestedInka, option, false);
        }
      }
    }
    
    if (suggestedCocaQty > 0 && suggestedCoca) {
      const option = suggestedCoca.options?.[0];
      if (option) {
        for (let i = 0; i < suggestedCocaQty; i++) {
          addToCart(suggestedCoca, option, false);
        }
      }
    }
    
    setSuggestedPapasQty(0);
    setSuggestedInkaQty(0);
    setSuggestedCocaQty(0);
    setSuggestionVisible(false);
    setTimeout(() => setIsCartOpen(true), 300);
  };

  const handleCloseSuggestion = () => {
    setSuggestedPapasQty(0);
    setSuggestedInkaQty(0);
    setSuggestedCocaQty(0);
    setSuggestionVisible(false);
  };

  const handleSkipSuggestion = () => {
    setSuggestedPapasQty(0);
    setSuggestedInkaQty(0);
    setSuggestedCocaQty(0);
    setSuggestionVisible(false);
    setTimeout(() => setIsCartOpen(true), 300);
  };

  const getUserLocation = useCallback(({ silent = false } = {}) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      if (!silent) alert("Tu navegador no soporta geolocalización.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationLink(link);
        if (!silent) {
          alert("¡Ubicación lista! La usaremos para coordinar tu delivery por inDrive.");
        }
        if (!deliveryReference.trim()) {
          setDeliveryReference("Ubicación compartida por GPS");
        }
        setIsLocating(false);
      },
      () => {
        if (!silent) {
          alert("No pudimos obtener tu ubicación automáticamente. Escribe tu dirección o pega un enlace de Google Maps.");
        }
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, [deliveryReference]);

  const handleSelectOrderType = (type) => {
    if (type === "delivery" && !deliveryAvailable) {
      if (typeof window !== "undefined") {
        window.open(PEDIDOSYA_LINK, "_blank");
      }
      return;
    }
    setOrderType(type);
    if (type === 'delivery' && paymentMethod === 'efectivo') {
      setPaymentMethod('yape');
    }
    if (type !== "delivery") {
      setAutoLocationAttempted(false);
    }
  };

  useEffect(() => {
    if (orderType !== "delivery") return;
    if (locationLink || autoLocationAttempted || isLocating) return;
    setAutoLocationAttempted(true);
    getUserLocation({ silent: true });
  }, [orderType, locationLink, autoLocationAttempted, isLocating, getUserLocation]);

  const submitOrderToSystem = async () => {
    try {
      setIsSubmittingOrder(true);
      setSubmitResult(null);

      const { response, migratedCart } = await submitOnlineOrder({
        cart,
        orderType,
        isPreOrder,
        isOpen,
        customerName,
        customerPhone,
        paymentMethod,
        deliveryAddress,
        deliveryReference,
        deliveryDetails,
        locationLink,
        notes,
        menuItems,
      });

      const businessWhatsapp = normalizePhoneForDisplay(restaurantInfo?.contact?.whatsapp) || "No configurado";
      const paymentReminder =
        orderType === "delivery" ? buildDeliveryPaymentReminder(paymentMethod, businessWhatsapp) : null;

      const message = buildWhatsappOrderMessage({
        migratedCart,
        orderType,
        customerName,
        customerPhone,
        paymentMethod,
        total,
        deliveryAddress,
        deliveryReference,
        deliveryDetails,
        locationLink,
        notes,
        paymentReminder,
      });
      const whatsappUrl = `https://wa.me/${restaurantInfo.contact.whatsapp}?text=${encodeURIComponent(message)}`;

      setOrderConfirmation({
        customerName,
        orderMode: orderType === "delivery" ? "Delivery" : "Recojo",
        paymentMethod: PAYMENT_LABELS[paymentMethod] || paymentMethod,
        paymentReminder,
        total: `S/ ${total.toFixed(2)}`,
        whatsappUrl,
        whatsappContact: businessWhatsapp,
        items: migratedCart.map((item) => `${item.quantity}x ${item.name} (${item.optionLabel})`),
        orderId: response?.orderId || null,
        saleId: response?.saleId || null,
        whatsappSent: false,
      });

      setIsCartOpen(false);

      setSubmitResult({
        type: "success",
        message: response?.duplicated
          ? "Este pedido ya estaba registrado previamente."
          : "Pedido registrado con exito. Revisa la confirmacion para enviarlo por WhatsApp.",
        orderId: response?.orderId || null,
        saleId: response?.saleId || null,
      });

      setCart([]);
      setIsPreOrder(false);
      setNotes("");
      setLocationLink("");
      setDeliveryDetails("");
      localStorage.removeItem("cart");
      localStorage.removeItem("bj_preorder");
    } catch (error) {
      const friendlyError = buildFriendlyOrderError(error?.message);
      alert(friendlyError);
      setSubmitResult({
        type: "error",
        message: friendlyError,
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const displayProduct = modalProduct || activeModalProduct;

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F12] text-white font-sans w-full relative">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0F0F12]/95 backdrop-blur-md border-b-3 border-[#FCC900] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-3 sm:py-4 header-inner">
            {/* Logo y título */}
            <div className="flex-1 flex items-center gap-3">
              <Link href="/" className="block">
                <div className="relative h-10 sm:h-12 w-44 hover:scale-105 transition-transform">
                  <Image 
                    src="/images/bigjacktitle.svg" 
                    alt={restaurantInfo.name} 
                    fill
                    sizes="176px"
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
              <span className="hidden sm:inline-block tag-streetwear">
                [ LIMA CENTRO ]
              </span>
            </div>

            {/* Info rápida - Solo desktop */}
            <div className="hidden lg:flex items-center gap-6 mx-6">
              <div className="flex items-center gap-2 text-xs">
                <Clock size={16} className="text-[#FCC900]" />
                <div>
                  <p className="text-[#C0C0C0]">Lun-Jue: 4:30-11PM</p>
                  <p className="text-white font-semibold">Vie-Dom: 5PM-1AM</p>
                </div>
              </div>
              <Link
                href="/quienes"
                className="hidden xl:inline-flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#353535] rounded-xl text-white text-sm font-semibold transition-all border border-[#C0C0C0]/30"
              >
                <User size={16} />
                Quiénes somos
              </Link>
              <a
                href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#FCC900] hover:bg-[#e2b500] rounded-xl text-black text-sm font-black transition-all active:scale-95"
              >
                <MessageCircle size={18} />
                Pedido rápido
              </a>
            </div>

            {/* Botón de carrito */}
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-3 bg-[#FCC900] text-black rounded-2xl hover:bg-[#e2b500] transition-all shadow-lg shadow-[#FCC900]/20 active:scale-95"
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#B22222] text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Barra de acciones rápidas móvil */}
          <div className="lg:hidden pb-3 flex items-center justify-between gap-3 border-t border-[#C0C0C0]/25 pt-3">
            <a
              href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#FCC900] hover:bg-[#e2b500] rounded-xl text-black text-sm font-black transition-all active:scale-95"
            >
              <MessageCircle size={16} />
              Pedir
            </a>
            <Link
              href="/quienes"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#2A2A2A] hover:bg-[#353535] border border-[#C0C0C0]/35 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
            >
              <User size={16} />
              Quiénes somos
            </Link>
            <a
              href={restaurantInfo.contact.googleMapsLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#2A2A2A] hover:bg-[#353535] border border-[#C0C0C0]/35 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
            >
              <MapPin size={16} />
              Ubicación
            </a>
          </div>
        </div>
      </header>
      
      <Suspense fallback={null}>
        <ClientSearchParams onOpenCart={() => setIsCartOpen(true)} />
      </Suspense>

      <ClosedNotice
        isOpen={isOpen}
        closedNoticeHidden={closedNoticeHidden}
        nextOpenMs={nextOpenMs}
        onShowAviso={() => setClosedNoticeHidden(false)}
        onCloseAviso={() => setClosedNoticeHidden(true)}
        formatMsToCountdown={formatMsToCountdown}
      />

      <HeroSection
        heroHighlight={heroHighlight}
        heroPriceRange={heroPriceRange}
        restaurantInfo={restaurantInfo}
        scrollToMenu={scrollToMenu}
      />

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryCounts={categoryCounts}
      />

      <MenuGrid
        filteredItems={filteredItems}
        selectedCategory={selectedCategory}
        cart={cart}
        onAdd={handleAddProduct}
        onOpenModal={openProductModal}
        recentlyAdded={recentlyAdded}
        hasPrimaryProduct={hasPrimaryProduct}
        PRIMARY_CATEGORIES={PRIMARY_CATEGORIES}
        COMPLEMENT_CATEGORIES={COMPLEMENT_CATEGORIES}
      />

      <LocationSection
        restaurantInfo={restaurantInfo}
        PEDIDOSYA_LINK={PEDIDOSYA_LINK}
        RAPPI_LINK={RAPPI_LINK}
      />

      <ProductModal
        product={displayProduct}
        selectedOptionId={modalOptionId}
        onClose={closeProductModal}
        onSelectOption={setModalOptionId}
        onConfirm={confirmModalAdd}
        selectedOption={modalSelectedOption}
      />

      <CartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        menuItems={menuItems}
        openProductModal={openProductModal}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        orderType={orderType}
        handleSelectOrderType={handleSelectOrderType}
        deliveryAvailable={deliveryAvailable}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        deliveryAddress={deliveryAddress}
        setDeliveryAddress={setDeliveryAddress}
        deliveryReference={deliveryReference}
        setDeliveryReference={setDeliveryReference}
        deliveryDetails={deliveryDetails}
        setDeliveryDetails={setDeliveryDetails}
        locationLink={locationLink}
        isLocating={isLocating}
        getUserLocation={getUserLocation}
        setLocationLink={setLocationLink}
        isOpen={isOpen}
        isPreOrder={isPreOrder}
        restaurantInfo={restaurantInfo}
        PEDIDOSYA_LINK={PEDIDOSYA_LINK}
        RAPPI_LINK={RAPPI_LINK}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        notes={notes}
        setNotes={setNotes}
        clearCart={clearCart}
        total={total}
        submitOrderToSystem={submitOrderToSystem}
        isSubmittingOrder={isSubmittingOrder}
        submitResult={submitResult}
      />

      <SuggestionModal
        isOpen={suggestionVisible}
        suggestionCards={suggestionCards}
        getSuggestedQty={getSuggestedQty}
        changeSuggestedQty={changeSuggestedQty}
        onConfirm={handleConfirmSuggestions}
        onClose={handleCloseSuggestion}
        onSkip={handleSkipSuggestion}
        suggestedGuarn={suggestedGuarn}
        suggestedInka={suggestedInka}
        suggestedCoca={suggestedCoca}
      />

      <OrderConfirmation
        orderConfirmation={orderConfirmation}
        onClose={() => setOrderConfirmation(null)}
        onOpenWhatsapp={openOrderOnWhatsapp}
      />

      <FooterSection
        restaurantInfo={restaurantInfo}
        PEDIDOSYA_LINK={PEDIDOSYA_LINK}
        RAPPI_LINK={RAPPI_LINK}
      />

      <FloatingCartBar
        cart={cart}
        total={total}
        isCartOpen={isCartOpen}
        suggestionVisible={suggestionVisible}
        onOpenCart={() => setIsCartOpen(true)}
      />
    </div>
  );
}
