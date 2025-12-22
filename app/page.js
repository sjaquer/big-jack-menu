"use client";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { menuItems, restaurantInfo, categories } from "./data/menuData";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Send,
  X,
  MapPin,
  Clock,
  AlertTriangle,
  Navigation,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Sparkles,
  Flame,
  Instagram,
  Music2,
  MessageCircle,
  Clipboard,
  Check,
  Truck,
  ArrowUpRight,
} from "lucide-react";
import { Suspense } from "react";
import { isOpenNow, getNextOpenDate, formatMsToCountdown } from "./lib/openHours";
import ClientSearchParams from "./components/ClientSearchParams";
import SecureMap from "./components/SecureMap";

const PRIMARY_CATEGORIES = ["LAS INTOCABLES"];
const COMPLEMENT_CATEGORIES = ["GUARNICION", "BEBIDAS"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bigjack.vercel.app";
const areaServed = "Lince, Lima, Perú";

export default function BigJackMenu() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();
  
  // Estados para el Checkout
  const [orderType, setOrderType] = useState("pickup"); // 'pickup' | 'delivery'
  const [customerName, setCustomerName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryReference, setDeliveryReference] = useState("");
  const [pickupTime, setPickupTime] = useState("now"); // 'now' | 'schedule'
  const [scheduledTime, setScheduledTime] = useState("");
  const [locationLink, setLocationLink] = useState(""); // Link de Google Maps del usuario
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

  // Cargar estado desde localStorage al iniciar
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bj_checkout"));
      if (saved) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setCustomerName(saved.customerName || "");
        const persistedOrderType =
          saved.orderType && saved.orderType !== "pickup"
            ? "pickup"
            : saved.orderType || "pickup";
        setOrderType(persistedOrderType);
        setDeliveryAddress(saved.deliveryAddress || "");
        setDeliveryReference(saved.deliveryReference || "");
        setPickupTime(saved.pickupTime || "now");
        setScheduledTime(saved.scheduledTime || "");
        setPaymentMethod(saved.paymentMethod || "efectivo");
        setNotes(saved.notes || "");
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {}
  }, []);
  // Cargar y sincronizar carrito desde localStorage
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (Array.isArray(savedCart) && savedCart.length > 0) {
        setCart(enforceComplementRules(savedCart));
      }
      const pj = JSON.parse(localStorage.getItem("bj_preorder") || "false");
      if (pj) setIsPreOrder(true);
    } catch (e) {}

    const handleStorage = () => {
      try {
        const latest = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(enforceComplementRules(Array.isArray(latest) ? latest : []));
      } catch (e) {}
    };

    // Escucha tanto eventos reales de storage (otros tabs) como el evento manual
    window.addEventListener("storage", handleStorage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
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
        orderType,
        deliveryAddress,
        deliveryReference,
        pickupTime,
        scheduledTime,
        paymentMethod,
        notes,
      };
      localStorage.setItem("bj_checkout", JSON.stringify(data));
    }, 400);
    return () => clearTimeout(timeout);
  }, [customerName, orderType, deliveryAddress, deliveryReference, pickupTime, scheduledTime, paymentMethod, notes]);


  // Filtrar productos por categoría
  const filteredItems = useMemo(() => {
    if (selectedCategory === "TODOS") return menuItems;
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const heroHighlight = menuItems[0];
  const heroPriceRangeRaw = heroHighlight?.options?.length
    ? heroHighlight.options.reduce(
        (acc, opt) => {
          return [Math.min(acc[0], opt.price), Math.max(acc[1], opt.price)];
        },
        [Infinity, -Infinity]
      )
    : [0, 0];
  const heroPriceRange = [
    heroPriceRangeRaw[0] === Infinity ? 0 : heroPriceRangeRaw[0],
    heroPriceRangeRaw[1] === -Infinity ? heroPriceRangeRaw[0] || 0 : heroPriceRangeRaw[1],
  ];

  const marketingDescription = "Hamburguesas gruesas (no smash) hechas en Lima, Perú. Somos fast food de barrio en pleno Lince, con delivery cercano y recojo rápido en Jr. Bartolomé Herrera 133.";
  const openingHoursSpecification = useMemo(
    () =>
      Object.entries(restaurantInfo.hours || {}).map(([day, hours]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_NAMES[Number(day)] || "Monday",
        opens: hours.open,
        closes: hours.close,
      })),
    []
  );

  const priceValues = useMemo(
    () =>
      menuItems.flatMap((item) => {
        if (item.options?.length) return item.options.map((opt) => opt.price);
        if (item.price) return [item.price];
        return [];
      }),
    []
  );

  const computedPriceRange = useMemo(() => {
    if (!priceValues.length) return "S/ 0";
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);
    return `S/ ${min.toFixed(2)} - S/ ${max.toFixed(2)}`;
  }, [priceValues]);

  const menuSections = useMemo(
    () =>
      categories
        .map((cat) => ({
          "@type": "MenuSection",
          name: cat,
          hasMenuItem: menuItems
            .filter((item) => item.category === cat)
            .map((item) => ({
              "@type": "MenuItem",
              name: item.name,
              description: item.description,
              image: item.image,
              offers: (item.options || []).map((opt) => ({
                "@type": "Offer",
                name: opt.label,
                price: opt.price,
                priceCurrency: "PEN",
                availability: "https://schema.org/InStock",
              })),
            })),
        }))
        .filter((section) => section.hasMenuItem.length > 0),
    []
  );

  const restaurantSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "@id": siteUrl,
      name: restaurantInfo.name,
      description: marketingDescription,
      image: [
        "/images/baconjack.webp",
        "/images/royaljack.webp",
        "/images/grilljack.webp",
      ],
      logo: restaurantInfo.logo,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Jirón Bartolomé Herrera 133",
        addressLocality: "Lince",
        addressRegion: "Lima",
        addressCountry: "PE",
        postalCode: "15046",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "-12.081387",
        longitude: "-77.038263",
      },
      telephone: `+${restaurantInfo.contact.whatsapp}`,
      url: siteUrl,
      sameAs: [
        `https://instagram.com/${restaurantInfo.contact.instagram.replace("@", "")}`,
        restaurantInfo.contact.tiktok,
        `https://wa.me/${restaurantInfo.contact.whatsapp}`,
        restaurantInfo.contact.googleMapsLink,
      ],
      priceRange: computedPriceRange,
      servesCuisine: ["Hamburguesas", "Fast Food", "Comida peruana casual"],
      areaServed,
      openingHoursSpecification,
      hasMenu: {
        "@type": "Menu",
        hasMenuSection: menuSections,
      },
      paymentAccepted: ["Efectivo", "Yape", "Plin"],
      acceptsReservations: false,
      delivery: true,
      takeaway: true,
    }),
    [openingHoursSpecification, menuSections, computedPriceRange]
  );

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Hacen smash burger?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No hacemos smash. Usamos medallones gruesos estilo fast food de barrio con salsas propias.",
          },
        },
        {
          "@type": "Question",
          name: "¿Tienen delivery en Lince?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. Delivery rápido en zonas cercanas a Lince y recojo en Jr. Bartolomé Herrera 133 en 15-20 minutos.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué medios de pago aceptan?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Aceptamos efectivo, Yape y Plin para pedidos directos.",
          },
        },
      ],
    }),
    []
  );

  const socialLinks = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      description: "Pide directo",
      href: `https://wa.me/${restaurantInfo.contact.whatsapp}`,
      icon: MessageCircle,
      accent: "bg-green-500/20 border-green-500/40 text-green-300",
    },
    {
      id: "instagram",
      label: "Instagram",
      description: "Historias y reels",
      href: `https://instagram.com/${restaurantInfo.contact.instagram?.replace("@", "")}`,
      icon: Instagram,
      accent: "bg-pink-500/20 border-pink-500/40 text-pink-200",
    },
    {
      id: "tiktok",
      label: "TikTok",
      description: "Clips diarios",
      href: restaurantInfo.contact.tiktok,
      icon: Music2,
      accent: "bg-white/10 border-white/30 text-white",
    },
  ];
  const deliveryAvailable = true;
  const PEDIDOSYA_LINK = "https://www.pedidosya.com.pe/restaurantes/lima/big-jack-0c79d59d-90de-48bd-aa0d-3a5277f7da49-menu?origin=shop_list";
  const fastTrackHighlights = [
    {
      title: "Sabor de barrio peruano",
      desc: "Recetas propias con carne gruesa y salsas caseras para que se sienta el sabor criollo en cada bocado.",
    },
    {
      title: "Ubicación céntrica en Lince",
      desc: "A pasos de las avenidas principales de Lima. Delivery cercano o recojo rápido en Jr. Bartolomé Herrera 133.",
    },
    {
      title: "Servicio cercano y honesto",
      desc: "Somos un equipo chico con mirada grande: atención directa, tiempos claros y ganas de llevar nuestra propuesta a más barrios del Perú.",
    },
  ];

  const heroInfoCards = [
    {
      id: "hours",
      title: "Horario",
      subtitle: "4:00 PM - 1:00 AM",
      description: "Último pedido directo por WhatsApp.",
      icon: Clock,
    },
    {
      id: "pickup",
      title: "Recojo express",
      subtitle: "Jr. Bartolomé Herrera 133",
      description: "Listo en 15-20 min, llegas y lo entregamos caliente.",
      icon: MapPin,
    },
    {
      id: "delivery",
      title: "Delivery cercano gratis",
      subtitle: "Solo zonas pegadas a Lince",
      description: "Te confirmamos por chat y lo llevamos sin recargo.",
      icon: Truck,
    },
  ];

  // Sugerencias (primer complemento disponible por categoría)
  const suggestedGuarn = menuItems.find((it) => it.category === "GUARNICION");
  const suggestedInka = menuItems.find((it) => it.slug === "inka-cola");
  const suggestedCoca = menuItems.find((it) => it.slug === "coca-cola");

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

  const enforceComplementRules = (items) => {
    const containsPrimary = items.some((entry) =>
      PRIMARY_CATEGORIES.includes(entry.category)
    );
    if (containsPrimary) return items;
    return items.filter((entry) => !COMPLEMENT_CATEGORIES.includes(entry.category));
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
    if (!option) return;
    const isComplementProduct = COMPLEMENT_CATEGORIES.includes(product.category);
    if (isComplementProduct && !hasPrimaryProduct) {
      alert("Para añadir acompañamientos primero agrega una hamburguesa.");
      return;
    }
    const uniqueId = `${product.id}-${option.id || "default"}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === uniqueId);
      if (existing) {
        return enforceComplementRules(
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
      return enforceComplementRules([
        ...prev,
        {
          id: uniqueId,
          productId: product.id,
          category: product.category,
          name: product.name,
          optionId: option.id,
          optionLabel: option.label,
          price: option.price,
          image: product.image,
          quantity: 1,
        },
      ]);
    });
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
      setPickupTime("schedule"); // Forzar programación cuando está cerrado
      try { localStorage.setItem("bj_preorder", JSON.stringify(true)); } catch(e){}
      // also show the closed notice bar so user knows
      setClosedNoticeHidden(true);
    }
    setTimeout(() => {
      setRecentlyAdded((current) => (current === uniqueId ? null : current));
    }, 1200);
  };

  const handleAddProduct = (product, optionId) => {
    const option = product.options?.find((opt) => opt.id === optionId) || product.options?.[0];
    addToCart(product, option);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    if (window.confirm('¿Estás seguro de vaciar todo el carrito?')) {
      setCart([]);
      setIsPreOrder(false);
      try {
        localStorage.removeItem('cart');
        localStorage.removeItem('bj_preorder');
      } catch(e) {}
    }
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      enforceComplementRules(
        prev.map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      )
    );
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


  const getUserLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationLink(link);
        alert("¡Ubicación lista! La usaremos para coordinar tu delivery por inDrive.");
      },
      () => {
        alert("No pudimos obtener tu ubicación automáticamente. Escribe tu dirección o pega un enlace de Google Maps.");
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
  };

  const formatScheduledPickup = () => {
    if (!scheduledTime) return "Programado";
    if (scheduledTime.includes("T")) {
      const date = new Date(scheduledTime);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
      }
    }
    return scheduledTime;
  };

  const sendOrderToWhatsapp = () => {
    if (cart.length === 0) return;

    // Si es una pre-orden, solo permitir recojo en tienda
    if (isPreOrder) {
      if (orderType === "delivery") {
        alert("Las pre-ordenes solo están disponibles para recojo en tienda. Cambia a 'Recojo' para continuar.");
        return;
      }
    } else {
      // flujo normal: no permitir enviar si estamos cerrados
      if (!isOpen) {
        alert("Estamos cerrados ahora. El envío de pedidos por WhatsApp está deshabilitado hasta la próxima apertura.");
        return;
      }
    }

    if (!customerName.trim()) {
      alert("Por favor ingresa tu nombre.");
      return;
    }
    if (orderType === 'delivery' && paymentMethod === 'efectivo') {
      alert('Para delivery solo aceptamos Yape o Plin. Por favor elige uno de esos métodos.');
      return;
    }
    if (orderType === "delivery" && !deliveryAddress.trim() && !locationLink) {
      alert("Por favor ingresa tu dirección o comparte tu ubicación.");
      return;
    }

    // Validar hora programada de recojo (debe ser >= hora de apertura si está programado)
    if (orderType === "pickup" && pickupTime === "schedule" && scheduledTime) {
      const now = new Date();
      const nextOpen = getNextOpenDate(now);
      const scheduledDate = new Date(scheduledTime);
      
      if (nextOpen && scheduledDate < nextOpen) {
        const openTimeStr = nextOpen.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
        alert(`La hora programada debe ser a partir de nuestra apertura (${openTimeStr}). Por favor ajusta la hora.`);
        return;
      }
      
      // Si estamos abiertos, validar que la hora programada sea futura
      if (isOpen && scheduledDate <= now) {
        alert("La hora programada debe ser en el futuro. Por favor selecciona una hora más tarde.");
        return;
      }
    }

    const sections = [];

    // Construir mensaje en formato limpio y legible para cocina
    // Detectar si es dispositivo móvil en tiempo de ejecución y habilitar emojis solo en móvil
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    const useEmojis = isMobile; // evita problemas de render en WhatsApp Web/PC
    const header = (emoji, label) => (useEmojis ? `${emoji} ${label}` : label);
    const lines = [];

    if (isPreOrder) {
      const nextOpenDate = getNextOpenDate(new Date());
      const countdown = nextOpenMs ? formatMsToCountdown(nextOpenMs) : null;
      const when = nextOpenDate
        ? nextOpenDate.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })
        : "la próxima apertura";
      lines.push("PRE-ORDEN (solo recojo)");
      lines.push(`Se procesa al abrir: ${when}${countdown ? ` (en ${countdown})` : ""}`);
      lines.push("");
    }

    lines.push(useEmojis ? "🔥 PEDIDO BIG JACK 🔥" : "PEDIDO BIG JACK");
    lines.push("");

    // Datos básicos
    lines.push(header("👤", "CLIENTE:"));
    lines.push(customerName);
    lines.push("");
    lines.push(header("🛵", "MODALIDAD:"));
    lines.push(orderType === "delivery" ? "Delivery (coordinado por inDrive)" : "Recojo en tienda");
    lines.push("");

    // Datos de entrega o recojo
    if (orderType === "delivery") {
      lines.push(header("📍", "DIRECCIÓN:"));
      lines.push(deliveryAddress || "Ubicación compartida");
      if (deliveryReference) {
        lines.push("");
        lines.push(header("🏠", "REFERENCIA:"));
        lines.push(deliveryReference);
      }
      if (locationLink) {
        lines.push("");
        lines.push(header("🗺️", "MAPA:"));
        lines.push(locationLink);
      }
      lines.push("");
      lines.push(header("🚕", "COORDINACIÓN:"));
      lines.push("Delivery por inDrive. Te enviaremos el enlace del conductor cuando acepten el viaje.");
    } else {
      if (isPreOrder) {
        const nextOpenDate = getNextOpenDate(new Date());
        const when = nextOpenDate
          ? nextOpenDate.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })
          : "nuestra próxima apertura";
        lines.push(header("⏰", "RECOJO:"));
        lines.push(`PRE-ORDEN — disponible desde ${when}`);
      } else {
        lines.push(header("⏰", "RECOJO:"));
        lines.push(pickupTime === "now" ? "Inmediato (15-20 min)" : `Programado: ${formatScheduledPickup()}`);
      }
    }

    lines.push("");

    // Items
    lines.push(header("🍔", "PEDIDO:"));
    cart.forEach((item) => {
      lines.push(`• ${item.quantity}x ${item.name} (${item.optionLabel}) — S/ ${(item.price * item.quantity).toFixed(2)}`);
    });

    lines.push("");

    // Totales y pago
    lines.push(header("💰", "TOTAL A PAGAR:"));
    lines.push(`S/ ${total.toFixed(2)}`);
    lines.push("");
    lines.push(header("💳", "MÉTODO DE PAGO:"));
    lines.push(paymentMethod.toUpperCase());

    if (notes.trim()) {
      lines.push("");
      lines.push(header("📝", "NOTAS:"));
      lines.push(notes.trim());
    }

    lines.push("");
    lines.push("Tu pedido se procesará en breve.");

    const message = lines.join("\n");

    // Normalizar espacios alrededor de marcadores de formato para WhatsApp
    // Reglas aplicadas:
    // 1) Limpiar espacios internos: "* Cliente *" => "*Cliente*"
    // 2) Mover puntuación hacia afuera: "*Cliente:*" => "*Cliente*:" (mejor lectura y render en WhatsApp)
    // 3) Asegurar espacio después de un cierre si falta: "*Cliente*Sebastian" => "*Cliente* Sebastian"
    // 4) Asegurar espacio antes de una apertura si falta: "Hola*Cliente*" => "Hola *Cliente*"
    // 5) Colapsar espacios repetidos y trim final
    let normalized = message
      // 1) limpiar espacios dentro de marcadores
      .replace(/\*\s+([^*]+?)\s+\*/g, "*$1*")
      .replace(/_\s+([^_]+?)\s+_/g, "_$1_")
      // 2) mover puntuación fuera de los marcadores (ej: *Texto:* -> *Texto*:) para evitar problemas de parseo
      .replace(/\*([^*]+?)([:;,.!?])\*/g, "*$1*$2")
      .replace(/_([^_]+?)([:;,.!?])_/g, "_$1_$2")
      // 3) asegurar espacio después del cierre si el siguiente carácter no es espacio (incluye letras, dígitos, emojis, paréntesis, etc.)
      .replace(/(\*[^*]+\*)(?=\S)/g, "$1 ")
      .replace(/(_[^_]+_)(?=\S)/g, "$1 ")
      // 4) asegurar espacio antes de una apertura si el carácter previo no es espacio
      .replace(/(\S)(\*|_)(?=\S)/g, "$1 $2")
      // colapsar múltiples espacios consecutivos en uno y recortar
      .replace(/\s{2,}/g, " ")
      .trim();

    // Si hay marcadores sin pareja (asterisco o guión bajo), quitar el último para evitar asteriscos sueltos en el mensaje
    const starCount = (normalized.match(/\*/g) || []).length;
    if (starCount % 2 === 1) {
      const last = normalized.lastIndexOf("*");
      if (last !== -1) normalized = normalized.slice(0, last) + normalized.slice(last + 1);
    }
    const underCount = (normalized.match(/_/g) || []).length;
    if (underCount % 2 === 1) {
      const lastU = normalized.lastIndexOf("_");
      if (lastU !== -1) normalized = normalized.slice(0, lastU) + normalized.slice(lastU + 1);
    }

    const url = `https://wa.me/${restaurantInfo.contact.whatsapp}?text=${encodeURIComponent(normalized)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white font-sans overflow-x-hidden">
      <Head>
        <title>{restaurantInfo.name} | Hamburguesas en Lince</title>
        <meta name="description" content={marketingDescription} />
        <meta
          name="keywords"
          content="hamburguesas lince, comida rápida lince, fast food barrio, hamburguesas gruesas, no smash burger, delivery lince, big jack"
        />
        <meta name="geo.region" content="PE-LMA" />
        <meta name="geo.placename" content="Lince, Lima, Perú" />
        <meta name="geo.position" content="-12.081387;-77.038263" />
        <meta name="ICBM" content="-12.081387, -77.038263" />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:title" content={`${restaurantInfo.name} - Hamburguesas en Lince`} />
        <meta property="og:description" content={marketingDescription} />
        <meta property="og:type" content="restaurant" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:locale" content="es_PE" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${restaurantInfo.name} - Hamburguesas en Lince`} />
        <meta name="twitter:description" content={marketingDescription} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 backdrop-blur-md border-b-2 border-[#d99133]/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo y título */}
            <div className="flex-1">
              <Link href="/" className="block">
                <img 
                  src="/images/bigjacktitle.webp" 
                  alt={restaurantInfo.name} 
                  className="h-10 sm:h-12 w-auto object-contain hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(217,145,51,0.3)]" 
                />
                <p className="text-[10px] text-neutral-500 hidden sm:block mt-1 font-medium tracking-wide ml-1">{restaurantInfo.slogan}</p>
              </Link>
            </div>

            {/* Info rápida - Solo desktop */}
            <div className="hidden lg:flex items-center gap-6 mx-6">
              <div className="flex items-center gap-2 text-xs">
                <Clock size={16} className="text-[#d99133]" />
                <div>
                  <p className="text-neutral-400">Lun-Jue: 4:30-11PM</p>
                  <p className="text-neutral-300 font-semibold">Vie-Dom: 5PM-1AM</p>
                </div>
              </div>
              <Link
                href="/quienes"
                className="hidden xl:inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-white text-sm font-semibold transition-all"
              >
                <User size={16} />
                Quienes somos
              </Link>
              <a
                href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-white text-sm font-bold transition-all active:scale-95"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>

            {/* Botón de carrito */}
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-3 bg-[#d99133] text-white rounded-2xl hover:bg-[#c07e2b] transition-all shadow-lg shadow-[#d99133]/20 active:scale-95"
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Barra de acciones rápidas móvil */}
          <div className="lg:hidden pb-3 flex items-center justify-between gap-3 border-t border-neutral-800 pt-3">
            <a
              href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-white text-sm font-bold transition-all active:scale-95"
            >
              <MessageCircle size={16} />
              Pedir por WhatsApp
            </a>
            <Link
              href="/quienes"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
            >
              <User size={16} />
              Quienes somos
            </Link>
            <a
              href={restaurantInfo.contact.googleMapsLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
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

      {/* HERO EXPERIENCE - CLEAN & BRANDED */}
      <section className="relative overflow-hidden border-b border-neutral-800 bg-[#020204]">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(217,145,51,0.15),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-12 md:py-20 grid gap-10 md:grid-cols-2 items-center">
          {/* Brand & Content */}
          <div className="space-y-8 text-center md:text-left order-2 md:order-1">
            
            {/* Logo Brand */}
            <div className="relative w-64 h-32 mx-auto md:mx-0">
               <div className="absolute inset-0 bg-[#d99133] blur-[80px] opacity-20 rounded-full pointer-events-none"></div>
               <Image 
                 src="/images/bigjacklogotipo.webp" 
                 alt="Big Jack Logo"
                 fill
                 className="object-contain drop-shadow-2xl"
                 priority
               />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black leading-[0.95] text-white tracking-tight">
                HAMBURGUESAS <br/>
                <span className="text-[#d99133]">BRUTALES EN LINCE</span>
              </h2>
              <p className="text-neutral-300 text-lg font-semibold max-w-xl mx-auto md:mx-0 leading-snug">
                Burger spot peruano en el corazón de Lima. Sabor de barrio, porciones contundentes y servicio directo. Abierto de 4:00 PM a 1:00 AM con recojo y delivery cercano.
              </p>
              
              {/* Status Pills */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wide">
                  <Truck size={12} /> Delivery Gratis (Zonas cercanas)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d99133]/10 border border-[#d99133]/20 text-[#d99133] text-xs font-bold uppercase tracking-wide">
                  <Clock size={12} /> Recojo 15 min
                </span>
              </div>

              <p className="text-neutral-400 text-sm max-w-xl mx-auto md:mx-0">
                Nuestra misión: democratizar una burger de calidad con alma de barrio. Queremos ser la parada confiable para comer bien hoy en Lince y mañana en más distritos del Perú.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
              <a
                href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="h-14 px-8 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all active:scale-95 hover:-translate-y-0.5"
              >
                <MessageCircle size={22} /> 
                Pedir por WhatsApp
              </a>
              <button
                onClick={scrollToMenu}
                className="h-14 px-8 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-lg flex items-center justify-center gap-2 border border-neutral-700 transition-all active:scale-95 hover:-translate-y-0.5"
              >
                <Flame size={22} className="text-[#d99133]" /> 
                Ver carta
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative order-1 md:order-2">
            <div className="relative aspect-square md:aspect-[4/3] rounded-[2.5rem] overflow-hidden border-4 border-neutral-900 shadow-2xl shadow-orange-900/20 group rotate-1 hover:rotate-0 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              {heroHighlight ? (
                <img
                  src={heroHighlight.image}
                  alt={heroHighlight.name}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x600/222/yellow?text=BIG+JACK";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                  <Flame size={48} className="text-neutral-700" />
                </div>
              )}
              
              {/* Floating Price Tag */}
              <div className="absolute bottom-6 right-6 z-20 bg-[#d99133] text-white px-6 py-3 rounded-2xl shadow-xl transform group-hover:scale-110 transition-transform">
                <p className="text-xs font-bold uppercase opacity-90 mb-0.5">Desde</p>
                <p className="text-3xl font-black">S/ {heroPriceRange[0].toFixed(2)}</p>
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
              <button onClick={() => { window.location.href = '/libro-de-reclamaciones'; }} className="px-4 py-3 rounded-2xl bg-[#d99133] hover:bg-[#c07e2b] text-white font-bold">Libro de Reclamaciones</button>
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
                      ? "bg-[#d99133] text-white border-[#d99133] shadow-lg shadow-[#d99133]/25 scale-105"
                      : "bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:border-[#d99133]/50 hover:text-white hover:bg-neutral-800"
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
            <p className="text-xs uppercase tracking-widest text-[#d99133] font-bold">Estás viendo</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">{selectedCategory === "TODOS" ? "Menú Completo" : selectedCategory}</h2>
            <p className="text-sm text-neutral-400">{filteredItems.length} {filteredItems.length === 1 ? 'producto disponible' : 'productos disponibles'}</p>
          </div>
          <div className="bg-neutral-900/80 border-2 border-neutral-800 rounded-2xl p-4 max-w-md">
                <p className="text-xs text-neutral-400 leading-relaxed flex items-start gap-2">
              <Sparkles size={16} className="text-[#d99133]" />
              <span><span className="font-semibold text-white">Tip:</span> Toca cualquier imagen para ver detalles completos o usa los botones para añadir rápido al carrito.</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isComplement = COMPLEMENT_CATEGORIES.includes(item.category);
            const isPrimary = PRIMARY_CATEGORIES.includes(item.category);
            const complementBlocked = isComplement && !hasPrimaryProduct;
            const optionsToRender = item.options?.length
              ? item.options
              : [{ id: "regular", label: "Regular", price: item.price || 0 }];
            const basePrice = optionsToRender.reduce((min, opt) => Math.min(min, opt.price), optionsToRender[0].price);
            return (
              <div key={item.id} className="group relative bg-neutral-900 border border-neutral-800 rounded-[2rem] overflow-hidden hover:border-[#d99133]/50 transition-all duration-300 flex flex-col sm:block shadow-lg hover:shadow-[#d99133]/10">
                {/* Mobile Layout: Horizontal Card */}
                <div className="flex sm:block h-full p-2 sm:p-3">
                  {/* Image Section */}
                  <Link href={`/product/${item.slug}`} className="w-1/3 sm:w-full sm:h-56 relative block overflow-hidden bg-neutral-800 flex-shrink-0 rounded-2xl sm:rounded-[1.5rem] border border-neutral-800 shadow-inner">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/600x400/222/d99133?text=BIG+JACK";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">Sin foto</div>
                    )}
                    {item.popular && (
                      <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-[#d99133] text-white text-[10px] sm:text-xs font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-lg z-10">
                        HIT
                      </span>
                    )}
                  </Link>

                  {/* Content Section */}
                  <div className="flex-1 pl-4 py-1 pr-1 sm:p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#d99133] font-bold mb-0.5">{item.category}</p>
                          <h3 className="text-lg sm:text-xl font-black text-white leading-tight line-clamp-2">{item.name}</h3>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-black text-[#d99133]">S/ {basePrice.toFixed(2)}</p>
                        </div>
                      </div>
                      <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-3 sm:mb-4">{item.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto">
                      {isPrimary ? (
                        <button
                          onClick={() => openProductModal(item)}
                          className="w-full py-3 rounded-full bg-[#d99133] text-white text-sm font-bold hover:bg-[#c07e2b] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#d99133]/20"
                        >
                          <Plus size={18} />
                            <span className="hidden sm:inline">Personalizar</span>
                            <span className="sm:hidden">Agregar</span>
                        </button>
                      ) : (
                        <div className="space-y-2">
                          {optionsToRender.map((option) => {
                            const isRecent = recentlyAdded === `${item.id}-${option.id}`;
                            return (
                              <button
                                key={option.id}
                                onClick={() => handleAddProduct(item, option.id)}
                                disabled={complementBlocked}
                                className={`w-full py-2.5 px-4 rounded-full border text-left transition-all flex items-center justify-between active:scale-95 ${
                                  isRecent
                                    ? "border-green-500 bg-green-500/10 text-green-400"
                                    : "border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-[#d99133]/50 hover:text-white"
                                } ${complementBlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                <span className="text-xs font-bold truncate mr-2">{option.label}</span>
                                {isRecent ? <Check size={14} /> : <Plus size={14} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* FAST TRACK & MAPA (Moved to bottom) */}
      <div className="bg-neutral-900 border-t border-neutral-800">
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Fast Track Info */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <Sparkles className="text-[#d99133]" /> Experiencia Big Jack
              </h3>
              <div className="grid gap-4">
                {fastTrackHighlights.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-4 p-4 rounded-2xl bg-neutral-800/50 border border-neutral-800"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#d99133]/10 flex items-center justify-center text-[#d99133] flex-shrink-0">
                      <Check size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{feature.title}</h4>
                      <p className="text-sm text-neutral-400 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mapa */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <MapPin className="text-[#d99133]" /> Encuéntranos
              </h3>
              <div className="rounded-2xl overflow-hidden border border-neutral-800 h-64 shadow-2xl">
                <SecureMap />
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={restaurantInfo.contact.googleMapsLink} target="_blank" rel="noreferrer" className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-4 py-3 rounded-xl transition-all border border-neutral-700">
                  <Navigation size={18} /> Ir con Google Maps
                </a>
                <a href={PEDIDOSYA_LINK} target="_blank" rel="noreferrer" className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 bg-[#ea004b] hover:bg-[#d60044] text-white font-bold px-4 py-3 rounded-xl transition-all shadow-lg shadow-red-900/20">
                  <span className="font-black">Pe</span> PedidosYa
                </a>
              </div>
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
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#d99133] mb-1">{modalProduct.category}</p>
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
                          ? "border-[#d99133] bg-[#d99133]/10 text-white shadow-lg shadow-[#d99133]/20"
                          : "border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:border-[#d99133]/50 hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold">{option.label}</p>
                          <p className="text-xs text-neutral-400">Recomendada: {option.label.toLowerCase()}</p>
                        </div>
                        <span className="text-[#d99133] font-black text-xl">S/ {option.price.toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="bg-neutral-950 border-2 border-neutral-800 rounded-2xl p-5 flex items-center justify-between">
                <span className="text-neutral-400 font-semibold">Subtotal</span>
                <span className="text-2xl font-black text-[#d99133]">
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
                  className="min-h-[56px] rounded-2xl bg-[#d99133] text-black font-black disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CARRITO (Móvil y Desktop) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsCartOpen(false)}
            aria-label="Cerrar carrito"
          ></div>
          
          {/* Panel Lateral */}
          <div className="relative w-full max-w-md bg-neutral-900 h-full shadow-2xl rounded-l-[32px] flex flex-col border-l border-neutral-800 animate-in slide-in-from-right duration-300 z-10">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900">
              <h2 className="text-xl font-black flex items-center gap-2 text-white">
                <ShoppingCart className="text-[#d99133]" />
                TU PEDIDO
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent p-5 space-y-6">
              {/* LISTA DE ITEMS */}
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                  <div className="space-y-2">
                    <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart size={40} className="text-neutral-600" />
                    </div>
                    <p className="text-xl font-black text-white">Tu carrito está vacío</p>
                    <p className="text-sm text-neutral-400 max-w-[200px] mx-auto">
                      ¿No sabes qué pedir? Aquí tienes nuestros favoritos:
                    </p>
                  </div>
                  
                  <div className="w-full space-y-3">
                    {menuItems.filter(i => i.popular).slice(0, 2).map(item => (
                      <button
                        key={item.id}
                        onClick={() => openProductModal(item)}
                        className="w-full flex items-center gap-4 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-[#d99133]/50 p-3 rounded-2xl transition-all group text-left"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-700 flex-shrink-0 border border-neutral-600">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {e.target.src = "https://placehold.co/100x100/222/d99133?text=BJ"}}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white group-hover:text-[#d99133] transition-colors truncate">{item.name}</p>
                          <p className="text-xs text-neutral-400 line-clamp-1">{item.description}</p>
                          <p className="text-[#d99133] font-black text-sm mt-1">S/ {item.options?.[0]?.price.toFixed(2)}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#d99133] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 shadow-lg shadow-[#d99133]/20">
                          <Plus size={18} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-neutral-800/50 p-3 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-colors">
                      <div className="w-16 h-16 bg-neutral-700 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-700">
                         <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {e.target.src = "https://placehold.co/100x100/222/d99133?text=BJ"}}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm mb-1 text-white truncate">{item.name}</h4>
                        <p className="text-xs text-neutral-400 mb-2">{item.optionLabel}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-[#d99133] font-black text-sm">S/ {(item.price * item.quantity).toFixed(2)}</p>
                          <div className="flex items-center gap-3 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded text-white transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 flex items-center justify-center bg-[#d99133] hover:bg-[#c07e2b] text-black rounded transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-500 hover:text-red-500 self-start p-1 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* FORMULARIO DE CHECKOUT RE-DISEÑADO */}
              {cart.length > 0 && (
                <div className="space-y-6">
                  {/* Paso 1: Datos Básicos */}
                  <div className="bg-neutral-800/60 rounded-2xl border-2 border-neutral-700 p-6 space-y-5 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-[#d99133] flex items-center gap-2"><User size={20} /> Paso 1 · Tu nombre</h3>
                      <span className="text-xs px-3 py-1.5 bg-neutral-700 rounded-full font-semibold">Paso 1</span>
                    </div>
                    <div className="grid gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Tu nombre completo</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                          <input
                            value={customerName}
                            onChange={(e)=>setCustomerName(e.target.value)}
                            placeholder="Ej: Juan Pérez García"
                            className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-2xl py-4 pl-12 pr-4 text-base focus:border-[#d99133] outline-none transition-colors text-white placeholder:text-neutral-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-3">¿Cómo recibes tu pedido?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={()=>handleSelectOrderType("pickup")}
                            className={`min-h-[120px] rounded-2xl text-base font-bold border-2 flex flex-col items-center justify-center gap-2 px-6 text-center transition-all ${orderType==='pickup'? 'bg-[#d99133] text-black border-[#d99133] shadow-lg':'bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500'}`}
                          >
                            <span className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${orderType==='pickup' ? 'border-black/20 bg-black/10 text-black' : 'border-neutral-700 bg-neutral-900 text-white'}`}>
                              <Clock size={26} />
                            </span>
                            <span className="text-lg font-black">Recojo en local</span>
                            <span className={`text-xs font-semibold ${orderType==='pickup' ? 'text-black/70' : 'text-neutral-300'}`}>Listo en 15-20 minutos</span>
                          </button>
                          <button
                            type="button"
                            onClick={()=>handleSelectOrderType("delivery")}
                            className={`min-h-[120px] rounded-2xl text-base font-bold border-2 flex flex-col items-center justify-center gap-2 px-6 text-center transition-all ${deliveryAvailable && orderType==='delivery'? 'bg-[#d99133] text-black border-[#d99133] shadow-lg':'bg-neutral-950 border-neutral-800 text-neutral-200 hover:border-neutral-500'}`}
                          >
                            <span className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${deliveryAvailable && orderType==='delivery' ? 'border-black/20 bg-black/10 text-black' : 'border-neutral-700 bg-neutral-900 text-white'}`}>
                              <Truck size={26} />
                            </span>
                            <span className="text-lg font-black">Delivery por inDrive</span>
                            <span className={`text-xs font-semibold ${deliveryAvailable && orderType==='delivery' ? 'text-black/70' : 'text-neutral-400'}`}>Coordinamos el viaje y te mandamos el link</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Sin recargo en Lince</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-3 flex items-start gap-2">
                          <Truck size={14} className="text-[#d99133] flex-shrink-0 mt-0.5" />
                          <span>Si estás a unas cuadras del local te lo llevamos sin costo usando inDrive. Si estás lejos te guiamos a PedidosYa para que llegue igual.</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Paso 2: Condicional según tipo */}
                  <div className="bg-neutral-800/60 rounded-2xl border-2 border-neutral-700 p-6 space-y-5 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-[#d99133] flex items-center gap-2">
                        {orderType==='delivery' ? <MapPin size={20} /> : <Clock size={20} />} 
                        {orderType==='delivery' ? 'Paso 2 · Entrega' : 'Paso 2 · Recojo'}
                      </h3>
                      <span className="text-xs px-3 py-1.5 bg-neutral-700 rounded-full font-semibold">Paso 2</span>
                    </div>
                    
                    {orderType==='delivery' ? (
                      <div className="space-y-4">
                        <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-4 text-sm text-green-200 font-semibold flex items-start gap-2">
                          <Truck size={18} className="flex-shrink-0" />
                          <span>Delivery gratis cerca de Lince. Coordinamos por inDrive y te enviamos el enlace por WhatsApp.</span>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-white mb-2">Dirección</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                            <input
                              value={deliveryAddress}
                              onChange={(e)=>setDeliveryAddress(e.target.value)}
                              placeholder="Calle y número"
                              className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl py-4 pl-12 pr-4 text-base focus:border-[#d99133] outline-none transition-colors text-white placeholder:text-neutral-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-white mb-2">Referencia</label>
                          <div className="relative">
                            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                            <input
                              value={deliveryReference}
                              onChange={(e)=>setDeliveryReference(e.target.value)}
                              placeholder="Ej: Frente al parque"
                              className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl py-4 pl-12 pr-4 text-base focus:border-[#d99133] outline-none transition-colors text-white placeholder:text-neutral-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-blue-600/10 border-2 border-blue-500/30 rounded-xl p-4 text-sm text-blue-200 font-semibold flex items-start gap-2">
                            <MapPin size={18} className="flex-shrink-0" />
                            <span>Comparte tu ubicación (Google Maps) y coordinamos tu delivery por inDrive.</span>
                          </div>

                          <button 
                            type="button"
                            onClick={getUserLocation} 
                            className={`w-full min-h-[140px] rounded-2xl border-3 flex flex-col items-center justify-center gap-4 px-8 text-center transition-all shadow-xl ${locationLink ? 'bg-green-600/20 border-green-500 text-white' : 'bg-[#4285F4] border-[#4285F4] text-white hover:bg-[#3367D6] active:scale-[0.98]'}`}
                          >
                            <span className={`w-16 h-16 rounded-full flex items-center justify-center ${locationLink ? 'bg-green-500 text-white' : 'bg-white/20 backdrop-blur-sm'}`}>
                              <MapPin size={32} strokeWidth={2.5} />
                            </span>
                            <div className="space-y-1">
                              <span className="text-xl font-black leading-tight block">
                                {locationLink ? '✓ Ubicación enviada' : 'Compartir mi ubicación'}
                              </span>
                              <span className="text-sm opacity-90 font-semibold block">
                                {locationLink ? 'Se enviará por WhatsApp' : 'Presiona para activar GPS'}
                              </span>
                            </div>
                          </button>

                          {locationLink && (
                            <div className="bg-green-600/10 border-2 border-green-500/30 rounded-xl p-4 space-y-2 animate-in fade-in">
                              <p className="text-sm text-green-200 font-bold flex items-center gap-2">
                                <Check size={18} className="text-green-400" />
                                Tu ubicación está lista
                              </p>
                              <p className="text-xs text-green-300/80 leading-relaxed break-all">
                                {locationLink}
                              </p>
                              <button
                                type="button"
                                onClick={() => setLocationLink("")}
                                className="text-xs text-green-200 hover:text-white underline font-semibold"
                              >
                                Cambiar ubicación
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="bg-neutral-900/80 border border-neutral-700 rounded-xl p-5 space-y-3">
                          <p className="text-base font-bold text-white flex items-center gap-2">
                            <Sparkles size={18} className="text-[#d99133]" />
                            Instrucciones fáciles
                          </p>
                          <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-300 leading-relaxed">
                            <li className="pl-2">Presiona el botón azul grande que dice <span className="font-bold text-white">"Compartir mi ubicación"</span></li>
                            <li className="pl-2">Tu navegador te pedirá permiso para usar tu ubicación. Dale <span className="font-bold text-white">"Permitir"</span> o <span className="font-bold text-white">"Aceptar"</span></li>
                            <li className="pl-2">Listo! El enlace de Google Maps se guardará automáticamente y se enviará por WhatsApp</li>
                          </ol>
                          <div className="bg-neutral-800/60 rounded-lg p-3 mt-3">
                            <p className="text-xs text-neutral-400 leading-relaxed">
                              <span className="font-semibold text-neutral-300">¿Necesitas ayuda?</span> Pide a alguien de confianza que presione el botón azul por ti. El sistema hará todo automáticamente.
                            </p>
                          </div>
                        </div>
                        <div className="bg-[#ea004b]/10 border border-[#ea004b]/30 rounded-xl p-4 text-xs text-[#ff80aa] space-y-2">
                          <p className="text-sm font-semibold flex items-center gap-2">
                            <Send size={16} className="text-[#ff99bb]" />
                            ¿Fuera de la zona de inDrive?
                          </p>
                          <p>Si estás lejos de Lince puedes hacer tu pedido por PedidosYa y llegará igual de rápido.</p>
                          <a
                            href={PEDIDOSYA_LINK}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ea004b] hover:bg-[#d60044] text-white font-semibold transition-all w-full justify-center"
                          >
                            Abrir PedidosYa
                            <ArrowUpRight size={14} />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-3">¿Cuándo lo recoges?</label>
                        {!isOpen && isPreOrder ? (
                          <div className="bg-[#d99133]/10 border-2 border-[#d99133]/30 rounded-xl p-4 mb-3">
                            <p className="text-[#d99133] text-sm font-semibold flex items-center gap-2">
                              <AlertTriangle size={18} />
                              Estamos cerrados. Solo puedes programar tu pedido.
                            </p>
                          </div>
                        ) : null}
                        <div className="grid grid-cols-1 gap-3">
                          <button
                              type="button"
                              onClick={()=>setPickupTime("now")}
                              disabled={!isOpen && isPreOrder}
                              className={`min-h-[60px] px-4 rounded-2xl text-base font-bold border-2 flex items-center justify-center gap-3 transition-all ${
                                !isOpen && isPreOrder 
                                  ? 'bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed opacity-50'
                                  : pickupTime==='now'
                                    ? 'bg-[#d99133] text-black border-[#d99133]'
                                    : 'bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500'
                              }`}
                              >
                                <Clock size={20} />
                                Ahora mismo (15-20 min)
                              </button>
                              <button
                                type="button"
                                onClick={()=>setPickupTime("schedule")}
                                className={`min-h-[60px] px-4 rounded-2xl text-base font-bold border-2 flex items-center justify-center gap-3 transition-all ${pickupTime==='schedule'? 'bg-[#d99133] text-black border-[#d99133]':'bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500'}`}
                              >
                                <Clock size={20} />
                                Programar hora
                              </button>
                          </div>
                        </div>                        {pickupTime==='schedule' && (
                          <div className="animate-in slide-in-from-top-2 duration-200">
                            <label className="block text-sm text-neutral-300 mb-3">
                              Selecciona una hora {!isOpen && '(a partir de la apertura)'}
                            </label>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              {/* Generar slots de tiempo: desde apertura si estamos cerrados, o desde ahora si estamos abiertos */}
                              {(() => {
                                const slots = [];
                                let startTime = new Date();
                                
                                // Si estamos cerrados, comenzar desde la próxima apertura
                                if (!isOpen) {
                                  const nextOpen = getNextOpenDate(new Date());
                                  if (nextOpen) {
                                    startTime = new Date(nextOpen);
                                  }
                                } else {
                                  // Si estamos abiertos, comenzar desde ahora + 15 min redondeado
                                  const remainder = 15 - (startTime.getMinutes() % 15);
                                  startTime.setMinutes(startTime.getMinutes() + remainder);
                                }
                                
                                // Generar 6 slots de 15 minutos
                                for(let i=0; i<6; i++) {
                                  const dateStr = startTime.toISOString().slice(0, 16); // formato datetime-local
                                  const displayStr = startTime.toLocaleString('es-PE', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                  });
                                  slots.push({ value: dateStr, label: displayStr });
                                  startTime.setMinutes(startTime.getMinutes() + 15);
                                }
                                
                                return slots.map(slot => (
                                  <button
                                    type="button"
                                    key={slot.value}
                                    onClick={()=>setScheduledTime(slot.value)}
                                    className={`min-h-[56px] rounded-xl text-sm font-bold border-2 transition-all ${scheduledTime===slot.value ? 'bg-[#d99133] text-black border-[#d99133]' : 'bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500'}`}
                                  >
                                    {slot.label}
                                  </button>
                                ));
                              })()}
                            </div>
                            <div className="relative">
                               <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                               <input
                                type="datetime-local"
                                value={scheduledTime}
                                min={(() => {
                                  // Establecer mínimo: hora de apertura si cerrado, o ahora si abierto
                                  if (!isOpen) {
                                    const nextOpen = getNextOpenDate(new Date());
                                    return nextOpen ? nextOpen.toISOString().slice(0, 16) : undefined;
                                  }
                                  const now = new Date();
                                  now.setMinutes(now.getMinutes() + 15);
                                  return now.toISOString().slice(0, 16);
                                })()}
                                onChange={(e)=>setScheduledTime(e.target.value)}
                                className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl py-4 pl-12 pr-4 text-base font-semibold focus:border-[#d99133] outline-none text-white"
                              />
                            </div>
                            <p className="text-xs text-neutral-400 mt-2 text-center">O elige una fecha y hora personalizada</p>
                          </div>
                        )}
                        
                        {pickupTime==='now' && (
                          <div className="bg-[#d99133]/10 border-2 border-[#d99133]/30 rounded-xl p-4 text-sm text-[#d99133] font-semibold flex gap-3 items-center animate-in fade-in">
                            <Clock size={18} /> Prepararemos tu pedido en aprox. 15-20 minutos
                          </div>
                        )}
                        
                        <a
                          href={restaurantInfo.contact.googleMapsLink}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full min-h-[56px] bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-colors border-2 border-neutral-700"
                        >
                          <Navigation size={18} /> Ver ubicación del local
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Paso 3: Pago */}
                  <div className="bg-neutral-800/60 rounded-2xl border-2 border-neutral-700 p-6 space-y-5 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-[#d99133] flex items-center gap-2"><CreditCard size={20} /> Paso 3 · Pago</h3>
                      <span className="text-xs px-3 py-1.5 bg-neutral-700 rounded-full font-semibold">Paso 3</span>
                    </div>
                    <div className="grid gap-5">
                      {orderType==='delivery' && (
                        <div className="bg-yellow-600/10 border-2 border-yellow-600/30 rounded-xl p-3 text-xs text-yellow-200 font-semibold">
                          Para delivery: paga con <span className="font-bold">Yape</span> o <span className="font-bold">Plin</span>.
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          {id: 'efectivo', label: 'Efectivo', icon: Banknote},
                          {id: 'yape', label: 'Yape', icon: Smartphone},
                          {id: 'plin', label: 'Plin', icon: Smartphone},
                        ].map(m => {
                          const isCashDisabled = orderType==='delivery' && m.id==='efectivo';
                          const disabled = m.disabled || isCashDisabled;
                          const isActive = paymentMethod===m.id && !disabled;
                          return (
                            <button
                              type="button"
                              key={m.id}
                              onClick={() => { if (!disabled) setPaymentMethod(m.id); }}
                              disabled={disabled}
                              aria-disabled={disabled ? 'true' : 'false'}
                              className={`min-h-[96px] rounded-2xl text-base font-bold border-2 flex flex-col items-center justify-center gap-2 px-4 text-center transition-all ${isActive ? 'bg-[#d99133] text-black border-[#d99133] shadow-lg' : 'bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <span className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-black/10 text-black' : 'bg-neutral-900 text-white border border-neutral-700'}`}>
                                <m.icon size={22} />
                              </span>
                              <span>{m.label}</span>
                              {isCashDisabled && <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">No disponible en delivery</span>}
                            </button>
                          );
                        })}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Instrucciones especiales (Opcional)</label>
                        <textarea
                          value={notes}
                          onChange={(e)=>setNotes(e.target.value)}
                          rows={3}
                          placeholder="Ej: Sin cebolla, sin mayonesa, entregar en portería..."
                          className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-base focus:border-[#d99133] outline-none resize-none text-white placeholder:text-neutral-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t-2 border-neutral-800 bg-neutral-900">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full mb-4 min-h-[48px] bg-red-600/20 hover:bg-red-600/30 border-2 border-red-600/40 hover:border-red-500 text-red-400 hover:text-red-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                >
                  <Trash2 size={18} />
                  Vaciar carrito
                </button>
              )}
              <div className="flex justify-between items-center mb-5 text-xl font-bold">
                <span className="text-white">Total</span>
                <span className="text-[#d99133] text-3xl">S/ {total.toFixed(2)}</span>
              </div>
              <button
                onClick={sendOrderToWhatsapp}
                disabled={cart.length === 0}
                className="w-full min-h-[68px] bg-green-600 hover:bg-green-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-green-900/30 active:scale-[0.98]"
              >
                <Send size={22} />
                  ENVIAR PEDIDO POR WHATSAPP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Mejorado */}
      <footer className="mt-auto bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-t-2 border-[#d99133]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Sección principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
            {/* Sobre nosotros */}
            <div className="space-y-5 lg:col-span-1">
              <div>
                <img 
                  src="/images/bigjacklogotipo.webp" 
                  alt={restaurantInfo.name} 
                  className="h-16 w-auto object-contain mb-4 drop-shadow-[0_0_15px_rgba(217,145,51,0.2)]" 
                />
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {restaurantInfo.slogan}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-600 font-bold mb-3">Síguenos</p>
                <div className="flex gap-3">
                  <a
                    href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 bg-green-600/20 border border-green-600/40 hover:bg-green-600 hover:border-green-500 rounded-xl flex items-center justify-center transition-all group"
                    title="WhatsApp"
                  >
                    <MessageCircle size={20} className="text-green-400 group-hover:text-white transition-colors" />
                  </a>
                  <a
                    href={`https://instagram.com/${restaurantInfo.contact.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 bg-pink-600/20 border border-pink-600/40 hover:bg-pink-600 hover:border-pink-500 rounded-xl flex items-center justify-center transition-all group"
                    title="Instagram"
                  >
                    <Instagram size={20} className="text-pink-400 group-hover:text-white transition-colors" />
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
                  <MapPin size={18} className="text-[#d99133]" /> Ubicación
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
                  <Clock size={18} className="text-[#d99133]" /> Horarios
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
                        <span className="text-[#d99133] font-bold">4:00 PM - 1:00 AM</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold transition-all active:scale-95"
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
                  <Clipboard size={18} className="text-[#d99133]" /> Legal
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
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#d99133] hover:bg-[#c07e2b] text-black rounded-xl font-bold transition-all shadow-xl shadow-[#d99133]/20 active:scale-95 w-full justify-center"
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
              <p className="text-neutral-500 text-center md:text-left">
                © {new Date().getFullYear()} <span className="font-bold text-neutral-400">{restaurantInfo.name}</span>. Todos los derechos reservados.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                <Link
                  href="/links"
                  className="text-xs text-[#d99133] hover:text-[#c07e2b] transition-colors font-bold underline"
                >
                  🔗 Todos nuestros enlaces
                </Link>
                <Link
                  href="/quienes"
                  className="text-xs text-neutral-400 hover:text-[#d99133] transition-colors font-semibold"
                >
                  Quienes somos
                </Link>
                <a
                  href="#menu-section"
                  className="text-xs text-neutral-400 hover:text-[#d99133] transition-colors font-semibold"
                >
                  Volver al menú
                </a>
                <p className="text-xs flex items-center gap-2 text-neutral-500">
                  Desarrollado con <Sparkles size={14} className="text-[#d99133]" /> en Perú
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mini ventana de sugerencia para complementos - CON CANTIDADES */}
      {suggestionVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-[#d99133]/30 rounded-3xl shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-y-auto">
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
              {/* Papas con cantidad */}
              {suggestedGuarn && (
                <div className="bg-neutral-800/50 border-2 border-neutral-700 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#d99133]/10 rounded-xl flex items-center justify-center text-3xl">
                      🍟
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-base">Papas Fritas</p>
                      <p className="text-neutral-400 text-xs mt-0.5">Crujientes y doradas · S/ {suggestedGuarn.options?.[0]?.price?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-neutral-400">Cantidad:</span>
                    <div className="flex items-center gap-3 bg-neutral-900 rounded-xl p-1.5 border border-neutral-700">
                      <button 
                        onClick={() => changeSuggestedQty('papas', -1)}
                        disabled={suggestedPapasQty === 0}
                        className="w-8 h-8 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-lg font-bold w-8 text-center">{suggestedPapasQty}</span>
                      <button 
                        onClick={() => changeSuggestedQty('papas', 1)}
                        disabled={suggestedPapasQty >= 10}
                        className="w-8 h-8 flex items-center justify-center bg-[#d99133] hover:bg-[#c07e2b] disabled:opacity-30 disabled:cursor-not-allowed text-black rounded transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  {suggestedPapasQty > 0 && (
                    <div className="text-right text-xs text-[#d99133] font-bold">
                      Subtotal: S/ {(suggestedGuarn.options?.[0]?.price * suggestedPapasQty).toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {/* Bebidas con cantidades separadas */}
              <div className="space-y-3">
                <p className="text-sm text-neutral-300 font-semibold">Bebidas:</p>
                
                {/* Inka Cola */}
                {suggestedInka && (
                  <div className="bg-neutral-800/50 border-2 border-neutral-700 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-3xl">
                        🟡
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-base">Inka Cola</p>
                        <p className="text-neutral-400 text-xs mt-0.5">500ml helada · S/ {suggestedInka.options?.[0]?.price?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-neutral-400">Cantidad:</span>
                      <div className="flex items-center gap-3 bg-neutral-900 rounded-xl p-1.5 border border-neutral-700">
                        <button 
                          onClick={() => changeSuggestedQty('inka', -1)}
                          disabled={suggestedInkaQty === 0}
                          className="w-8 h-8 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-lg font-bold w-8 text-center">{suggestedInkaQty}</span>
                        <button 
                          onClick={() => changeSuggestedQty('inka', 1)}
                          disabled={suggestedInkaQty >= 10}
                          className="w-8 h-8 flex items-center justify-center bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed text-black rounded transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    {suggestedInkaQty > 0 && (
                      <div className="text-right text-xs text-yellow-500 font-bold">
                        Subtotal: S/ {(suggestedInka.options?.[0]?.price * suggestedInkaQty).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {/* Coca Cola */}
                {suggestedCoca && (
                  <div className="bg-neutral-800/50 border-2 border-neutral-700 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-3xl">
                        🔴
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-base">Coca Cola</p>
                        <p className="text-neutral-400 text-xs mt-0.5">500ml helada · S/ {suggestedCoca.options?.[0]?.price?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-neutral-400">Cantidad:</span>
                      <div className="flex items-center gap-3 bg-neutral-900 rounded-xl p-1.5 border border-neutral-700">
                        <button 
                          onClick={() => changeSuggestedQty('coca', -1)}
                          disabled={suggestedCocaQty === 0}
                          className="w-8 h-8 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-lg font-bold w-8 text-center">{suggestedCocaQty}</span>
                        <button 
                          onClick={() => changeSuggestedQty('coca', 1)}
                          disabled={suggestedCocaQty >= 10}
                          className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    {suggestedCocaQty > 0 && (
                      <div className="text-right text-xs text-red-500 font-bold">
                        Subtotal: S/ {(suggestedCoca.options?.[0]?.price * suggestedCocaQty).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gradient-to-t from-neutral-950 to-neutral-950/95 backdrop-blur-sm p-5 pt-4 border-t border-neutral-800 rounded-b-3xl space-y-3">
              {(suggestedPapasQty > 0 || suggestedInkaQty > 0 || suggestedCocaQty > 0) && (
                <div className="bg-[#d99133]/10 border border-[#d99133]/30 rounded-xl p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-300">Total complementos:</span>
                    <span className="text-[#d99133] font-black text-xl">
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
                    ? 'bg-gradient-to-r from-[#d99133] to-[#b07020] hover:from-[#eeb055] hover:to-[#d99133] text-black active:scale-[0.98]'
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
            className="w-full rounded-2xl bg-gradient-to-r from-[#d99133] via-[#eeb055] to-[#d99133] text-black font-black px-5 py-4 shadow-2xl shadow-[#d99133]/40 flex items-center justify-between gap-4 active:scale-[0.99]"
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
          className="lg:hidden fixed bottom-6 right-6 z-40 p-4 bg-[#d99133] text-black rounded-full hover:bg-[#c07e2b] transition-all shadow-2xl shadow-[#d99133]/40 active:scale-95"
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

