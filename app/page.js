"use client";
import Head from "next/head";
import Link from "next/link";
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
  PhoneCall,
  Instagram,
  Music2,
  MessageCircle,
  Clipboard,
  Check,
} from "lucide-react";
import { Suspense } from "react";
import { isOpenNow, getNextOpenDate, formatMsToCountdown } from "./lib/openHours";
import ClientSearchParams from "./components/ClientSearchParams";
import SecureMap from "./components/SecureMap";

const PRIMARY_CATEGORIES = ["LAS INTOCABLES"];
const COMPLEMENT_CATEGORIES = ["GUARNICION", "BEBIDAS"];

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
  const [selectedSuggestions, setSelectedSuggestions] = useState({ papas: false, bebida: false });
  const [selectedDrink, setSelectedDrink] = useState(null); // 'inka' | 'coca' | null
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
  const deliveryAvailable = false;
  const PEDIDOSYA_LINK = "https://www.pedidosya.com.pe/restaurantes/lima/big-jack-0c79d59d-90de-48bd-aa0d-3a5277f7da49-menu?origin=shop_list";
  const fastTrackHighlights = [
    {
      title: "Explora visualmente",
      desc: "Fotos reales con precios y diferencias simple/doble claras.",
    },
    {
      title: "Acciones accesibles",
      desc: "Botones amplios y navegación pensada para uso con una mano.",
    },
    {
      title: "Resumen inmediato",
      desc: "Carrito compacto y resumen listo para WhatsApp en segundos.",
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
    // Mostrar ventana de sugerencias para agregar complementos (papas / bebida)
    setSuggestionFor({ productId: product.id, uniqueId });
    if (showSuggestion) setSuggestionVisible(true);
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
  const toggleSuggestion = (type) => {
    setSelectedSuggestions(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    // Si deselecciona bebida, limpiar elección de tipo
    if (type === 'bebida' && selectedSuggestions.bebida) {
      setSelectedDrink(null);
    }
  };

  const handleConfirmSuggestions = () => {
    // Agregar papas si fue seleccionada
    if (selectedSuggestions.papas && suggestedGuarn) {
      const option = suggestedGuarn.options?.[0];
      if (option) addToCart(suggestedGuarn, option, false);
    }
    
    // Agregar bebida según elección
    if (selectedSuggestions.bebida && selectedDrink) {
      const drinkProduct = selectedDrink === 'inka' ? suggestedInka : suggestedCoca;
      if (drinkProduct) {
        const option = drinkProduct.options?.[0];
        if (option) addToCart(drinkProduct, option, false);
      }
    }
    
    // Resetear y cerrar
    setSelectedSuggestions({ papas: false, bebida: false });
    setSelectedDrink(null);
    setSuggestionVisible(false);
    setTimeout(() => setIsCartOpen(true), 300);
  };

  const handleCloseSuggestion = () => {
    setSelectedSuggestions({ papas: false, bebida: false });
    setSelectedDrink(null);
    setSuggestionVisible(false);
  };

  const handleSkipSuggestion = () => {
    setSelectedSuggestions({ papas: false, bebida: false });
    setSelectedDrink(null);
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
        alert("¡Ubicación obtenida! Se enviará junto con tu pedido.");
      },
      () => {
        alert("No pudimos obtener tu ubicación. Por favor escribe tu dirección.");
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

    if (isPreOrder) {
      const nextOpenDate = getNextOpenDate(new Date());
      const countdown = nextOpenMs ? formatMsToCountdown(nextOpenMs) : null;
      const when = nextOpenDate
        ? nextOpenDate.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })
        : "la próxima apertura";
      sections.push([
        "*⚠ PRE-ORDEN (solo recojo)*",
        `_Se procesa al abrir: ${when}${countdown ? ` (en ${countdown})` : ""}_`
      ].join("\n"));
    }

    sections.push("*📋 PEDIDO BIG JACK*");

    const basics = [`*Cliente:* ${customerName}`, `*Modalidad:* ${orderType === "delivery" ? "Delivery" : "Recojo en tienda"}`];

    if (orderType === "delivery") {
      const deliveryLines = [
        `• Dirección: ${deliveryAddress || "Ubicación compartida"}`,
        deliveryReference ? `• Referencia: ${deliveryReference}` : null,
        locationLink ? `• Mapa: ${locationLink}` : null,
      ].filter(Boolean);
      basics.push(`*📦 Delivery:*
${deliveryLines.join("\n")}`);
    } else {
      if (isPreOrder) {
        const nextOpenDate = getNextOpenDate(new Date());
        const when = nextOpenDate
          ? nextOpenDate.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })
          : "nuestra próxima apertura";
        basics.push(`*⏰ Recojo:* PRE-ORDEN — disponible desde ${when}`);
      } else {
        basics.push(
          `*⏰ Recojo:* ${
            pickupTime === "now" ? "Inmediato (15-20 min)" : `Programado: ${formatScheduledPickup()}`
          }`
        );
      }
    }

    sections.push(basics.join("\n"));

    const itemsSection = ["*🍔 Pedido:*"].concat(
      cart.map((item, index) => `• ${item.quantity}x ${item.name} (${item.optionLabel}) — S/ ${(item.price * item.quantity).toFixed(2)}`)
    );
    sections.push(itemsSection.join("\n"));

    const totals = [`*💰 Total:* S/ ${total.toFixed(2)}`, `*💳 Pago:* ${paymentMethod.toUpperCase()}`];
    if (notes.trim()) totals.push(`*📝 Notas:* _${notes.trim()}_`);
    sections.push(totals.join("\n"));

    sections.push("Gracias por pedir en *Big Jack*! 🧡");

    const message = sections.join("\n\n");

    // Normalizar espacios alrededor de marcadores de formato para WhatsApp
    let normalized = message
      .replace(/\*\s+([^*]+?)\s+\*/g, "*$1*")
      .replace(/_\s+([^_]+?)\s+_/g, "_$1_");

    const url = `https://wa.me/${restaurantInfo.contact.whatsapp}?text=${encodeURIComponent(normalized)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white font-sans overflow-x-hidden">
      <Head>
        <title>{restaurantInfo.name} | Menú Digital</title>
        <meta name="description" content={`${restaurantInfo.slogan} — Pide online o recoge en tienda. ${restaurantInfo.contact.address}`} />
        <link rel="canonical" href={restaurantInfo.contact.googleMapsLink} />
        <meta property="og:title" content={`${restaurantInfo.name} - Menú`} />
        <meta property="og:description" content={restaurantInfo.slogan} />
        <meta property="og:type" content="restaurant" />
        <meta property="og:url" content={restaurantInfo.contact.googleMapsLink} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "@id": "https://bigjack.vercel.app",
          name: restaurantInfo.name,
          description: restaurantInfo.slogan,
          image: [
            "/images/baconjack.webp",
            "/images/royaljack.webp",
            "/images/grilljack.webp"
          ],
          logo: restaurantInfo.logo,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Jirón Bartolomé Herrera 133",
            addressLocality: "Lince",
            addressRegion: "Lima",
            addressCountry: "PE",
            postalCode: "15046"
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: "-12.081387",
            longitude: "-77.038263"
          },
          telephone: `+${restaurantInfo.contact.whatsapp}`,
          url: "https://bigjack.vercel.app",
          sameAs: [
            `https://instagram.com/${restaurantInfo.contact.instagram.replace('@', '')}`,
            restaurantInfo.contact.tiktok,
            `https://wa.me/${restaurantInfo.contact.whatsapp}`
          ],
          priceRange: "S/ 14 - S/ 24",
          servesCuisine: ["Hamburguesas", "Fast Food", "Comida Americana"],
          acceptsReservations: false,
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
              opens: "16:00",
              closes: "23:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Friday", "Saturday", "Sunday"],
              opens: "12:00",
              closes: "23:00"
            }
          ],
          paymentAccepted: ["Efectivo", "Yape", "Plin"],
          currenciesAccepted: "PEN",
          hasMenu: {
            "@type": "Menu",
            hasMenuSection: menuItems.slice(0, 4).map(item => ({
              "@type": "MenuSection",
              name: item.name,
              description: item.description,
              offers: {
                "@type": "Offer",
                price: item.options?.[0]?.price || item.price,
                priceCurrency: "PEN"
              }
            }))
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "127",
            bestRating: "5",
            worstRating: "1"
          }
        }) }} />
      </Head>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 backdrop-blur-md border-b-2 border-yellow-500/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo y título */}
            <div className="flex-1">
              <Link href="/" className="block">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-yellow-500 hover:text-yellow-400 transition-colors">
                  {restaurantInfo.name}
                </h1>
                <p className="text-xs text-neutral-400 hidden sm:block mt-0.5">{restaurantInfo.slogan}</p>
              </Link>
            </div>

            {/* Info rápida - Solo desktop */}
            <div className="hidden lg:flex items-center gap-6 mx-6">
              <div className="flex items-center gap-2 text-xs">
                <Clock size={16} className="text-yellow-500" />
                <div>
                  <p className="text-neutral-400">Lun-Jue: 4-11PM</p>
                  <p className="text-neutral-300 font-semibold">Vie-Dom: 12-11PM</p>
                </div>
              </div>
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
              className="relative p-3 bg-yellow-500 text-black rounded-2xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
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

      {/* HERO EXPERIENCE */}
      <section className="relative overflow-hidden border-b border-neutral-800 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-900">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(215,61,29,0.4),_transparent_60%)]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 grid gap-10 md:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-yellow-400 uppercase">
              <Sparkles size={14} /> Pre-orden digital
            </span>
            <h2 className="text-4xl md:text-5xl font-black leading-tight text-white">
              Menu exprés para <span className="text-yellow-500">pedir por WhatsApp</span> sin colas.
            </h2>
            <p className="text-neutral-300 text-lg">
              Elige tus burgers antes de llegar, envía el pedido a WhatsApp y nosotros lo vamos preparando. Pensado para oficinas, universitarios y riders que quieren todo rápido.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <button
                onClick={scrollToMenu}
                className="px-5 py-3 rounded-full bg-yellow-500 text-black font-bold flex items-center gap-2 shadow-lg shadow-yellow-900/50 w-full sm:w-auto justify-center"
              >
                <Send size={18} /> Ver y pedir
              </button>
              <button
                onClick={scrollToMenu}
                className="px-5 py-3 rounded-full border border-neutral-700 text-white/80 hover:text-white hover:border-yellow-500 transition w-full sm:w-auto justify-center flex items-center gap-2"
              >
                Ver menú completo
              </button>
            </div>
            <div className="sm:hidden space-y-3" aria-label="Redes sociales Big Jack">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Conecta y comparte</p>
              <div className="grid gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full rounded-2xl border px-4 py-3 flex items-center justify-between ${link.accent}`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{link.label}</p>
                      <p className="text-[11px] uppercase tracking-[0.3em] opacity-70">{link.description}</p>
                    </div>
                    <link.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[{
                label: "Listo en",
                value: "15 min",
                sub: "si recoges"
              }, {
                label: "Pedidos felices",
                value: "¡Nuevo!",
                sub: "Apertura reciente"
              }, {
                label: "Promo activa",
                value: "TikTok",
                sub: "Historias diarias"
              }].map((stat) => (
                <div key={stat.label} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 text-center">
                  <p className="text-xs uppercase text-neutral-500 tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-neutral-400">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[32px] border border-neutral-800 bg-neutral-900/70 p-5 shadow-2xl shadow-yellow-900/40 backdrop-blur">
              <div className="text-xs uppercase text-yellow-400 font-bold flex items-center gap-2 mb-3">
                <Flame size={16} /> Destacado del día
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-800 mb-4">
                {heroHighlight ? (
                  <img
                    src={heroHighlight.image}
                    alt={heroHighlight.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/600x400/222/yellow?text=BIG+JACK";
                    }}
                  />
                ) : (
                  <div className="w-full h-full grid place-content-center text-neutral-600">Pronto nuevas fotos</div>
                )}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-[0.3em]">{heroHighlight?.category || "Burger"}</p>
                  <h3 className="text-2xl font-black text-white">{heroHighlight?.name || restaurantInfo.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-neutral-500 uppercase">Desde</p>
                  <p className="text-3xl font-black text-yellow-500">S/ {heroPriceRange[0].toFixed(2)}</p>
                  <p className="text-xs text-neutral-500">hasta S/ {heroPriceRange[1].toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 w-64 bg-neutral-900/95 border border-neutral-800 rounded-2xl p-4 text-sm shadow-xl shadow-black/40 hidden md:flex md:flex-col gap-2" aria-label="Redes sociales">
              <p className="font-semibold text-white flex items-center gap-2">
                <PhoneCall size={16} /> Sigue el fuego
              </p>
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-xl border px-3 py-2 flex items-center justify-between ${link.accent}`}
                >
                  <div>
                    <p className="text-sm font-semibold">{link.label}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">{link.description}</p>
                  </div>
                  <link.icon size={18} />
                </a>
              ))}
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
              <button onClick={() => { window.location.href = '/libro-de-reclamaciones'; }} className="px-4 py-3 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold">Libro de Reclamaciones</button>
            </div>
          </div>
        </div>
      )}

      {/* FAST TRACK */}
      <section className="max-w-6xl mx-auto px-4 py-6 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fastTrackHighlights.map((feature) => (
            <div
              key={feature.title}
              className="border border-neutral-800 rounded-2xl bg-neutral-900/60 p-4 hover:border-yellow-500/60 transition"
            >
              <p className="text-[11px] text-yellow-500 font-bold tracking-[0.3em] mb-2">FAST TRACK</p>
              <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ENCUÉNTRANOS (MAPA) */}
      <section className="bg-neutral-900 px-4 py-6 border-b border-neutral-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div className="w-full rounded-xl overflow-hidden border border-neutral-800">
            <div className="w-full h-56 md:h-64">
              <SecureMap />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-1">Visítanos</p>
            <h3 className="text-2xl font-bold text-white mb-2">Encuéntranos en Lince</h3>
            <p className="text-neutral-400 mb-4">{restaurantInfo.contact.address}</p>
            <div className="flex gap-2 flex-wrap">
              <a href={restaurantInfo.contact.googleMapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg">Abrir en Google Maps</a>
              <a href={`https://wa.me/${restaurantInfo.contact.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-neutral-900 text-white border border-neutral-700 px-4 py-2 rounded-lg">Pedir por WhatsApp</a>
              <a href={PEDIDOSYA_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">Pedir por PedidosYa</a>
            </div>
            <p className="text-xs text-neutral-500 mt-3">Comparte este mapa al pedir delivery o úsalo como guía si vienes a recoger.</p>
          </div>
        </div>
      </section>

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
                  className={`min-h-[48px] px-6 py-3 rounded-2xl text-sm font-black tracking-wide transition-all border-2 whitespace-nowrap active:scale-95 ${
                    isActive
                      ? "bg-yellow-500 text-black border-yellow-500 shadow-xl shadow-yellow-500/30"
                      : "bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-yellow-500/60 hover:bg-neutral-800"
                  }`}
                >
                  {cat === "TODOS" ? "🍔 TODO" : cat}
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
            <p className="text-xs uppercase tracking-widest text-yellow-500 font-bold">Estás viendo</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">{selectedCategory === "TODOS" ? "Menú Completo" : selectedCategory}</h2>
            <p className="text-sm text-neutral-400">{filteredItems.length} {filteredItems.length === 1 ? 'producto disponible' : 'productos disponibles'}</p>
          </div>
          <div className="bg-neutral-900/80 border-2 border-neutral-800 rounded-2xl p-4 max-w-md">
                <p className="text-xs text-neutral-400 leading-relaxed flex items-start gap-2">
              <Sparkles size={16} className="text-yellow-500" />
              <span><span className="font-semibold text-white">Tip:</span> Toca cualquier imagen para ver detalles completos o usa los botones para añadir rápido al carrito.</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isComplement = COMPLEMENT_CATEGORIES.includes(item.category);
            const isPrimary = PRIMARY_CATEGORIES.includes(item.category);
            const complementBlocked = isComplement && !hasPrimaryProduct;
            const optionsToRender = item.options?.length
              ? item.options
              : [{ id: "regular", label: "Regular", price: item.price || 0 }];
            const basePrice = optionsToRender.reduce((min, opt) => Math.min(min, opt.price), optionsToRender[0].price);
            return (
              <div key={item.id} className="border border-neutral-800 rounded-[28px] bg-gradient-to-b from-neutral-900 to-neutral-950 hover:border-yellow-500/60 transition-transform duration-300 hover:-translate-y-1">
                <Link href={`/product/${item.slug}`} className="relative h-56 block overflow-hidden rounded-t-[28px] border-b border-neutral-800 bg-neutral-800 cursor-pointer group">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400/222/yellow?text=BIG+JACK";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500">Pronto imagen</div>
                  )}
                  {item.popular && (
                    <span className="absolute top-4 left-4 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full shadow-lg">
                      HIT
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-sm bg-yellow-500 text-black px-4 py-2 rounded-full">
                      Ver detalles
                    </span>
                  </div>
                </Link>
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-yellow-500">{item.category}</p>
                      <h3 className="text-2xl font-bold text-white leading-tight">{item.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-neutral-500 uppercase">Desde</p>
                      <p className="text-xl font-black text-yellow-500">S/ {basePrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">{item.description}</p>
                  <div className="grid gap-3">
                    {isPrimary ? (
                      <>
                        <button
                          onClick={() => openProductModal(item)}
                          className="w-full min-h-[56px] rounded-2xl border-2 border-yellow-500/70 bg-yellow-500/10 text-white px-5 py-4 text-base font-bold hover:bg-yellow-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={20} />
                          Personalizar y añadir
                        </button>
                        <div className="text-xs text-neutral-500">
                          {optionsToRender.map((option) => (
                            <span key={option.id} className="inline-flex items-center gap-1 mr-3">
                              <span className="text-neutral-400">{option.label}:</span>
                              <span className="text-yellow-400 font-semibold">S/ {option.price.toFixed(2)}</span>
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        {optionsToRender.map((option) => {
                          const isRecent = recentlyAdded === `${item.id}-${option.id}`;
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleAddProduct(item, option.id)}
                              disabled={complementBlocked}
                              className={`w-full min-h-[60px] rounded-2xl border-2 px-5 py-4 text-left bg-neutral-900/70 transition-all flex flex-col gap-2 active:scale-95 ${
                                isRecent
                                  ? "border-green-400/80 bg-green-500/10 shadow-lg shadow-green-900/40"
                                  : "border-neutral-800 hover:border-yellow-500/70 hover:bg-neutral-900"
                              } ${
                                complementBlocked ? "opacity-50 cursor-not-allowed hover:border-neutral-800 active:scale-100" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between text-base font-bold">
                                <span className="text-white">{option.label}</span>
                                <span className="text-yellow-400 text-lg">S/ {option.price.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-neutral-400">
                                <span className="flex items-center gap-2">
                                  {complementBlocked ? (
                                    <><AlertTriangle size={14} className="text-orange-400" /> <span>Requiere hamburguesa</span></>
                                  ) : isRecent ? (
                                    <><Check size={14} className="text-green-400" /> <span>Agregado</span></>
                                  ) : (
                                    <><Plus size={14} /> <span>Añadir al carrito</span></>
                                  )}
                                </span>
                                {!complementBlocked && <Plus size={16} className={isRecent ? "text-green-400" : ""} />}
                              </div>
                            </button>
                          );
                        })}
                        {complementBlocked && (
                          <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-xl p-3 text-center">
                            <p className="text-xs sm:text-sm text-orange-300 font-semibold flex items-center justify-center gap-2">
                              <ShoppingCart size={14} /> Agrega una hamburguesa primero para habilitar complementos
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

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
                <p className="text-[11px] uppercase tracking-[0.3em] text-yellow-500 mb-1">{modalProduct.category}</p>
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
                          ? "border-yellow-500 bg-yellow-500/10 text-white shadow-lg shadow-yellow-500/20"
                          : "border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:border-yellow-500/50 hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold">{option.label}</p>
                          <p className="text-xs text-neutral-400">Ideal para {option.label.toLowerCase()}</p>
                        </div>
                        <span className="text-yellow-400 font-black text-xl">S/ {option.price.toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="bg-neutral-950 border-2 border-neutral-800 rounded-2xl p-5 flex items-center justify-between">
                <span className="text-neutral-400 font-semibold">Subtotal</span>
                <span className="text-2xl font-black text-yellow-500">
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
                  className="min-h-[56px] rounded-2xl bg-yellow-500 text-black font-black disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2"
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
              <h2 className="text-xl font-black flex items-center gap-2">
                <ShoppingCart className="text-yellow-500" />
                TU PEDIDO
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent p-5 space-y-6">
              {/* LISTA DE ITEMS */}
              {cart.length === 0 ? (
                <div className="text-center py-10 text-neutral-500">
                  <p className="text-lg mb-2 font-semibold text-white">Tu carrito está vacío.</p>
                  <p className="text-sm text-neutral-400">Selecciona un producto para comenzar tu pedido.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-neutral-800/50 p-3 rounded-lg border border-neutral-800">
                      <div className="w-16 h-16 bg-neutral-700 rounded-md overflow-hidden flex-shrink-0">
                         <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {e.target.src = "https://placehold.co/100x100/222/yellow?text=BJ"}}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">{item.name}</h4>
                        <p className="text-xs text-neutral-500 mb-1">{item.optionLabel}</p>
                        <p className="text-yellow-500 font-bold text-sm">S/ {(item.price * item.quantity).toFixed(2)}</p>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center bg-neutral-700 rounded hover:bg-neutral-600"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center bg-neutral-700 rounded hover:bg-neutral-600"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-500 hover:text-red-500 self-start p-1"
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
                      <h3 className="text-lg font-bold text-yellow-500 flex items-center gap-2"><User size={20} /> Tus datos</h3>
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
                            className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-2xl py-4 pl-12 pr-4 text-base focus:border-yellow-500 outline-none transition-colors text-white placeholder:text-neutral-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-3">¿Cómo recibes tu pedido?</label>
                        <div className="grid grid-cols-1 gap-3">
                          <button
                            type="button"
                            onClick={()=>handleSelectOrderType("pickup")}
                            className={`min-h-[70px] rounded-2xl text-base font-bold border-2 flex items-center justify-center gap-3 transition-all ${orderType==='pickup'? 'bg-yellow-500 text-black border-yellow-500 shadow-lg':'bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500'}`}
                          >
                            <Clock size={24} />
                            Recojo en local (15-20 min)
                          </button>
                          <button
                            type="button"
                            onClick={()=>handleSelectOrderType("delivery")}
                            className={`min-h-[70px] rounded-2xl text-base font-bold border-2 flex items-center justify-center gap-3 transition-all ${deliveryAvailable && orderType==='delivery'? 'bg-yellow-500 text-black border-yellow-500 shadow-lg':'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-500'}`}
                          >
                            <MapPin size={24} />
                            Delivery
                            {!deliveryAvailable && <span className="text-xs text-neutral-400 ml-2">(por PedidosYa)</span>}
                          </button>
                        </div>
                        {!deliveryAvailable && (
                          <p className="text-[11px] text-neutral-400 mt-2">Para pedidos a domicilio serás redirigido a PedidosYa.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Paso 2: Condicional según tipo */}
                  <div className="bg-neutral-800/60 rounded-2xl border-2 border-neutral-700 p-6 space-y-5 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
                        {orderType==='delivery' ? <MapPin size={20} /> : <Clock size={20} />} 
                        {orderType==='delivery' ? 'Información de entrega' : 'Horario de recojo'}
                      </h3>
                      <span className="text-xs px-3 py-1.5 bg-neutral-700 rounded-full font-semibold">Paso 2</span>
                    </div>
                    
                    {orderType==='delivery' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-white mb-2">Dirección de entrega</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                            <input
                              value={deliveryAddress}
                              onChange={(e)=>setDeliveryAddress(e.target.value)}
                              placeholder="Calle / Av. y número"
                              className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl py-4 pl-12 pr-4 text-base focus:border-yellow-500 outline-none transition-colors text-white placeholder:text-neutral-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-white mb-2">Referencia adicional</label>
                          <div className="relative">
                            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                            <input
                              value={deliveryReference}
                              onChange={(e)=>setDeliveryReference(e.target.value)}
                              placeholder="Ej: Frente al parque principal"
                              className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl py-4 pl-12 pr-4 text-base focus:border-yellow-500 outline-none transition-colors text-white placeholder:text-neutral-500"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <button 
                            type="button"
                            onClick={getUserLocation} 
                            className={`w-full min-h-[56px] rounded-xl text-base font-bold border-2 flex items-center justify-center gap-2 transition-all ${locationLink ? 'bg-green-600/20 border-green-600 text-green-400' : 'bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600/30'}`}>
                            <MapPin size={20} /> {locationLink ? 'Ubicación guardada ✓' : 'Compartir mi ubicación actual'}
                          </button>
                          {locationLink && <p className="text-xs text-green-500 text-center font-semibold">Tu ubicación se incluirá en el pedido.</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-3">¿Cuándo lo recoges?</label>
                        {!isOpen && isPreOrder ? (
                          <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-4 mb-3">
                            <p className="text-yellow-400 text-sm font-semibold flex items-center gap-2">
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
                                    ? 'bg-yellow-500 text-black border-yellow-500'
                                    : 'bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500'
                              }`}
                              >
                                <Clock size={20} />
                                Ahora mismo (15-20 min)
                              </button>
                              <button
                                type="button"
                                onClick={()=>setPickupTime("schedule")}
                                className={`min-h-[60px] px-4 rounded-2xl text-base font-bold border-2 flex items-center justify-center gap-3 transition-all ${pickupTime==='schedule'? 'bg-yellow-500 text-black border-yellow-500':'bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500'}`}
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
                                    className={`min-h-[56px] rounded-xl text-sm font-bold border-2 transition-all ${scheduledTime===slot.value ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500'}`}
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
                                className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl py-4 pl-12 pr-4 text-base font-semibold focus:border-yellow-500 outline-none text-white"
                              />
                            </div>
                            <p className="text-xs text-neutral-400 mt-2 text-center">O elige una fecha y hora personalizada</p>
                          </div>
                        )}
                        
                        {pickupTime==='now' && (
                          <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-400 font-semibold flex gap-3 items-center animate-in fade-in">
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

                  {/* Paso 3: Pago y Notas */}
                  <div className="bg-neutral-800/60 rounded-2xl border-2 border-neutral-700 p-6 space-y-5 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-yellow-500 flex items-center gap-2"><CreditCard size={20} /> Método de pago</h3>
                      <span className="text-xs px-3 py-1.5 bg-neutral-700 rounded-full font-semibold">Paso 3</span>
                    </div>
                    <div className="grid gap-5">
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          {id: 'efectivo', label: 'Efectivo', icon: Banknote},
                          {id: 'yape', label: 'Yape', icon: Smartphone},
                          {id: 'plin', label: 'Plin', icon: Smartphone},
                          {id: 'tarjeta', label: 'Tarjeta', icon: CreditCard, disabled: true}
                        ].map(m => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => { if (!m.disabled) setPaymentMethod(m.id); }}
                            disabled={m.disabled}
                            title={m.disabled ? 'Próximamente' : undefined}
                            aria-disabled={m.disabled ? 'true' : 'false'}
                            className={`min-h-[64px] rounded-xl text-base font-bold border-2 flex items-center justify-center gap-3 transition-all ${paymentMethod===m.id ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500'} ${m.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <m.icon size={22} />
                            <div className="flex items-center gap-2">
                              <span>{m.label}</span>
                              {m.disabled && <span className="text-xs text-neutral-400 ml-1">(Próximamente)</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Instrucciones especiales (Opcional)</label>
                        <textarea
                          value={notes}
                          onChange={(e)=>setNotes(e.target.value)}
                          rows={3}
                          placeholder="Ej: Sin cebolla, sin mayonesa, entregar en portería..."
                          className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-base focus:border-yellow-500 outline-none resize-none text-white placeholder:text-neutral-500"
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
                <span className="text-yellow-500 text-3xl">S/ {total.toFixed(2)}</span>
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
      <footer className="mt-auto bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-t-2 border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Sección principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
            {/* Sobre nosotros */}
            <div className="space-y-5 lg:col-span-1">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-yellow-500 mb-2">{restaurantInfo.name}</h3>
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
                    className="w-11 h-11 bg-white/10 border border-white/30 hover:bg-white hover:border-white rounded-xl flex items-center justify-center transition-all group"
                    title="TikTok"
                  >
                    <Music2 size={20} className="text-white/80 group-hover:text-black transition-colors" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contacto y Ubicación */}
            <div className="space-y-5">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <MapPin size={18} className="text-yellow-500" /> Ubicación
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
                  <Clock size={18} className="text-yellow-500" /> Horarios
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Lun - Jue</span>
                        <span className="text-white font-semibold">4:00 PM - 11:00 PM</span>
                      </div>
                      <div className="border-t border-neutral-800 pt-2 flex justify-between items-center">
                        <span className="text-neutral-400">Vie - Dom</span>
                        <span className="text-yellow-500 font-bold">12:00 PM - 11:00 PM</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold transition-all active:scale-95"
                  >
                    <PhoneCall size={16} />
                    Llamar ahora
                  </a>
                </div>
              </div>
            </div>

            {/* Información Legal */}
            <div className="space-y-5">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <Clipboard size={18} className="text-yellow-500" /> Legal
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
                    className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition-all shadow-xl shadow-yellow-500/20 active:scale-95 w-full justify-center"
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
                <a
                  href="#menu-section"
                  className="text-xs text-neutral-400 hover:text-yellow-500 transition-colors font-semibold"
                >
                  Volver al menú
                </a>
                <p className="text-xs flex items-center gap-2 text-neutral-500">
                  Desarrollado con <Sparkles size={14} className="text-yellow-500" /> en Perú
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mini ventana de sugerencia para complementos - MEJORADA */}
      {suggestionVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-yellow-500/30 rounded-3xl shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-b from-neutral-900 to-neutral-900/95 backdrop-blur-sm p-5 pb-4 border-b border-neutral-800 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-black text-white text-xl flex items-center gap-2">
                    <span className="text-green-500 text-2xl">✓</span> ¡Agregado!
                  </p>
                  <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">Completa tu pedido con estos complementos</p>
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
              {/* Papas Option */}
              {suggestedGuarn && (
                <button
                  onClick={() => toggleSuggestion('papas')}
                  className={`w-full min-h-[80px] px-5 py-4 rounded-2xl font-semibold transition-all flex items-center gap-4 border-2 ${
                    selectedSuggestions.papas
                      ? 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20'
                      : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl ${
                    selectedSuggestions.papas ? 'bg-yellow-500/30' : 'bg-neutral-700'
                  }`}>
                    🍟
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-bold text-base">Papas Fritas</p>
                    <p className="text-neutral-400 text-xs mt-0.5">Crujientes y doradas</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-500 font-black text-lg">S/ {suggestedGuarn.options?.[0]?.price?.toFixed(2)}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedSuggestions.papas
                        ? 'bg-yellow-500 border-yellow-500'
                        : 'border-neutral-600'
                    }`}>
                      {selectedSuggestions.papas && <Check size={16} className="text-black font-bold" />}
                    </div>
                  </div>
                </button>
              )}

              {/* Bebida Option */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSuggestion('bebida')}
                  className={`w-full min-h-[80px] px-5 py-4 rounded-2xl font-semibold transition-all flex items-center gap-4 border-2 ${
                    selectedSuggestions.bebida
                      ? 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20'
                      : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl ${
                    selectedSuggestions.bebida ? 'bg-yellow-500/30' : 'bg-neutral-700'
                  }`}>
                    🥤
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-bold text-base">Bebida</p>
                    <p className="text-neutral-400 text-xs mt-0.5">Elige tu favorita</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-500 font-black text-lg">S/ 3.50</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedSuggestions.bebida
                        ? 'bg-yellow-500 border-yellow-500'
                        : 'border-neutral-600'
                    }`}>
                      {selectedSuggestions.bebida && <Check size={16} className="text-black font-bold" />}
                    </div>
                  </div>
                </button>

                {/* Drink Type Selection */}
                {selectedSuggestions.bebida && (
                  <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-xs text-neutral-400 font-semibold mb-2">¿Cuál prefieres?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestedInka && (
                        <button
                          onClick={() => setSelectedDrink('inka')}
                          className={`min-h-[70px] px-3 py-3 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-2 border-2 text-sm ${
                            selectedDrink === 'inka'
                              ? 'bg-yellow-600/30 border-yellow-600 text-white shadow-md'
                              : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                          }`}
                        >
                          <span className="text-2xl">🟡</span>
                          <span>Inka Cola</span>
                        </button>
                      )}
                      {suggestedCoca && (
                        <button
                          onClick={() => setSelectedDrink('coca')}
                          className={`min-h-[70px] px-3 py-3 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-2 border-2 text-sm ${
                            selectedDrink === 'coca'
                              ? 'bg-red-600/30 border-red-600 text-white shadow-md'
                              : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                          }`}
                        >
                          <span className="text-2xl">🔴</span>
                          <span>Coca Cola</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gradient-to-t from-neutral-950 to-neutral-950/95 backdrop-blur-sm p-5 pt-4 border-t border-neutral-800 rounded-b-3xl space-y-3">
              <button 
                onClick={handleConfirmSuggestions}
                disabled={selectedSuggestions.bebida && !selectedDrink}
                className={`w-full min-h-[60px] rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 shadow-lg ${
                  (selectedSuggestions.papas || (selectedSuggestions.bebida && selectedDrink))
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black active:scale-[0.98]'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={20} />
                {selectedSuggestions.papas || selectedSuggestions.bebida
                  ? `Agregar ${selectedSuggestions.papas && selectedSuggestions.bebida ? 'ambos' : selectedSuggestions.papas ? 'papas' : 'bebida'} al carrito`
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
            className="w-full rounded-2xl bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-400 text-black font-black px-5 py-4 shadow-2xl shadow-yellow-900/40 flex items-center justify-between gap-4 active:scale-[0.99]"
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
          className="lg:hidden fixed bottom-6 right-6 z-40 p-4 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 transition-all shadow-2xl shadow-yellow-500/40 active:scale-95"
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

