"use client";
import Head from "next/head";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { menuItems, restaurantInfo, categories } from "./data/menuData";
import { ShoppingCart, Trash2, Plus, Minus, Send, X, MapPin, Clock, Navigation, User, CreditCard, Banknote, Smartphone, Sparkles, Flame, PhoneCall, Instagram, Music } from "lucide-react";

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
  const audioContextRef = useRef(null);

  const playAddSound = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.12);
    } catch {}
  }, []);

  // Cargar estado desde localStorage al iniciar
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bj_checkout"));
      if (saved) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setCustomerName(saved.customerName || "");
        setOrderType(saved.orderType || "pickup");
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
    playAddSound();
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
    if (!navigator.geolocation) {
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

    let message = `🔥 *PEDIDO BIG JACK* 🔥\n\n`;
    message += `👤 *Cliente:* ${customerName}\n`;
    message += `📦 *Tipo:* ${orderType === "delivery" ? "DELIVERY 🛵" : "RECOJO EN TIENDA 🥡"}\n`;

    if (orderType === "delivery") {
      message += `📍 *Dirección:* ${deliveryAddress || "Ubicación compartida"}\n`;
      if (deliveryReference) message += `🏠 *Ref:* ${deliveryReference}\n`;
      if (locationLink) message += `🗺 *Mapa:* ${locationLink}\n`;
    } else {
      message += `⏰ *Hora:* ${pickupTime === "now" ? "AHORA MISMO (5-10 min)" : `Programado: ${scheduledTime}`}\n`;
    }

    message += `\n🍔 *DETALLE DEL PEDIDO:*\n`;
    cart.forEach((item) => {
      message += `▪️ ${item.quantity}x ${item.name} (${item.optionLabel}) - S/ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n💰 *TOTAL A PAGAR: S/ ${total.toFixed(2)}*`;
    message += `\n\n💳 *Método de pago:* ${paymentMethod.toUpperCase()}`;
    if (notes.trim()) message += `\n📝 *Notas:* ${notes.trim()}`;

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
      {/* HEADER - MOBILE OPTIMIZED */}
      <header className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-yellow-500 truncate">{restaurantInfo.name}</h1>
            <p className="text-xs text-neutral-400 hidden sm:block truncate">{restaurantInfo.slogan}</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-3 md:p-2.5 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 active:scale-95 transition-all shadow-lg hover:shadow-xl flex-shrink-0 touch-manipulation min-w-[52px] min-h-[52px] md:min-w-[48px] md:min-h-[48px] flex items-center justify-center"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Ver carrito"
          >
            <ShoppingCart size={24} className="md:w-6 md:h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold min-w-[22px] min-h-[22px] md:min-w-[20px] md:min-h-[20px] flex items-center justify-center rounded-full px-1 shadow-md">
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
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-4 md:px-7 md:py-5 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/50 text-base md:text-lg hover:bg-yellow-400 active:scale-95 transition-all touch-manipulation min-h-[56px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Send size={20} className="md:w-6 md:h-6" /> Pedir ahora
              </a>
              <button
                onClick={scrollToMenu}
                className="px-6 py-4 md:px-7 md:py-5 rounded-full border-2 border-neutral-700 text-white/90 hover:text-white hover:border-yellow-500 hover:bg-yellow-500/10 active:scale-95 transition-all text-base md:text-lg font-semibold touch-manipulation min-h-[56px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Ver menú completo
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[{
                label: "Listo en",
                value: "15 min",
                sub: "si recoges"
              }, {
                label: "Pedidos felices",
                value: "+4k",
                sub: "desde 2020"
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
            <div className="absolute -bottom-6 -right-4 w-56 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 text-sm shadow-xl shadow-black/40">
              <p className="font-semibold text-white flex items-center gap-2">
                <PhoneCall size={16} /> Flujo ultra rápido
              </p>
              <ol className="list-decimal list-inside text-neutral-400 text-xs mt-2 space-y-1">
                <li>Selecciona tu combo</li>
                <li>Compártelo por WhatsApp</li>
                <li>Recoge o espera al rider 🔔</li>
              </ol>
              <a
                href={restaurantInfo.contact.tiktok}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-yellow-400 underline mt-2 inline-flex"
              >
                Ver historias y promos
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* REDES SOCIALES - MOBILE OPTIMIZED */}
      <section className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800 px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
              Síguenos en <span className="text-yellow-500">Redes Sociales</span>
            </h2>
            <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto">
              Entérate de nuestras promos diarias, historias exclusivas y participa en sorteos
            </p>
          </div>
          
          {/* Botones grandes para móvil y desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl min-h-[140px] md:min-h-[180px] touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 bg-white/20 rounded-full p-4 md:p-5 group-hover:scale-110 transition-transform">
                <Send size={32} className="md:w-10 md:h-10" />
              </div>
              <div className="relative z-10 text-center">
                <p className="text-xl md:text-2xl font-black mb-1">WhatsApp</p>
                <p className="text-sm md:text-base text-white/90 font-semibold">Pide ahora</p>
              </div>
            </a>

            {/* Instagram */}
            <a
              href={`https://www.instagram.com/${restaurantInfo.contact.instagram?.replace('@', '') || 'bigjack.pe'}`}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden bg-gradient-to-br from-pink-600 via-purple-600 to-orange-500 hover:from-pink-500 hover:via-purple-500 hover:to-orange-400 text-white rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl min-h-[140px] md:min-h-[180px] touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 bg-white/20 rounded-full p-4 md:p-5 group-hover:scale-110 transition-transform">
                <Instagram size={32} className="md:w-10 md:h-10" />
              </div>
              <div className="relative z-10 text-center">
                <p className="text-xl md:text-2xl font-black mb-1">Instagram</p>
                <p className="text-sm md:text-base text-white/90 font-semibold">{restaurantInfo.contact.instagram}</p>
              </div>
            </a>

            {/* TikTok */}
            <a
              href={restaurantInfo.contact.tiktok || 'https://www.tiktok.com/@bigjack.pe'}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-neutral-800 hover:from-neutral-900 hover:via-neutral-800 hover:to-neutral-700 text-white rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl border-2 border-cyan-500/30 hover:border-cyan-500/60 min-h-[140px] md:min-h-[180px] touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-full p-4 md:p-5 group-hover:scale-110 transition-transform">
                <Music size={32} className="md:w-10 md:h-10 text-black" />
              </div>
              <div className="relative z-10 text-center">
                <p className="text-xl md:text-2xl font-black mb-1">TikTok</p>
                <p className="text-sm md:text-base text-white/90 font-semibold">Ver promos</p>
              </div>
            </a>
          </div>

          {/* Flujo rápido mejorado para móvil */}
          <div className="mt-8 md:mt-10 bg-neutral-800/60 border border-neutral-700 rounded-2xl md:rounded-3xl p-5 md:p-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="flex-shrink-0 bg-yellow-500/10 rounded-xl p-3 md:p-4">
                <PhoneCall className="text-yellow-500 w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Flujo ultra rápido</h3>
                <ol className="list-decimal list-inside text-neutral-300 text-sm md:text-base space-y-1.5 md:space-y-2">
                  <li>Selecciona tu combo en el menú</li>
                  <li>Compártelo por WhatsApp con un clic</li>
                  <li>Recoge en tienda o espera al rider 🔔</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MICRO STEPS */}
      <section className="max-w-6xl mx-auto px-4 py-8 grid gap-4 md:grid-cols-3">
        {[{
          title: "Explora visualmente",
          desc: "Fotos reales, precios y diferencias simple/doble claros.",
        }, {
          title: "Añade con efecto",
          desc: "Animaciones, sonido suave y carrito flotante siempre visible.",
        }, {
          title: "Envío directo",
          desc: "Un clic abre WhatsApp con el pedido formateado listo para enviar.",
        }].map((feature) => (
          <div key={feature.title} className="border border-neutral-800 rounded-3xl bg-neutral-900/60 p-5 hover:border-yellow-500/60 transition">
            <p className="text-sm text-yellow-500 font-bold mb-1">FAST TRACK</p>
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-neutral-400 text-sm">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* ENCUÉNTRANOS (MAPA) */}
      <section className="bg-neutral-800 px-4 py-8 border-b border-neutral-700">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="w-full rounded-xl overflow-hidden border border-neutral-700">
            <div className="w-full h-64 md:h-80">
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
            <h3 className="text-xl font-bold text-yellow-500 mb-2">Encuéntranos</h3>
            <p className="text-neutral-400 text-sm md:text-base mb-4">{restaurantInfo.contact.address}</p>
            <div className="flex flex-col sm:flex-row gap-2.5 md:gap-2">
              <a 
                href={restaurantInfo.contact.googleMapsLink} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-bold px-5 py-3.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base transition-all touch-manipulation min-h-[52px] shadow-lg"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <MapPin size={18} />
                Abrir en Google Maps
              </a>
              <a 
                href={`https://wa.me/${restaurantInfo.contact.whatsapp}`} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center justify-center gap-2 bg-black hover:bg-neutral-900 active:scale-95 text-white font-bold px-5 py-3.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base transition-all touch-manipulation min-h-[52px] shadow-lg"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Send size={18} />
                Pedir por WhatsApp
              </a>
            </div>
            <p className="text-xs md:text-sm text-neutral-500 mt-3">Usa el mapa para compartir tu ubicación al pedir delivery o para llegar a recoger tu pedido.</p>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS - MOBILE OPTIMIZED */}
      <div className="sticky top-[73px] z-40 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 py-3 md:py-4">
        <div className="max-w-6xl mx-auto px-4 flex gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {["TODOS", ...categories].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 md:px-6 py-3 md:py-3.5 rounded-full text-sm md:text-base font-black tracking-wide transition-all border-2 whitespace-nowrap touch-manipulation min-h-[48px] active:scale-95 ${
                  isActive
                    ? "bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-900/40"
                    : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-yellow-500/50 hover:bg-neutral-800"
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
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
            Toca en las versiones Simple o Doble para añadir directo al carrito. Cada botón reproduce una animación suave y sonido discreto.
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
                  <div className="grid gap-2.5 md:gap-2">
                    {optionsToRender.map((option) => {
                      const isRecent = recentlyAdded === `${item.id}-${option.id}`;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleAddProduct(item, option.id)}
                          className={`w-full rounded-2xl border-2 px-4 py-4 md:py-3 text-left bg-neutral-900/70 transition-all flex flex-col gap-1.5 md:gap-1 hover:scale-[1.02] active:scale-95 touch-manipulation min-h-[60px] md:min-h-[auto] ${
                            isRecent
                              ? "border-green-400/80 bg-green-500/10 shadow-lg shadow-green-900/40"
                              : "border-neutral-800 hover:border-yellow-500/70 hover:bg-neutral-800/80"
                          }`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <div className="flex items-center justify-between text-sm md:text-sm font-semibold">
                            <span className="text-base md:text-sm">{option.label}</span>
                            <span className="text-yellow-400 text-base md:text-sm">S/ {option.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-neutral-500 font-bold">
                            <span>Añadir al carrito</span>
                            <Plus size={14} className="md:w-3 md:h-3" />
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

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* LISTA DE ITEMS */}
              {cart.length === 0 ? (
                <div className="text-center py-10 text-neutral-500">
                  <p className="text-lg mb-2">Tu carrito está vacío 🍔</p>
                  <p className="text-sm">¡Agrega unas burgers brutales!</p>
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
                        <label className="block text-xs md:text-sm text-neutral-400 mb-1.5 font-medium">Nombre</label>
                        <div className="relative">
                          <User className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                          <input
                            value={customerName}
                            onChange={(e)=>setCustomerName(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg py-3.5 md:py-3 pl-11 md:pl-10 pr-3 text-base md:text-sm focus:border-yellow-500 outline-none transition-colors min-h-[52px] md:min-h-[auto]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-400 mb-2">Tipo de pedido</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            onClick={()=>setOrderType("pickup")}
                            className={`min-h-[56px] rounded-lg text-sm md:text-base font-bold border-2 flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation ${orderType==='pickup'? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-900/30':'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800'}`}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >🥡 Recojo</button>
                          <button
                            onClick={()=>setOrderType("delivery")}
                            className={`min-h-[56px] rounded-lg text-sm md:text-base font-bold border-2 flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation ${orderType==='delivery'? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-900/30':'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800'}`}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >🛵 Delivery</button>
                        </div>
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
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs md:text-sm text-neutral-400 mb-1.5 font-medium">Dirección</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                            <input
                              value={deliveryAddress}
                              onChange={(e)=>setDeliveryAddress(e.target.value)}
                              placeholder="Calle / Av. y Número"
                              className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg py-3.5 md:py-3 pl-11 md:pl-10 pr-3 text-base md:text-sm focus:border-yellow-500 outline-none transition-colors min-h-[52px] md:min-h-[auto]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm text-neutral-400 mb-1.5 font-medium">Referencia</label>
                          <div className="relative">
                            <Navigation className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                            <input
                              value={deliveryReference}
                              onChange={(e)=>setDeliveryReference(e.target.value)}
                              placeholder="Ej: Frente al parque"
                              className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg py-3.5 md:py-3 pl-11 md:pl-10 pr-3 text-base md:text-sm focus:border-yellow-500 outline-none transition-colors min-h-[52px] md:min-h-[auto]"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={getUserLocation} 
                            className={`w-full min-h-[56px] rounded-lg text-sm md:text-base font-bold border-2 flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation ${locationLink ? 'bg-green-600/20 border-green-600 text-green-400' : 'bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600/30'}`}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <MapPin size={18} /> {locationLink ? 'Ubicación Guardada ✅' : 'Compartir Ubicación Actual'}
                          </button>
                          {locationLink && <p className="text-xs md:text-sm text-green-500 text-center font-medium">Se incluirá el enlace de tu ubicación en el pedido.</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs md:text-sm text-neutral-400 mb-1.5 font-medium">¿Cuándo recoges?</label>
                          <div className="grid grid-cols-2 gap-2.5 mb-3">
                             <button
                                onClick={()=>setPickupTime("now")}
                                className={`min-h-[52px] rounded-lg text-sm md:text-base font-bold border-2 flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation ${pickupTime==='now'? 'bg-yellow-500 text-black border-yellow-500 shadow-lg':'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'}`}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                              >🔥 Ahora</button>
                              <button
                                onClick={()=>setPickupTime("schedule")}
                                className={`min-h-[52px] rounded-lg text-sm md:text-base font-bold border-2 flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation ${pickupTime==='schedule'? 'bg-yellow-500 text-black border-yellow-500 shadow-lg':'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'}`}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                              >📅 Programar</button>
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
                      <div className="grid grid-cols-2 gap-2.5">
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
                            className={`min-h-[64px] rounded-lg text-xs md:text-sm font-bold border-2 flex flex-col items-center justify-center gap-1.5 transition-all touch-manipulation ${paymentMethod===m.id ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-900/30 scale-105' : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800 active:scale-95'} ${m.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <m.icon size={18} className="md:w-4 md:h-4" />
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="leading-tight">{m.label}</span>
                              {m.disabled && <span className="text-[9px] md:text-[10px] text-neutral-400 leading-tight">Próximamente</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm text-neutral-400 mb-1.5 font-medium">Notas (Opcional)</label>
                        <textarea
                          value={notes}
                          onChange={(e)=>setNotes(e.target.value)}
                          rows={3}
                          placeholder="Ej: Sin cebolla, entregar en portería..."
                          className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-3.5 md:p-3 text-base md:text-sm focus:border-yellow-500 outline-none resize-y min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 md:p-5 border-t border-neutral-800 bg-neutral-900">
              <div className="flex justify-between items-center mb-4 md:mb-5">
                <span className="text-base md:text-lg font-bold">Total</span>
                <span className="text-yellow-500 text-2xl md:text-3xl font-black">S/ {total.toFixed(2)}</span>
              </div>
              <button
                onClick={sendOrderToWhatsapp}
                disabled={cart.length === 0}
                className="w-full py-5 md:py-4 bg-green-600 hover:bg-green-500 active:scale-95 disabled:bg-neutral-700 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-black rounded-2xl md:rounded-xl transition-all flex items-center justify-center gap-2.5 text-lg md:text-xl shadow-xl shadow-green-900/30 hover:shadow-2xl touch-manipulation min-h-[64px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Send size={24} className="md:w-5 md:h-5" />
                PEDIR POR WHATSAPP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

