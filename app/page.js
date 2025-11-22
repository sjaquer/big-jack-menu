"use client";
import Head from "next/head";
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
  ClipboardList,
  RefreshCw,
} from "lucide-react";

export default function BigJackMenu() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [isCartOpen, setIsCartOpen] = useState(false);
  
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

  const scrollToMenu = () => {
    if (typeof document === "undefined") return;
    const el = document.getElementById("menu-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Calcular total memoizado
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  // Funciones del carrito
  const addToCart = (product, option) => {
    if (!option) return;
    const uniqueId = `${product.id}-${option.id || "default"}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === uniqueId);
      if (existing) {
        return prev.map((item) =>
          item.id === uniqueId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: uniqueId,
          productId: product.id,
          name: product.name,
          optionId: option.id,
          optionLabel: option.label,
          price: option.price,
          image: product.image,
          quantity: 1,
        },
      ];
    });
    setRecentlyAdded(uniqueId);
    setIsCartOpen(true);
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

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
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

  const clearCart = () => {
    setCart([]);
  };

  const copyCartSummary = () => {
    if (cart.length === 0) {
      alert("Agrega productos antes de copiar el resumen.");
      return;
    }
    const summary = [
      "Resumen Big Jack",
      ...cart.map((item) => `${item.quantity}x ${item.name} (${item.optionLabel}) - S/ ${(item.price * item.quantity).toFixed(2)}`),
      `Total: S/ ${total.toFixed(2)}`,
    ].join("\n");
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(summary)
        .then(() => alert("Resumen copiado al portapapeles."))
        .catch(() => alert(summary));
    } else {
      alert(summary);
    }
  };

  const resetCheckoutForm = () => {
    setCustomerName("");
    setOrderType("pickup");
    setDeliveryAddress("");
    setDeliveryReference("");
    setPickupTime("now");
    setScheduledTime("");
    setLocationLink("");
    setPaymentMethod("efectivo");
    setNotes("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("bj_checkout");
    }
  };

  const handleSelectOrderType = (type) => {
    if (type === "delivery" && !deliveryAvailable) return;
    setOrderType(type);
  };

  const sendOrderToWhatsapp = () => {
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      alert("Por favor ingresa tu nombre.");
      return;
    }
    if (orderType === "delivery" && !deliveryAddress.trim() && !locationLink) {
      alert("Por favor ingresa tu dirección o comparte tu ubicación.");
      return;
    }

    let message = `*PEDIDO BIG JACK*\n\n`;
    message += `*Cliente:* ${customerName}\n`;
    message += `*Tipo:* ${orderType === "delivery" ? "Delivery" : "Recojo en tienda"}\n`;

    if (orderType === "delivery") {
      message += `*Dirección:* ${deliveryAddress || "Ubicación compartida"}\n`;
      if (deliveryReference) message += `*Referencia:* ${deliveryReference}\n`;
      if (locationLink) message += `*Mapa:* ${locationLink}\n`;
    } else {
      message += `*Hora:* ${pickupTime === "now" ? "Recojo inmediato (5-10 min)" : `Programado: ${scheduledTime}`}\n`;
    }

    message += `\n*Detalle del pedido:*\n`;
    cart.forEach((item) => {
      message += `- ${item.quantity}x ${item.name} (${item.optionLabel}) - S/ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Total a pagar:* S/ ${total.toFixed(2)}`;
    message += `\n\n*Método de pago:* ${paymentMethod.toUpperCase()}`;
    if (notes.trim()) message += `\n*Notas:* ${notes.trim()}`;

    const url = `https://wa.me/${restaurantInfo.contact.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans pb-20">
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
          name: restaurantInfo.name,
          image: restaurantInfo.logo,
          address: {
            "@type": "PostalAddress",
            streetAddress: restaurantInfo.contact.address,
          },
          telephone: `+${restaurantInfo.contact.whatsapp}`,
          url: restaurantInfo.contact.googleMapsLink,
        }) }} />
      </Head>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-yellow-500">{restaurantInfo.name}</h1>
            <p className="text-xs text-neutral-400 hidden sm:block">{restaurantInfo.slogan}</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-2 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 transition-colors"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

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

      {/* FAST TRACK */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-3 overflow-x-auto pb-3 snap-x">
          {fastTrackHighlights.map((feature) => (
            <div
              key={feature.title}
              className="min-w-[240px] flex-1 border border-neutral-800 rounded-2xl bg-neutral-900/60 p-4 hover:border-yellow-500/60 transition snap-start"
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
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.4489596287253!2d-77.03826302514345!3d-12.081386842545953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c9dd0322b291%3A0xa9d9695fd746a41b!2sHamburgueser%C3%ADa%20-%20Big%20Jack!5e0!3m2!1ses-419!2spe!4v1763683257728!5m2!1ses-419!2spe"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-1">Visítanos</p>
            <h3 className="text-2xl font-bold text-white mb-2">Encuéntranos en Lince</h3>
            <p className="text-neutral-400 mb-4">{restaurantInfo.contact.address}</p>
            <div className="flex gap-2 flex-wrap">
              <a href={restaurantInfo.contact.googleMapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg">Abrir en Google Maps</a>
              <a href={`https://wa.me/${restaurantInfo.contact.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-neutral-900 text-white border border-neutral-700 px-4 py-2 rounded-lg">Pedir por WhatsApp</a>
            </div>
            <p className="text-xs text-neutral-500 mt-3">Comparte este mapa al pedir delivery o úsalo como guía si vienes a recoger.</p>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <div className="sticky top-[73px] z-40 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 py-4">
        <div className="max-w-6xl mx-auto px-4 flex gap-3 overflow-x-auto">
          {["TODOS", ...categories].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-black tracking-wide transition-all border ${
                  isActive
                    ? "bg-yellow-500 text-black border-yellow-500 shadow shadow-yellow-900/40"
                    : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-yellow-500/50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <main id="menu-section" className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-sm text-neutral-500">Categoría seleccionada</p>
            <h2 className="text-2xl font-black text-white">{selectedCategory === "TODOS" ? "Todo el menú" : selectedCategory}</h2>
          </div>
          <p className="text-neutral-400 text-sm max-w-sm text-right hidden md:block">
            Toca en las versiones Simple o Doble para añadir directo al carrito. Cada botón muestra una animación suave para confirmar la acción.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const optionsToRender = item.options?.length
              ? item.options
              : [{ id: "regular", label: "Regular", price: item.price || 0 }];
            const basePrice = optionsToRender.reduce((min, opt) => Math.min(min, opt.price), optionsToRender[0].price);
            return (
              <div key={item.id} className="border border-neutral-800 rounded-[28px] bg-gradient-to-b from-neutral-900 to-neutral-950 hover:border-yellow-500/60 transition-transform duration-300 hover:-translate-y-1">
                <div className="relative h-56 overflow-hidden rounded-t-[28px] border-b border-neutral-800 bg-neutral-800">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
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
                </div>
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
                  <div className="grid gap-2">
                    {optionsToRender.map((option) => {
                      const isRecent = recentlyAdded === `${item.id}-${option.id}`;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleAddProduct(item, option.id)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left bg-neutral-900/70 transition-all flex flex-col gap-1 ${
                            isRecent
                              ? "border-green-400/80 bg-green-500/10 shadow shadow-green-900/40"
                              : "border-neutral-800 hover:border-yellow-500/70"
                          }`}
                        >
                          <div className="flex items-center justify-between text-sm font-semibold">
                            <span>{option.label}</span>
                            <span className="text-yellow-400">S/ {option.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                            <span>Añadir</span>
                            <Plus size={12} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL CARRITO (Móvil y Desktop) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          ></div>
          
          {/* Panel Lateral */}
          <div className="relative w-full max-w-md bg-neutral-900 h-full shadow-2xl flex flex-col border-l border-neutral-800 animate-in slide-in-from-right duration-300">
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
            <div className="px-5 py-3 border-b border-neutral-800 bg-neutral-900 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:border-yellow-500 hover:text-white transition"
                onClick={copyCartSummary}
              >
                <ClipboardList size={14} /> Copiar resumen
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:border-yellow-500 hover:text-white transition disabled:opacity-40"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                <Trash2 size={14} /> Vaciar carrito
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:border-yellow-500 hover:text-white transition"
                onClick={resetCheckoutForm}
              >
                <RefreshCw size={14} /> Limpiar datos
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
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
                  <div className="bg-neutral-800/60 rounded-xl border border-neutral-700 p-4 space-y-4 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-yellow-500 flex items-center gap-2"><User size={18} /> Tus Datos</h3>
                      <span className="text-xs px-2 py-1 bg-neutral-700 rounded-full">Paso 1</span>
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <label className="block text-xs text-neutral-400 mb-1">Nombre</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                          <input
                            value={customerName}
                            onChange={(e)=>setCustomerName(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-3 pl-10 pr-3 text-sm focus:border-yellow-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-400 mb-2">Tipo de pedido</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={()=>handleSelectOrderType("pickup")}
                            className={`h-12 rounded-lg text-sm font-bold border flex items-center justify-center gap-2 transition-all ${orderType==='pickup'? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-900/30':'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800'}`}
                          >Recojo en local</button>
                          <button
                            type="button"
                            onClick={()=>handleSelectOrderType("delivery")}
                            disabled={!deliveryAvailable}
                            className={`h-12 rounded-lg text-sm font-bold border flex items-center justify-center gap-2 transition-all ${deliveryAvailable && orderType==='delivery'? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-900/30':'bg-neutral-900 border-neutral-800 text-neutral-500'} ${!deliveryAvailable ? 'cursor-not-allowed opacity-60' : 'hover:border-neutral-500 hover:bg-neutral-800'}`}
                          >Delivery (próximamente)</button>
                        </div>
                        {!deliveryAvailable && (
                          <p className="text-[11px] text-neutral-500 mt-2">Delivery volverá a estar disponible pronto.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Paso 2: Condicional según tipo */}
                  <div className="bg-neutral-800/60 rounded-xl border border-neutral-700 p-4 space-y-4 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-yellow-500 flex items-center gap-2">
                        {orderType==='delivery' ? <MapPin size={18} /> : <Clock size={18} />} 
                        {orderType==='delivery' ? 'Entrega' : 'Recojo'}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-neutral-700 rounded-full">Paso 2</span>
                    </div>
                    
                    {orderType==='delivery' ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Dirección</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                            <input
                              value={deliveryAddress}
                              onChange={(e)=>setDeliveryAddress(e.target.value)}
                              placeholder="Calle / Av. y Número"
                              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-3 pl-10 pr-3 text-sm focus:border-yellow-500 outline-none transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Referencia</label>
                          <div className="relative">
                            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                            <input
                              value={deliveryReference}
                              onChange={(e)=>setDeliveryReference(e.target.value)}
                              placeholder="Ej: Frente al parque"
                              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-3 pl-10 pr-3 text-sm focus:border-yellow-500 outline-none transition-colors"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={getUserLocation} className={`w-full py-2 rounded-lg text-sm font-bold border flex items-center justify-center gap-2 transition-colors ${locationLink ? 'bg-green-600/20 border-green-600 text-green-400' : 'bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600/30'}`}>
                            <MapPin size={16} /> {locationLink ? 'Ubicación guardada' : 'Compartir ubicación actual'}
                          </button>
                          {locationLink && <p className="text-xs text-green-500 text-center">Se incluirá el enlace de tu ubicación en el pedido.</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">¿Cuándo recoges?</label>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                             <button
                                onClick={()=>setPickupTime("now")}
                                className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition-all ${pickupTime==='now'? 'bg-yellow-500 text-black border-yellow-500':'bg-neutral-900 border-neutral-700 text-neutral-400'}`}
                              >Recoger ahora</button>
                              <button
                                onClick={()=>setPickupTime("schedule")}
                                className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition-all ${pickupTime==='schedule'? 'bg-yellow-500 text-black border-yellow-500':'bg-neutral-900 border-neutral-700 text-neutral-400'}`}
                              >Programar horario</button>
                          </div>
                        </div>

                        {pickupTime==='schedule' && (
                          <div className="animate-in slide-in-from-top-2 duration-200">
                            <label className="block text-xs text-neutral-400 mb-2">Selecciona una hora</label>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              {/* Generar slots de tiempo próximos */}
                              {(() => {
                                const slots = [];
                                const now = new Date();
                                const remainder = 15 - (now.getMinutes() % 15);
                                now.setMinutes(now.getMinutes() + remainder);
                                for(let i=0; i<6; i++) {
                                  const timeStr = now.toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit', hour12:false});
                                  slots.push(timeStr);
                                  now.setMinutes(now.getMinutes() + 15);
                                }
                                return slots.map(time => (
                                  <button
                                    key={time}
                                    onClick={()=>setScheduledTime(time)}
                                    className={`py-2 rounded-md text-xs font-bold border transition-all ${scheduledTime===time ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-500'}`}
                                  >
                                    {time}
                                  </button>
                                ));
                              })()}
                            </div>
                            <div className="relative">
                               <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                               <input
                                type="time"
                                value={scheduledTime}
                                onChange={(e)=>setScheduledTime(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-3 pl-10 pr-3 text-sm focus:border-yellow-500 outline-none text-center"
                              />
                            </div>
                            <p className="text-[10px] text-neutral-500 mt-1 text-center">O elige una hora específica arriba</p>
                          </div>
                        )}
                        
                        {pickupTime==='now' && (
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-500 font-semibold flex gap-2 items-center animate-in fade-in">
                            <Clock size={14} /> Prepararemos tu pedido en aprox. 15-20 minutos.
                          </div>
                        )}
                        
                        <a
                          href={restaurantInfo.contact.googleMapsLink}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors mt-2"
                        >
                          <Navigation size={16} /> Ver ubicación del local
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Paso 3: Pago y Notas */}
                  <div className="bg-neutral-800/60 rounded-xl border border-neutral-700 p-4 space-y-4 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-yellow-500 flex items-center gap-2"><CreditCard size={18} /> Pago</h3>
                      <span className="text-xs px-2 py-1 bg-neutral-700 rounded-full">Paso 3</span>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {id: 'efectivo', label: 'Efectivo', icon: Banknote},
                          {id: 'yape', label: 'Yape', icon: Smartphone},
                          {id: 'plin', label: 'Plin', icon: Smartphone},
                          {id: 'tarjeta', label: 'Tarjeta', icon: CreditCard, disabled: true}
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => { if (!m.disabled) setPaymentMethod(m.id); }}
                            disabled={m.disabled}
                            title={m.disabled ? 'Próximamente' : undefined}
                            aria-disabled={m.disabled ? 'true' : 'false'}
                            className={`h-12 rounded-lg text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod===m.id ? 'bg-yellow-500 text-black border-yellow-500 shadow shadow-yellow-900/30' : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800'} ${m.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <m.icon size={14} />
                            <div className="flex items-center gap-2">
                              <span>{m.label}</span>
                              {m.disabled && <span className="text-[10px] text-neutral-400">Próximamente</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-400 mb-1">Notas (Opcional)</label>
                        <textarea
                          value={notes}
                          onChange={(e)=>setNotes(e.target.value)}
                          rows={2}
                          placeholder="Ej: Sin cebolla, entregar en portería..."
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm focus:border-yellow-500 outline-none resize-y"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-neutral-800 bg-neutral-900">
              <div className="flex justify-between items-center mb-4 text-lg font-bold">
                <span>Total</span>
                <span className="text-yellow-500 text-2xl">S/ {total.toFixed(2)}</span>
              </div>
              <button
                onClick={sendOrderToWhatsapp}
                disabled={cart.length === 0}
                className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-900/20"
              >
                <Send size={20} />
                PEDIR POR WHATSAPP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

