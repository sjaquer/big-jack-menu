"use client";
import Head from "next/head";
import { useState, useMemo, useEffect } from "react";
import { menuItems, restaurantInfo, categories } from "./data/menuData";
import { ShoppingCart, Trash2, Plus, Minus, Send, X, MapPin, Clock, Navigation, User, CreditCard, Banknote, Smartphone } from "lucide-react";

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

  // Cargar estado desde localStorage al iniciar
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bj_checkout"));
      if (saved) {
        setCustomerName(saved.customerName || "");
        setOrderType(saved.orderType || "pickup");
        setDeliveryAddress(saved.deliveryAddress || "");
        setDeliveryReference(saved.deliveryReference || "");
        setPickupTime(saved.pickupTime || "now");
        setScheduledTime(saved.scheduledTime || "");
        setPaymentMethod(saved.paymentMethod || "efectivo");
        setNotes(saved.notes || "");
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

  // Calcular total memoizado
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  // Funciones del carrito
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
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
      message += `▪️ ${item.quantity}x ${item.name} - S/ ${(item.price * item.quantity).toFixed(2)}\n`;
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

      {/* HERO / BANNER */}
      <div className="bg-neutral-800 py-12 px-4 text-center border-b border-neutral-700 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-2 text-white">
            HAMBURGUESAS <span className="text-yellow-500">BRUTALES</span>
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto mb-6">
            {restaurantInfo.slogan}. Pide ahora y te lo llevamos volando.
          </p>
          
          {/* SOCIAL MEDIA PROMO */}
          <div className="inline-flex flex-col items-center gap-2 bg-neutral-900/50 p-4 rounded-xl border border-neutral-700 backdrop-blur-sm">
            <p className="text-sm font-bold text-yellow-500 animate-pulse">¡OFERTAS IMPERDIBLES EN TIKTOK!</p>
            <a 
              href={restaurantInfo.contact.tiktok} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              Síguenos en TikTok
            </a>
          </div>
        </div>
      </div>

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
            <p className="text-neutral-400 mb-3">{restaurantInfo.contact.address}</p>
            <div className="flex gap-2 flex-wrap">
              <a href={restaurantInfo.contact.googleMapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg">Abrir en Google Maps</a>
              <a href={`https://wa.me/${restaurantInfo.contact.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg">Pedir por WhatsApp</a>
            </div>
            <p className="text-xs text-neutral-500 mt-3">Usa el mapa para compartir tu ubicación al pedir delivery o para llegar a recoger tu pedido.</p>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <div className="sticky top-[73px] z-40 bg-neutral-900 py-4 border-b border-neutral-800 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 flex gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory("TODOS")}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              selectedCategory === "TODOS"
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
            }`}
          >
            TODOS
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-yellow-500 text-black"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 hover:border-yellow-500/50 transition-all group">
              {/* Imagen Placeholder o Real */}
              <div className="h-48 bg-neutral-700 relative overflow-hidden">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {e.target.src = "https://placehold.co/600x400/222/yellow?text=BIG+JACK"}}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500">
                    Sin imagen
                  </div>
                )}
                {item.popular && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                    POPULAR
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white leading-tight">{item.name}</h3>
                  <span className="text-yellow-500 font-bold text-lg">S/ {item.price.toFixed(2)}</span>
                </div>
                <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                <button
                  onClick={() => addToCart(item)}
                  className="w-full py-3 bg-neutral-700 hover:bg-white hover:text-black text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  AGREGAR
                </button>
              </div>
            </div>
          ))}
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
                            onClick={()=>setOrderType("pickup")}
                            className={`h-12 rounded-lg text-sm font-bold border flex items-center justify-center gap-2 transition-all ${orderType==='pickup'? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-900/30':'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800'}`}
                          >🥡 Recojo</button>
                          <button
                            onClick={()=>setOrderType("delivery")}
                            className={`h-12 rounded-lg text-sm font-bold border flex items-center justify-center gap-2 transition-all ${orderType==='delivery'? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-900/30':'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800'}`}
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
                            <MapPin size={16} /> {locationLink ? 'Ubicación Guardada ✅' : 'Compartir Ubicación Actual'}
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
                              >🔥 Ahora</button>
                              <button
                                onClick={()=>setPickupTime("schedule")}
                                className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition-all ${pickupTime==='schedule'? 'bg-yellow-500 text-black border-yellow-500':'bg-neutral-900 border-neutral-700 text-neutral-400'}`}
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

