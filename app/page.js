"use client";
import Head from "next/head";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { menuItems, restaurantInfo, categories } from "./data/menuData";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  MapPin,
  Clock,
  Navigation,
  User,
  Sparkles,
  Flame,
  Instagram,
  MessageCircle,
  Clipboard,
  Check,
  Truck,
  ArrowUpRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Suspense } from "react";
import { isOpenNow, getNextOpenDate, formatMsToCountdown } from "./lib/openHours";
import { buildCartItem, migrateLegacyCartItems } from "./lib/cartModel";
import ClientSearchParams from "./features/home/components/ClientSearchParams";
import SecureMap from "./features/home/components/SecureMap";
import CartDrawer from "./features/home/components/CartDrawer";
import { submitOnlineOrder } from "./features/home/checkout/submitOrder";
import {
  AREA_SERVED,
  COMPLEMENT_CATEGORIES,
  DEFAULT_SITE_URL,
  MARKETING_DESCRIPTION,
  PEDIDOSYA_LINK,
  RAPPI_LINK,
  PRIMARY_CATEGORIES,
} from "./features/home/constants";
import { enforceComplementRules } from "./features/home/cartRules";
import {
  buildFaqSchema,
  buildMenuSections,
  buildOpeningHoursSpecification,
  buildRestaurantSchema,
  getComputedPriceRange,
  getHeroPriceRange,
} from "./features/home/seo";

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
      .map((item, index) => `${index + 1}. ${item.quantity}x ${item.name} (${item.optionLabel})`)
      .join("\n");
    const orderMode = orderType === "delivery" ? "Delivery" : "Recojo";
    const paymentLabel = PAYMENT_LABELS[paymentMethod] || paymentMethod;
    const referenceText = [deliveryReference, deliveryDetails]
      .map((value) => (value || "").trim())
      .filter(Boolean)
      .join(" | ");

    const deliveryBlock =
      orderType === "delivery"
        ? [
            "", 
            "DATOS DE ENTREGA",
            `- Direccion: ${deliveryAddress || "No especificada"}`,
            `- Referencia: ${referenceText || "No especificada"}`,
            `- Ubicacion GPS: ${locationLink || "No compartida"}`,
          ].join("\n")
        : "";

    const notesBlock = notes?.trim() ? `\nNOTAS\n- ${notes.trim()}` : "";
    const paymentReminderBlock = paymentReminder
      ? `\nIMPORTANTE - ${paymentReminder.title.toUpperCase()}\n- ${paymentReminder.body}`
      : "";

    return [
      "Hola BIG JACK, acabo de registrar mi pedido desde el menu digital:",
      "",
      "DETALLE DEL PEDIDO",
      cartLines,
      "",
      "DATOS DEL CLIENTE",
      `- Nombre: ${customerName}`,
      `- Telefono: ${customerPhone || "No especificado"}`,
      `- Tipo de pedido: ${orderMode}`,
      `- Metodo de pago: ${paymentLabel}`,
      `- Total del menu web: S/ ${total.toFixed(2)}${orderType === "delivery" ? " (sin costo de envio)" : ""}`,
      deliveryBlock,
      notesBlock,
      paymentReminderBlock,
      "",
      "Quedo atento(a) a su confirmacion por este WhatsApp.",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_SITE_URL;
  
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

    // Escucha tanto eventos reales de storage (otros tabs) como el evento manual
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
      // guardar para client components que quieran leer el estado
      try { localStorage.setItem("bj_isOpen", JSON.stringify({ isOpen: !!open, nextOpen: next ? next.getTime() : null })); } catch(e){}
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  // Guardar estado del formulario en localStorage (debounce simple)
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


  // Filtrar productos por categoría
  const filteredItems = useMemo(() => {
    if (selectedCategory === "TODOS") return menuItems;
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const heroHighlight = menuItems[0];
  const heroPriceRange = useMemo(() => getHeroPriceRange(menuItems), []);

  const marketingDescription = MARKETING_DESCRIPTION;
  const openingHoursSpecification = useMemo(
    () => buildOpeningHoursSpecification(restaurantInfo.hours),
    []
  );
  const computedPriceRange = useMemo(() => getComputedPriceRange(menuItems), []);

  const menuSections = useMemo(
    () => buildMenuSections(menuItems, categories),
    []
  );

  const restaurantSchema = useMemo(
    () =>
      buildRestaurantSchema({
        restaurantInfo,
        siteUrl,
        marketingDescription,
        computedPriceRange,
        openingHoursSpecification,
        menuSections,
        areaServed: AREA_SERVED,
      }),
    [siteUrl, marketingDescription, computedPriceRange, openingHoursSpecification, menuSections]
  );

  const faqSchema = useMemo(() => buildFaqSchema(), []);
  const deliveryAvailable = true;

  // Sugerencias: solo productos activos para evitar agregar items no vendibles.
  const suggestedGuarn = menuItems.find((it) => it.category === "GUARNICION" && it.available !== false);
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
    if (!modalProduct) return null;
    return modalProduct.options?.find((opt) => opt.id === modalOptionId) || null;
  }, [modalProduct, modalOptionId]);

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
    setModalOptionId(null);
  };

  const confirmModalAdd = () => {
    if (!modalProduct || !modalSelectedOption) return;
    handleAddProduct(modalProduct, modalSelectedOption.id);
    closeProductModal();
  };

  // Modal de producto se abre mediante botón directo en el menú

  // Funciones del carrito
  const addToCart = (product, option, showSuggestion = true) => {
    // Si estamos fuera de horario, permitir agregar como pre-orden (solo para recojo)
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

      // Solo mostrar si falta algo del combo básico (Burger + Papas + Bebida)
      if (isBurger && (!willHaveFries || !willHaveDrink)) {
        setSuggestionVisible(true);
      }
    }
    setSuggestionFor({ productId: product.id, uniqueId });

    // Si estamos cerrados, marcar pre-orden y persistir
    if (addingAsPreorder) {
      setIsPreOrder(true);
      try { localStorage.setItem("bj_preorder", JSON.stringify(true)); } catch(e){}
      // also show the closed notice bar so user knows
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
    if (window.confirm('¿Estás seguro de vaciar todo el carrito?')) {
      setCart([]);
      setSubmitResult(null);
      setOrderConfirmation(null);
      setIsPreOrder(false);
      try {
        localStorage.removeItem('cart');
        localStorage.removeItem('bj_preorder');
      } catch(e) {}
    }
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

  // --- Sugerencias de complementos (mini ventana) ---
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
    // Agregar papas según cantidad
    if (suggestedPapasQty > 0 && suggestedGuarn) {
      const option = suggestedGuarn.options?.[0];
      if (option) {
        for (let i = 0; i < suggestedPapasQty; i++) {
          addToCart(suggestedGuarn, option, false);
        }
      }
    }
    
    // Agregar Inka Cola según cantidad
    if (suggestedInkaQty > 0 && suggestedInka) {
      const option = suggestedInka.options?.[0];
      if (option) {
        for (let i = 0; i < suggestedInkaQty; i++) {
          addToCart(suggestedInka, option, false);
        }
      }
    }
    
    // Agregar Coca Cola según cantidad
    if (suggestedCocaQty > 0 && suggestedCoca) {
      const option = suggestedCoca.options?.[0];
      if (option) {
        for (let i = 0; i < suggestedCocaQty; i++) {
          addToCart(suggestedCoca, option, false);
        }
      }
    }
    
    // Resetear y cerrar
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


  const getUserLocation = ({ silent = false } = {}) => {
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
  };

  const handleSelectOrderType = (type) => {
    if (type === "delivery" && !deliveryAvailable) {
      // Redirigir a PedidosYa para pedidos por delivery
      if (typeof window !== "undefined") {
        window.open(PEDIDOSYA_LINK, "_blank");
      }
      return;
    }
    setOrderType(type);
    // Si cambia a delivery y el método era efectivo, seleccionar Yape por defecto
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
  }, [orderType, locationLink, autoLocationAttempted, isLocating]);

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

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white font-sans overflow-x-hidden">
      <Head>
        <title>{restaurantInfo.name} | Hamburguesas en Centro de Lima</title>
        <meta name="description" content={marketingDescription} />
        <meta
          name="keywords"
          content="hamburguesas centro de lima, comida rápida centro de lima, fast food barrio, hamburguesas gruesas, no smash burger, delivery centro de lima, big jack"
        />
        <meta name="geo.region" content="PE-LMA" />
        <meta name="geo.placename" content="Centro de Lima, Perú" />
        <meta name="geo.position" content="-12.081387;-77.038263" />
        <meta name="ICBM" content="-12.081387, -77.038263" />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:title" content={`${restaurantInfo.name} - Hamburguesas en Centro de Lima`} />
        <meta property="og:description" content={marketingDescription} />
        <meta property="og:type" content="restaurant" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:locale" content="es_PE" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${restaurantInfo.name} - Hamburguesas en Centro de Lima`} />
        <meta name="twitter:description" content={marketingDescription} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#1E1E1E]/95 backdrop-blur-md border-b-2 border-[#FCC900]/40 shadow-[0_10px_35px_rgba(0,0,0,0.55)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo y título */}
            <div className="flex-1">
              <Link href="/" className="block">
                <img 
                  src="/images/bigjacktitle.svg" 
                  alt={restaurantInfo.name} 
                  className="h-10 sm:h-12 w-auto object-contain hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(252,201,0,0.35)]" 
                />
                <p className="text-[10px] text-[#C0C0C0] hidden sm:block mt-1 font-semibold tracking-wide ml-1">Hablamos legal</p>
              </Link>
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
                Quienes somos
              </Link>
              <a
                href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#FCC900] hover:bg-[#e2b500] rounded-xl text-black text-sm font-black transition-all active:scale-95"
              >
                <MessageCircle size={18} />
                Pedido rapido
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
              Quienes somos
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

          {/* Barra informativa cuando se oculta el aviso de cerrado (pre-orden) */}
          {!isOpen && closedNoticeHidden && (
            <div className="bg-red-800/90 border-t-2 border-red-600 text-white text-center py-3">
              <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                <div className="text-sm">Estamos cerrados — Abrimos en {nextOpenMs ? formatMsToCountdown(nextOpenMs) : 'Pronto'}. Cualquier pedido sería una pre-orden y se procesará cuando abramos.</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setClosedNoticeHidden(false)} className="text-sm bg-transparent border border-white/20 px-3 py-2 rounded text-white">Mostrar aviso</button>
                </div>
              </div>
            </div>
          )}

      {/* HERO EXPERIENCE - REDISEÑADO PARA PEDIDOS RÁPIDOS */}
      <section className="relative overflow-hidden bg-[#1E1E1E]">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(252,201,0,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(178,34,34,0.15),_transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16 grid gap-8 md:grid-cols-2 items-center">
          
          {/* Brand & Content */}
          <div className="space-y-6 text-center md:text-left order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FCC900]/10 border border-[#FCC900]/25 text-[#FCC900] text-xs font-black uppercase tracking-widest mx-auto md:mx-0">
              <Flame size={14} className="text-[#B22222]" />
              Tu Vecino Confiable
            </div>
            
            <h1 className="font-anton text-6xl md:text-7xl lg:text-8xl leading-[0.85] text-white tracking-[-0.04em] uppercase drop-shadow-lg">
              POTENCIA <br/>
              <span className="text-[#FCC900]">HONESTA</span>
            </h1>
            
            <p className="text-[#C0C0C0] text-base md:text-lg font-semibold max-w-md mx-auto md:mx-0 leading-snug">
              Sin relleno corporativo. Solo carne gruesa, fuego y técnica. Hamburguesas reales que calman tu hambre, al toque.
            </p>

            {/* Quick Actions for UX */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <button
                onClick={scrollToMenu}
                className="h-16 px-8 rounded-2xl bg-[#FCC900] hover:bg-[#e2b500] text-black font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#FCC900]/20 transition-all active:scale-95 hover:-translate-y-1"
              >
                <ShoppingCart size={24} /> 
                HACER PEDIDO
              </button>
              <a
                href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="h-16 px-8 rounded-2xl bg-[#2A2A2A] hover:bg-[#353535] text-white font-bold text-lg flex items-center justify-center gap-3 border border-[#C0C0C0]/35 transition-all active:scale-95 hover:-translate-y-1"
              >
                <MessageCircle size={22} className="text-green-500" /> 
                Hablar por WhatsApp
              </a>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-neutral-400 mt-6">
              <span className="flex items-center gap-1.5 bg-neutral-800/50 px-3 py-1.5 rounded-full"><Truck size={14} className="text-[#FCC900]" /> Delivery local</span>
              <span className="flex items-center gap-1.5 bg-neutral-800/50 px-3 py-1.5 rounded-full"><Clock size={14} className="text-[#FCC900]" /> Recojo en 15-20 min</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative order-1 md:order-2">
            <div className="relative aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden border-4 border-[#FCC900]/30 shadow-2xl shadow-black/60 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
              {heroHighlight ? (
                <img
                  src={heroHighlight.image}
                  alt="Hamburguesa real Big Jack"
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x600/222/yellow?text=BIG+JACK";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                  <Flame size={48} className="text-[#B22222]" />
                </div>
              )}

              {/* Price Tag */}
              <div className="absolute bottom-6 right-6 z-20 bg-[#FCC900] text-black px-6 py-3 rounded-2xl shadow-xl border-2 border-black/20">
                <p className="text-xs font-black uppercase opacity-80 mb-0.5">Desde</p>
                <p className="text-3xl font-black tracking-tighter">S/ {heroPriceRange[0].toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overlay de CERRADO (bloqueo) */}
      {!isOpen && !closedNoticeHidden && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm px-4">
          <div className="max-w-md w-full bg-neutral-900 border-2 border-red-600 rounded-3xl p-6 text-center">
            <h2 className="text-2xl font-black text-red-400 mb-2">Estamos cerrados</h2>
            <p className="text-sm text-neutral-300 mb-4">Ahora no estamos disponibles para recibir pedidos. Puedes ver el menú, pero el pedido estará deshabilitado hasta la próxima apertura.</p>
            <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4 mb-4">
              <p className="text-xs text-neutral-400">Abrimos en</p>
              <p className="text-lg font-bold text-white">{nextOpenMs ? formatMsToCountdown(nextOpenMs) : "Pronto"}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setClosedNoticeHidden(true); const el = document.getElementById('menu-section'); if (el) el.scrollIntoView({behavior:'smooth'}); }} className="flex-1 px-4 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold">Ver Menú</button>
              <button onClick={() => { window.location.href = '/libro-de-reclamaciones'; }} className="px-4 py-3 rounded-2xl bg-[#FCC900] hover:bg-[#e2b500] text-white font-bold">Libro de Reclamaciones</button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORÍAS */}
      <div className="sticky top-[73px] z-40 bg-gradient-to-b from-neutral-950 to-neutral-900/95 backdrop-blur-lg border-b-2 border-neutral-800 py-5 shadow-lg overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-3">Filtra por categoría</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {["TODOS", ...categories].map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[44px] px-6 py-2.5 rounded-full text-sm font-black tracking-wide transition-all border whitespace-nowrap active:scale-95 ${
                    isActive
                      ? "bg-[#FCC900] text-white border-[#FCC900] shadow-lg shadow-[#FCC900]/25 scale-105"
                      : "bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:border-[#FCC900]/50 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {cat === "TODOS" ? "🔥 TODO" : cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <main id="menu-section" className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-[#FCC900] font-bold">Estás viendo</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">{selectedCategory === "TODOS" ? "Menú Completo" : selectedCategory}</h2>
            <p className="text-sm text-neutral-400">{filteredItems.length} {filteredItems.length === 1 ? 'producto disponible' : 'productos disponibles'}</p>
          </div>
          <div className="bg-neutral-900/80 border-2 border-neutral-800 rounded-2xl p-4 max-w-md">
                <p className="text-xs text-neutral-400 leading-relaxed flex items-start gap-2">
              <Sparkles size={16} className="text-[#FCC900]" />
              <span><span className="font-semibold text-white">Tip:</span> Toca cualquier imagen para ver detalles completos o usa los botones para añadir rápido al carrito.</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {filteredItems.map((item) => {
            const isComplement = COMPLEMENT_CATEGORIES.includes(item.category);
            const isPrimary = PRIMARY_CATEGORIES.includes(item.category);
            const complementBlocked = isComplement && !hasPrimaryProduct;
            const isUnavailable = item.available === false;
            const isDisabled = complementBlocked || isUnavailable;
            const optionsToRender = item.options?.length
              ? item.options
              : [{ id: "regular", label: "Regular", price: item.price || 0 }];
            const basePrice = optionsToRender.reduce((min, opt) => Math.min(min, opt.price), optionsToRender[0].price);
            
            // Cantidad actual de este producto en el carrito (para pedidos grandes)
            const itemQtyInCart = cart.filter(c => c.productId === item.id).reduce((sum, c) => sum + c.quantity, 0);

            return (
              <div key={item.id} className="group relative bg-[#1E1E1E] border-2 border-[#C0C0C0]/20 rounded-[2.5rem] overflow-hidden hover:border-[#FCC900]/50 transition-all duration-300 flex flex-col shadow-lg hover:shadow-2xl hover:shadow-[#FCC900]/10">
                {/* No disponible badge */}
                {isUnavailable && (
                  <div className="absolute top-3 right-3 z-30 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 drop-shadow-lg">
                    <AlertTriangle size={14} />
                    No disponible
                  </div>
                )}

                {/* Image Section - BIG & IMMERSIVE */}
                <div className="relative block overflow-hidden bg-black flex-shrink-0 aspect-square sm:aspect-[4/3] w-full">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/800x600/222/fcc900?text=BIG+JACK";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold uppercase tracking-widest text-sm bg-neutral-900">Sin foto</div>
                  )}
                  
                  {/* Dark Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-[#1e1e1e]/60 to-transparent sm:via-[#1e1e1e]/40" />
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-black/10 pointer-events-none" />

                  {item.popular && (
                    <span className="absolute top-5 left-5 bg-[#FCC900] text-black text-xs font-black uppercase tracking-[0.1em] px-4 py-2 rounded-full shadow-xl border-2 border-black/20 z-10 animate-bounce-slow">
                      HIT DE BARRIO
                    </span>
                  )}

                  {/* Header & Price Tag container layered on image */}
                  <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end z-20">
                    <div className="flex-1 pr-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#FCC900] font-black mb-1 drop-shadow-md">{item.category}</p>
                      <h3 className="font-anton text-3xl sm:text-4xl text-white leading-[0.9] tracking-[-0.02em] font-normal drop-shadow-xl">{item.name}</h3>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="bg-[#FCC900] border-2 border-black/20 text-black px-4 py-2 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.4)] transform transition-transform group-hover:-translate-y-1">
                        <span className="text-[10px] font-black uppercase opacity-70 block leading-none mb-1">Desde</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold opacity-90 leading-none">S/</span>
                          <span className="text-2xl sm:text-3xl font-black leading-none">{basePrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between z-10 relative bg-[#1E1E1E]">
                  <p className="text-[#C0C0C0] text-sm sm:text-base leading-relaxed mb-6 font-medium line-clamp-3">{item.description}</p>

                  {/* Actions for easy bulk add */}
                  <div className="mt-auto border-t border-[#C0C0C0]/10 pt-5">
                    {isPrimary ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openProductModal(item)}
                          disabled={isUnavailable}
                          className={`flex-1 py-4 px-6 rounded-2xl text-black text-base font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_5px_15px_rgba(252,201,0,0.15)] group-hover:shadow-[0_8px_20px_rgba(252,201,0,0.3)] ${
                            isUnavailable
                              ? "bg-neutral-500 text-neutral-700 cursor-not-allowed opacity-60"
                              : "bg-[#FCC900] hover:bg-[#e2b500]"
                          }`}
                        >
                          <Plus size={20} className="transition-transform group-hover:rotate-90" />
                          <span className="hidden sm:inline">Armar combo / Agregar</span>
                          <span className="sm:hidden">Pedir ahora</span>
                        </button>
                        
                        {itemQtyInCart > 0 && (
                          <div className="w-14 h-14 bg-[#B22222]/10 border-2 border-[#B22222] text-[#ffb4b4] rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0 animate-in pop-in">
                            x{itemQtyInCart}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[10px] text-[#C0C0C0] uppercase tracking-[0.2em] font-black mb-1">Elige opcion</p>
                        {optionsToRender.map((option) => {
                          const isRecent = recentlyAdded === `${item.id}-${option.id}`;
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleAddProduct(item, option.id)}
                              disabled={isDisabled}
                              className={`w-full py-4 px-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between active:scale-95 shadow-sm hover:shadow-md ${
                                isUnavailable
                                  ? "border-red-500/30 bg-red-500/5 text-neutral-400 cursor-not-allowed opacity-50"
                                  : isRecent
                                  ? "border-green-500 bg-green-500/10 text-green-400"
                                  : "border-[#C0C0C0]/15 bg-[#2A2A2A] text-white hover:border-[#FCC900]/50"
                              } ${complementBlocked && !isUnavailable ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <span className="text-sm font-bold truncate mr-2">{option.label}</span>
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                                isUnavailable
                                  ? "bg-red-500/20 text-red-400"
                                  : isRecent
                                  ? "bg-green-500 text-white"
                                  : "bg-black/40 text-white group-hover:bg-[#FCC900] group-hover:text-black"
                              }`}>
                                {isUnavailable ? <AlertTriangle size={16} /> : isRecent ? <Check size={16} /> : <Plus size={16} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* MAPA Y UBICACIÓN RÁPIDA */}
      <div className="bg-[#1E1E1E] border-t-2 border-[#FCC900]/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCC900]/50 to-transparent" />
        <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 items-center">
            {/* Fast Info */}
            <div className="space-y-6 text-center lg:text-left">
              <h3 className="font-anton text-4xl sm:text-5xl text-white leading-tight uppercase tracking-tight">
                ESTAMOS EN EL <span className="text-[#FCC900]">CENTRO</span>
              </h3>
              <p className="text-[#C0C0C0] text-lg font-semibold max-w-md mx-auto lg:mx-0">
                Recojo en tienda al toque o delivery rápido en zonas cercanas. 
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto lg:mx-0">
                <a href={restaurantInfo.contact.googleMapsLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-[#FCC900] hover:bg-[#e2b500] text-black font-black px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95">
                  <Navigation size={20} /> Ir con Google Maps
                </a>
                <a href={PEDIDOSYA_LINK} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-[#ea004b] hover:bg-[#d60044] text-white font-bold px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95">
                  <span className="font-black text-xl leading-none">Pe</span> PedidosYa
                </a>
                <a href={RAPPI_LINK} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-[#ff441f] hover:bg-[#e13c1b] text-white font-bold px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95">
                  <span className="font-black text-xl leading-none">R</span> Rappi
                </a>
              </div>
            </div>

            {/* Mapa */}
            <div className="rounded-[2rem] overflow-hidden border-4 border-neutral-800 h-[300px] lg:h-[400px] shadow-2xl relative group">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
              <SecureMap />
            </div>
          </div>
        </section>
      </div>

      {/* MODAL SELECCIÓN DE HAMBURGUESA */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            onClick={closeProductModal}
            aria-label="Cerrar modal"
          ></div>
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10">
            <div className="p-5 flex items-start gap-4 border-b border-neutral-800">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-800 flex-shrink-0">
                {modalProduct.image ? (
                  <img
                    src={modalProduct.image}
                    alt={modalProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-content-center text-neutral-500 text-sm">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#FCC900] mb-1">{modalProduct.category}</p>
                <h3 className="text-2xl font-bold text-white leading-tight mb-2">{modalProduct.name}</h3>
                <p className="text-sm text-neutral-400 line-clamp-3">{modalProduct.description}</p>
              </div>
              <button
                onClick={closeProductModal}
                className="text-neutral-400 hover:text-white"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Elige la versión</p>
              <div className="grid gap-2">
                {modalProduct.options?.map((option) => {
                  const isActive = modalOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setModalOptionId(option.id)}
                      className={`w-full min-h-[68px] rounded-2xl border-2 px-5 py-4 text-left transition-all active:scale-95 ${
                        isActive
                          ? "border-[#FCC900] bg-[#FCC900]/10 text-white shadow-lg shadow-[#FCC900]/20"
                          : "border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:border-[#FCC900]/50 hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold">{option.label}</p>
                          <p className="text-xs text-neutral-400">Recomendada: {option.label.toLowerCase()}</p>
                        </div>
                        <span className="text-[#FCC900] font-black text-xl">S/ {option.price.toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="bg-neutral-950 border-2 border-neutral-800 rounded-2xl p-5 flex items-center justify-between">
                <span className="text-neutral-400 font-semibold">Subtotal</span>
                <span className="text-2xl font-black text-[#FCC900]">
                  {modalSelectedOption ? `S/ ${modalSelectedOption.price.toFixed(2)}` : "—"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={closeProductModal}
                  className="min-h-[56px] rounded-2xl border-2 border-neutral-700 bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmModalAdd}
                  disabled={!modalSelectedOption}
                  className="min-h-[56px] rounded-2xl bg-[#FCC900] text-black font-black disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {orderConfirmation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setOrderConfirmation(null)}
            aria-label="Cerrar confirmacion"
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-neutral-700 bg-neutral-900 shadow-2xl">
            <div className="border-b border-neutral-800 p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#FCC900]">Pedido registrado</p>
              <h3 className="mt-2 text-2xl font-black text-white">Confirma el envio por WhatsApp</h3>
              <p className="mt-2 text-sm text-neutral-300">
                {orderConfirmation.customerName}, tu pedido ya se registro en el sistema. Ahora envialo por WhatsApp para coordinar la atencion.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-2xl border border-neutral-700 bg-neutral-950/70 p-4 text-sm text-neutral-200">
                <p><span className="text-neutral-400">Tipo:</span> {orderConfirmation.orderMode}</p>
                <p><span className="text-neutral-400">Pago:</span> {orderConfirmation.paymentMethod}</p>
                <p><span className="text-neutral-400">Total:</span> {orderConfirmation.total}</p>
                {orderConfirmation.orderId && <p><span className="text-neutral-400">Pedido:</span> {orderConfirmation.orderId}</p>}
              </div>

              {orderConfirmation.paymentReminder && (
                <div className="rounded-2xl border border-blue-500/35 bg-blue-500/10 p-4 text-sm text-blue-100">
                  <p className="font-bold">{orderConfirmation.paymentReminder.title}</p>
                  <p className="mt-1">{orderConfirmation.paymentReminder.body}</p>
                </div>
              )}

              <div className="rounded-2xl border border-neutral-700 bg-neutral-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Resumen</p>
                <ul className="mt-2 space-y-1 text-sm text-neutral-200">
                  {orderConfirmation.items.slice(0, 4).map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                  {orderConfirmation.items.length > 4 && (
                    <li className="text-neutral-400">+ {orderConfirmation.items.length - 4} item(s) adicional(es)</li>
                  )}
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOrderConfirmation(null)}
                  className="min-h-[48px] rounded-xl border border-neutral-700 bg-neutral-800 px-4 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={openOrderOnWhatsapp}
                  className="min-h-[48px] rounded-xl bg-[#25D366] px-4 text-sm font-black text-black hover:bg-[#1ebc58] transition-colors"
                >
                  {orderConfirmation.whatsappSent ? "Reenviar por WhatsApp" : "Enviar por WhatsApp"}
                </button>
              </div>

              <p className="text-xs text-neutral-400">
                WhatsApp BIG JACK: {orderConfirmation.whatsappContact}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Mejorado */}
      <footer className="mt-auto bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-t-2 border-[#FCC900]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Sección principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
            {/* Sobre nosotros */}
            <div className="space-y-5 lg:col-span-1">
              <div>
                <img 
                  src="/images/bigjacklogotipo.svg" 
                  alt={restaurantInfo.name} 
                  className="h-16 w-auto object-contain mb-4 drop-shadow-[0_0_15px_rgba(252,201,0,0.24)]" 
                />
                <p className="text-[#C0C0C0] text-sm leading-relaxed">{restaurantInfo.slogan}</p>
                <div className="mt-4 rounded-xl border border-[#FCC900]/45 px-4 py-3 bg-[#1E1E1E]">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#FCC900] font-black">Central de Potencia</p>
                  <p className="font-signature text-white text-lg mt-1">Sello de autenticidad</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-600 font-bold mb-3">Síguenos</p>
                <div className="flex gap-3">
                  <a
                    href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 bg-[#FCC900]/15 border border-[#FCC900]/40 hover:bg-[#FCC900] hover:border-[#FCC900] rounded-xl flex items-center justify-center transition-all group"
                    title="WhatsApp"
                  >
                    <MessageCircle size={20} className="text-[#FCC900] group-hover:text-black transition-colors" />
                  </a>
                  <a
                    href={`https://instagram.com/${restaurantInfo.contact.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 bg-[#B22222]/20 border border-[#B22222]/50 hover:bg-[#B22222] hover:border-[#B22222] rounded-xl flex items-center justify-center transition-all group"
                    title="Instagram"
                  >
                    <Instagram size={20} className="text-[#ffb4b4] group-hover:text-white transition-colors" />
                  </a>
                  <a
                    href={restaurantInfo.contact.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 bg-black border border-neutral-800 hover:border-white hover:bg-neutral-900 rounded-xl flex items-center justify-center transition-all group"
                    title="TikTok"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-white/70 group-hover:text-white transition-colors"
                    >
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contacto y Ubicación */}
            <div className="space-y-5">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <MapPin size={18} className="text-[#FCC900]" /> Ubicación
                </h4>
                <div className="space-y-3 text-sm">
                  <p className="text-neutral-400 leading-relaxed">
                    {restaurantInfo.contact.address}
                  </p>
                  <a
                    href={restaurantInfo.contact.googleMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-white font-semibold transition-all active:scale-95"
                  >
                    <Navigation size={16} />
                    Abrir en Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Horarios */}
            <div className="space-y-5">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <Clock size={18} className="text-[#FCC900]" /> Horarios
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Lun - Jue</span>
                        <span className="text-white font-semibold">4:00 PM - 1:00 AM</span>
                      </div>
                      <div className="border-t border-neutral-800 pt-2 flex justify-between items-center">
                        <span className="text-neutral-400">Vie - Dom</span>
                        <span className="text-[#FCC900] font-bold">4:00 PM - 1:00 AM</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FCC900] hover:bg-[#e2b500] rounded-xl text-black font-bold transition-all active:scale-95"
                  >
                    <MessageCircle size={16} />
                    Abrir chat por WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Información Legal */}
            <div className="space-y-5">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <Clipboard size={18} className="text-[#FCC900]" /> Legal
                </h4>
                <div className="space-y-4">
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 space-y-2 text-sm">
                    <p className="text-neutral-400">
                      <span className="font-semibold text-white">RUC:</span> {restaurantInfo.ruc}
                    </p>
                    <p className="text-neutral-400">
                      <span className="font-semibold text-white">Razón Social:</span><br />
                      <span className="text-xs">Big Jack Perú S.A.C.</span>
                    </p>
                  </div>
                  <Link
                    href="/libro-de-reclamaciones"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#FCC900] hover:bg-[#e2b500] text-black rounded-xl font-bold transition-all shadow-xl shadow-[#FCC900]/20 active:scale-95 w-full justify-center"
                  >
                    <Clipboard size={16} />
                    Libro de Reclamaciones
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t-2 border-neutral-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-[#C0C0C0] text-center md:text-left">
                © {new Date().getFullYear()} <span className="font-bold text-white">{restaurantInfo.name}</span>. Menos carton. Mas carne. Legal.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                <Link
                  href="/links"
                  className="text-xs text-[#FCC900] hover:text-[#e2b500] transition-colors font-bold underline"
                >
                  Todos nuestros enlaces
                </Link>
                <Link
                  href="/quienes"
                  className="text-xs text-neutral-400 hover:text-[#FCC900] transition-colors font-semibold"
                >
                  Quienes somos
                </Link>
                <a
                  href="#menu-section"
                  className="text-xs text-neutral-400 hover:text-[#FCC900] transition-colors font-semibold"
                >
                  Volver al menú
                </a>
                <p className="text-xs flex items-center gap-2 text-[#C0C0C0]">
                  Hecho en Lima <Sparkles size={14} className="text-[#B22222]" /> con calle
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mini ventana de sugerencia para complementos - CON CANTIDADES */}
      {suggestionVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-[#FCC900]/30 rounded-3xl shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-b from-neutral-900 to-neutral-900/95 backdrop-blur-sm p-5 pb-4 border-b border-neutral-800 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-black text-white text-xl flex items-center gap-2">
                    <span className="text-green-500 text-2xl">✓</span> ¡Agregado!
                  </p>
                  <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">¿Quieres completar tu combo? Agrega las cantidades que necesites</p>
                </div>
                <button 
                  onClick={handleCloseSuggestion} 
                  className="text-neutral-500 hover:text-white hover:bg-neutral-800 p-2 rounded-full transition-all ml-2"
                  aria-label="Cerrar"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-neutral-300 font-semibold">Recomendaciones para completar tu pedido:</p>
              <div className="space-y-3">
                {suggestionCards.map(({ type, item, badge, accent }) => {
                  const qty = getSuggestedQty(type);
                  const price = item?.options?.[0]?.price || 0;
                  const subtotal = price * qty;

                  return (
                    <div key={type} className="bg-neutral-800/50 border-2 border-neutral-700 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700 flex-shrink-0">
                          {item?.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/100x100/222/fcc900?text=BIG+JACK";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full grid place-content-center text-xs text-neutral-400">Sin foto</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] uppercase tracking-[0.2em] font-black ${accent}`}>{badge}</p>
                          <p className="text-white font-bold text-base leading-tight truncate">{item?.name}</p>
                          <p className="text-neutral-400 text-xs mt-0.5 line-clamp-2">{item?.options?.[0]?.label}</p>
                          <p className="text-[#FCC900] text-xs font-black mt-1">S/ {price.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-neutral-400">Cantidad:</span>
                        <div className="flex items-center gap-3 bg-neutral-900 rounded-xl p-1.5 border border-neutral-700">
                          <button
                            onClick={() => changeSuggestedQty(type, -1)}
                            disabled={qty === 0}
                            className="w-8 h-8 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-lg font-bold w-8 text-center">{qty}</span>
                          <button
                            onClick={() => changeSuggestedQty(type, 1)}
                            disabled={qty >= 10}
                            className="w-8 h-8 flex items-center justify-center bg-[#FCC900] hover:bg-[#e2b500] disabled:opacity-30 disabled:cursor-not-allowed text-black rounded transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {qty > 0 && (
                        <div className="text-right text-xs text-[#FCC900] font-bold">
                          Subtotal: S/ {subtotal.toFixed(2)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gradient-to-t from-neutral-950 to-neutral-950/95 backdrop-blur-sm p-5 pt-4 border-t border-neutral-800 rounded-b-3xl space-y-3">
              {(suggestedPapasQty > 0 || suggestedInkaQty > 0 || suggestedCocaQty > 0) && (
                <div className="bg-[#FCC900]/10 border border-[#FCC900]/30 rounded-xl p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-300">Total complementos:</span>
                    <span className="text-[#FCC900] font-black text-xl">
                      S/ {(
                        (suggestedGuarn?.options?.[0]?.price || 0) * suggestedPapasQty +
                        (suggestedInka?.options?.[0]?.price || 0) * suggestedInkaQty +
                        (suggestedCoca?.options?.[0]?.price || 0) * suggestedCocaQty
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              <button 
                onClick={handleConfirmSuggestions}
                disabled={suggestedPapasQty === 0 && suggestedInkaQty === 0 && suggestedCocaQty === 0}
                className={`w-full min-h-[60px] rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 shadow-lg ${
                  (suggestedPapasQty > 0 || suggestedInkaQty > 0 || suggestedCocaQty > 0)
                    ? 'bg-gradient-to-r from-[#FCC900] to-[#b07020] hover:from-[#eeb055] hover:to-[#FCC900] text-black active:scale-[0.98]'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={20} />
                {(suggestedPapasQty > 0 || suggestedInkaQty > 0 || suggestedCocaQty > 0)
                  ? 'Agregar al carrito'
                  : 'Selecciona al menos uno'
                }
              </button>
              <button 
                onClick={handleSkipSuggestion} 
                className="w-full min-h-[52px] bg-transparent hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-2xl font-bold transition-all border-2 border-neutral-700 hover:border-neutral-600"
              >
                No, gracias
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra resumen flotante (mobile) */}
      {!suggestionVisible && !isCartOpen && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full rounded-2xl bg-gradient-to-r from-[#FCC900] via-[#eeb055] to-[#FCC900] text-black font-black px-5 py-4 shadow-2xl shadow-[#FCC900]/40 flex items-center justify-between gap-4 active:scale-[0.99]"
            aria-label="Abrir carrito"
          >
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-[0.4em] text-black/70">Tu pedido</p>
              <p className="text-lg">{cart.reduce((sum, item) => sum + item.quantity, 0)} artículos</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">S/ {total.toFixed(2)}</span>
              <div className="w-10 h-10 rounded-full bg-black/20 text-black grid place-content-center">
                <ShoppingCart size={20} />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Botón flotante del carrito (solo cuando no hay resumen activo) */}
      {!suggestionVisible && (cart.length === 0 || isCartOpen) && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 p-4 bg-[#FCC900] text-black rounded-full hover:bg-[#e2b500] transition-all shadow-2xl shadow-[#FCC900]/40 active:scale-95"
          style={{
            animation: cart.length > 0 ? 'none' : 'bounce 2s infinite',
          }}
          aria-label="Abrir carrito"
        >
          <ShoppingCart size={28} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black min-w-[28px] h-7 flex items-center justify-center rounded-full shadow-lg px-2">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

