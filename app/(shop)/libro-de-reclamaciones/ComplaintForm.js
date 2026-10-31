"use client";
import { useState } from "react";
import { restaurantInfo, menuItems } from "../../data/menuData";
import { sendComplaint } from "../../actions";
import { formatAddress } from "../../lib/site";
import { Clipboard, User, CreditCard, Phone, Mail, Home, ShoppingCart, Banknote, Calendar, Lightbulb, Megaphone, MessageSquare, FileText, Target, AlertTriangle, Check } from "lucide-react";

export default function ComplaintForm() {
  const [status, setStatus] = useState(null); // null | 'submitting' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    const form = event.target;
    const formData = new FormData(form);
    
    try {
      const res = await sendComplaint(formData);
      
      if (res?.success) {
        setStatus("success");
        setMessage(res.message || "Reclamo enviado y registrado correctamente.");
        form.reset();
        setSelectedProduct("");
      } else {
        setStatus("error");
        setMessage(res?.message || "Hubo un problema al enviar el formulario. Por favor intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al enviar reclamo:", error);
      setStatus("error");
      setMessage("Error al conectar con el servidor. Por favor intenta nuevamente.");
    }
  }

  return (
    <div className="text-white">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12 space-y-4">
          <div className="inline-block bg-bj-yellow/10 border-2 border-bj-yellow/30 rounded-2xl px-6 py-2 mb-2">
            <span className="flex items-center gap-2 text-bj-yellow text-xs sm:text-sm font-black uppercase tracking-wider">
              <Clipboard className="w-4 h-4" /> Oficial
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">Libro de Reclamaciones</h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Conforme a lo establecido en el Código de Protección y Defensa del Consumidor este establecimiento cuenta con un Libro de Reclamaciones Virtual.
          </p>
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 sm:p-5 max-w-2xl mx-auto">
            <p className="text-neutral-400 text-xs sm:text-sm">
              <span className="font-bold text-bj-yellow">Razón social:</span> {restaurantInfo.legalName}<br />
              <span className="font-bold text-bj-yellow">RUC:</span> {restaurantInfo.ruc}<br />
              <span className="font-bold text-bj-yellow">Dirección:</span> {formatAddress(restaurantInfo.address, { full: true })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10 bg-gradient-to-b from-bj-bg to-bj-bg p-5 sm:p-8 md:p-10 rounded-3xl border-2 border-neutral-800 shadow-2xl">
          
          {/* 1. Identificación del Consumidor */}
          <section className="space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3 bg-bj-bg border-2 border-bj-yellow/20 rounded-xl p-4">
              <span className="w-8 h-8 sm:w-10 sm:h-10 bg-bj-yellow text-black rounded-full flex items-center justify-center font-black text-lg sm:text-xl">1</span>
              <h2 className="text-base sm:text-lg font-black text-white">Identificación del Consumidor Reclamante</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <label htmlFor="lr-name" className="text-xs sm:text-sm text-neutral-300 font-bold flex items-center gap-2">
                  <User className="w-4 h-4 text-bj-yellow" /> Nombre Completo
                </label>
                <input 
                  required 
                  id="lr-name" name="name" 
                  type="text" 
                  placeholder="Ej: Juan Pérez García"
                  className="w-full bg-bj-bg border-2 border-neutral-700 rounded-xl p-4 text-sm sm:text-base text-white placeholder:text-neutral-600 focus:border-bj-yellow focus:ring-2 focus:ring-bj-yellow/20 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lr-dni" className="text-xs sm:text-sm text-neutral-300 font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-bj-yellow" /> DNI / CE
                </label>
                <input 
                  required 
                  id="lr-dni" name="dni" 
                  type="text" 
                  placeholder="Ej: 12345678"
                  className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-sm sm:text-base text-white placeholder:text-neutral-600 focus:border-bj-yellow focus:ring-2 focus:ring-bj-yellow/20 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lr-phone" className="text-xs sm:text-sm text-neutral-300 font-bold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-bj-yellow" /> Teléfono
                </label>
                <input 
                  required 
                  id="lr-phone" name="phone" 
                  type="tel" 
                  placeholder="Ej: 970513912"
                  className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-sm sm:text-base text-white placeholder:text-neutral-600 focus:border-bj-yellow focus:ring-2 focus:ring-bj-yellow/20 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lr-email" className="text-xs sm:text-sm text-neutral-300 font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-bj-yellow" /> Email
                </label>
                <input 
                  required 
                  id="lr-email" name="email" 
                  type="email" 
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-sm sm:text-base text-white placeholder:text-neutral-600 focus:border-bj-yellow focus:ring-2 focus:ring-bj-yellow/20 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="lr-address" className="text-xs sm:text-sm text-neutral-300 font-bold flex items-center gap-2">
                  <Home className="w-4 h-4 text-bj-yellow" /> Domicilio
                </label>
                <input 
                  required 
                  id="lr-address" name="address" 
                  type="text" 
                  placeholder="Av. / Calle y número, distrito, ciudad"
                  className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-sm sm:text-base text-white placeholder:text-neutral-600 focus:border-bj-yellow focus:ring-2 focus:ring-bj-yellow/20 outline-none transition-all" 
                />
              </div>
            </div>
          </section>

          {/* 2. Identificación del Bien Contratado */}
          <section className="space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3 bg-neutral-950 border-2 border-bj-yellow/20 rounded-xl p-4">
              <span className="w-8 h-8 sm:w-10 sm:h-10 bg-bj-yellow text-black rounded-full flex items-center justify-center font-black text-lg sm:text-xl">2</span>
              <h2 className="text-base sm:text-lg font-black text-white">Identificación del Bien Contratado</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="lr-product" className="text-xs sm:text-sm text-neutral-300 font-bold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-bj-yellow" /> Producto o Servicio
                </label>
                <select
                  required
                  id="lr-product" name="product"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-sm sm:text-base text-white focus:border-bj-yellow focus:ring-2 focus:ring-bj-yellow/20 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-neutral-900">Selecciona un producto del menú</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={`${item.name} - ${item.category}`} className="bg-neutral-900">
                      {item.name} ({item.category})
                    </option>
                  ))}
                  <option value="Servicio de atención" className="bg-neutral-900">Servicio de atención al cliente</option>
                  <option value="Otro" className="bg-neutral-900">Otro (especificar en detalle)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="lr-amount" className="text-xs sm:text-sm text-neutral-300 font-bold flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-bj-yellow" /> Monto Reclamado (S/)
                </label>
                <input 
                  id="lr-amount" name="amount" 
                  type="number" 
                  step="0.01" 
                  placeholder="Ej: 14.00"
                  className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-sm sm:text-base text-white placeholder:text-neutral-600 focus:border-bj-yellow focus:ring-2 focus:ring-bj-yellow/20 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lr-incident_date" className="text-xs sm:text-sm text-neutral-300 font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-bj-yellow" /> Fecha del Incidente
                </label>
                <input 
                  required
                  id="lr-incident_date" name="incident_date" 
                  type="date" 
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-sm sm:text-base text-white focus:border-bj-yellow focus:ring-2 focus:ring-bj-yellow/20 outline-none transition-all" 
                />
              </div>
            </div>
            <div className="bg-blue-500/10 border-2 border-blue-500/20 rounded-xl p-4">
              <p className="text-xs sm:text-sm text-blue-300 flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-300" />
                <span>Selecciona directamente desde nuestro menú para mayor rapidez en el proceso</span>
              </p>
            </div>
          </section>

          {/* 3. Detalle de la Reclamación */}
          <section className="space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3 bg-neutral-950 border-2 border-bj-yellow/20 rounded-xl p-4">
              <span className="w-8 h-8 sm:w-10 sm:h-10 bg-bj-yellow text-black rounded-full flex items-center justify-center font-black text-lg sm:text-xl">3</span>
              <h2 className="text-base sm:text-lg font-black text-white">Detalle de la Reclamación</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-neutral-300 font-bold block mb-3" id="lr-type-label">Tipo de registro</p>
                <div role="radiogroup" aria-labelledby="lr-type-label" className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <label className="flex items-start gap-4 cursor-pointer border-2 border-neutral-700 bg-neutral-950 rounded-xl p-5 hover:border-bj-yellow transition-all has-[:checked]:border-bj-yellow has-[:checked]:bg-bj-yellow/10 has-[:checked]:shadow-lg has-[:checked]:shadow-bj-yellow/20">
                    <input required type="radio" name="type" value="reclamo" className="accent-bj-yellow w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-base sm:text-lg font-black block text-white mb-1"><Megaphone className="w-5 h-5 inline-block mr-2 text-bj-yellow" /> Reclamo</span>
                      <span className="text-xs sm:text-sm text-neutral-400 leading-relaxed">Disconformidad con producto o servicio recibido</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-4 cursor-pointer border-2 border-neutral-700 bg-neutral-950 rounded-xl p-5 hover:border-bj-yellow transition-all has-[:checked]:border-bj-yellow has-[:checked]:bg-bj-yellow/10 has-[:checked]:shadow-lg has-[:checked]:shadow-bj-yellow/20">
                    <input required type="radio" name="type" value="queja" className="accent-bj-yellow w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-base sm:text-lg font-black block text-white mb-1"><MessageSquare className="w-5 h-5 inline-block mr-2 text-bj-yellow" /> Queja</span>
                      <span className="text-xs sm:text-sm text-neutral-400 leading-relaxed">Malestar por la atención o servicio al cliente</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="lr-description" className="text-xs sm:text-sm text-neutral-300 font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-bj-yellow" /> ¿Qué ocurrió? (Detalle completo)
              </label>
              <textarea 
                required 
                id="lr-description" name="description" 
                rows="5" 
                placeholder="Describe lo sucedido con el mayor detalle posible: fecha exacta, hora, qué producto/servicio, qué falló, etc."
                className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-sm sm:text-base text-white placeholder:text-neutral-600 focus:border-bj-yellow focus:ring-2 focus:ring-bj-yellow/20 outline-none transition-all resize-none"
              ></textarea>
            </div>
            <div className="space-y-2">
              <label htmlFor="lr-request" className="text-xs sm:text-sm text-neutral-300 font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-bj-yellow" /> ¿Qué solicitas? (Pedido del Consumidor)
              </label>
              <textarea 
                required 
                id="lr-request" name="request" 
                rows="3" 
                placeholder="Ej: Reembolso total, cambio de producto, disculpas formales, compensación, etc."
                className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-sm sm:text-base text-white placeholder:text-neutral-600 focus:border-bj-yellow focus:ring-2 focus:ring-bj-yellow/20 outline-none transition-all resize-none"
              ></textarea>
            </div>
          </section>

          {status === "error" && (
            <div className="p-5 sm:p-6 bg-red-500/10 border-2 border-red-500/50 text-red-200 rounded-2xl text-sm sm:text-base text-center">
              <div className="flex items-center justify-center mb-3">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
              <p className="font-bold mb-1">Error al enviar</p>
              <p className="text-xs sm:text-sm opacity-80">{message}</p>
            </div>
          )}
          
          {status === "success" ? (
            <div className="p-6 sm:p-8 bg-green-500/10 border-2 border-green-500/50 text-green-200 rounded-2xl text-center space-y-4">
              <div className="flex items-center justify-center mb-3">
                <Check className="w-12 h-12 text-green-400" />
              </div>
              <div>
                <p className="font-black text-xl sm:text-2xl text-white mb-2">¡Reclamo Enviado Correctamente!</p>
                <p className="text-sm sm:text-base">{message}</p>
                <p className="text-xs sm:text-sm opacity-70 mt-2">Se ha enviado una copia a la administración y recibirás una respuesta en 15 días hábiles.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setStatus(null)}
                className="mt-4 px-6 py-3 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-bold transition-all active:scale-95"
              >
                <FileText className="w-4 h-4 inline-block mr-2" /> Enviar otro reclamo
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full min-h-[64px] sm:min-h-[72px] bg-bj-yellow hover:bg-bj-yellow-hover text-black font-black text-base sm:text-lg rounded-2xl transition-all shadow-xl shadow-bj-yellow/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-3"
            >
              {status === "submitting" ? (
                <>
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ENVIANDO RECLAMO...
                </>
              ) : (
                <>
                  ENVIAR RECLAMO
                </>
              )}
            </button>
          )}

        </form>
      </div>
    </div>
  );
}
