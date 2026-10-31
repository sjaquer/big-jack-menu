"use client";

"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import { menuItems, restaurantInfo, categories } from "../../data/menuData";
import { formatMsToCountdown } from "../../lib/openHours";
import { readJson, removeItem, writeJson } from "../../lib/safeStorage";
import SiteHeader from "../../components/SiteHeader";
import Toast from "../../components/Toast";
import ClientSearchParams from "./components/ClientSearchParams";
import CartDrawer from "./components/CartDrawer";
import { submitOnlineOrder } from "./checkout/submitOrder";
import {
  buildDeliveryPaymentReminder,
  buildFriendlyOrderError,
  buildWhatsappOrderMessage,
  normalizePhoneForDisplay,
  PAYMENT_LABELS,
} from "./checkout/orderMessages";
import {
  COMPLEMENT_CATEGORIES,
  MAX_CART_ITEMS,
  MAX_QTY_PER_ITEM,
  PEDIDOSYA_LINK,
  RAPPI_LINK,
  PRIMARY_CATEGORIES,
  SIDES_CATEGORY,
} from "./constants";
import { getHeroPriceRange } from "./seo";
import useCart from "./hooks/useCart";
import useCheckoutForm from "./hooks/useCheckoutForm";
import useOpenStatus from "./hooks/useOpenStatus";
import useToast from "./hooks/useToast";
import { CartProvider } from "./context/CartContext";

import HeroSection from "./components/HeroSection";
import CategoryFilter from "./components/CategoryFilter";
import MenuGrid from "./components/MenuGrid";
import LocationSection from "./components/LocationSection";
import ProductModal from "./components/ProductModal";
import SuggestionModal from "./components/SuggestionModal";
import OrderConfirmation from "./components/OrderConfirmation";
import FooterSection from "./components/FooterSection";
import FloatingCartBar from "./components/FloatingCartBar";
import ClosedNotice from "./components/ClosedNotice";

export default function HomeClient() {
  const {
    cart,
    total,
    itemsCount,
    hasPrimaryProduct,
    addToCart: addCartItem,
    addMany,
    removeFromCart: removeCartItem,
    updateQuantity: updateCartQuantity,
    clearCart: clearCartState,
  } = useCart({ menuItems });
  const { isOpen, nextOpenMs } = useOpenStatus();
  const { toast, showToast, dismissToast, confirmToast } = useToast();
  const {
    orderType,
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryReference,
    deliveryDetails,
    locationLink,
    paymentMethod,
    notes,
    setOrderType,
    setCustomerName,
    setCustomerPhone,
    setDeliveryAddress,
    setDeliveryReference,
    setDeliveryDetails,
    setLocationLink,
    setPaymentMethod,
    setNotes,
    resetAfterOrder,
  } = useCheckoutForm();

  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [autoLocationAttempted, setAutoLocationAttempted] = useState(false);
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
  const [cartNotice, setCartNotice] = useState("");
  const cartNoticeTimerRef = useRef(null);

  const showCartNotice = useCallback((message) => {
    setCartNotice(message);
    if (cartNoticeTimerRef.current) clearTimeout(cartNoticeTimerRef.current);
    cartNoticeTimerRef.current = setTimeout(() => setCartNotice(""), 6000);
  }, []);

  const clearCartNotice = useCallback(() => {
    if (cartNoticeTimerRef.current) clearTimeout(cartNoticeTimerRef.current);
    setCartNotice("");
  }, []);

  useEffect(() => {
    if (readJson("bj_preorder", false)) setIsPreOrder(true);
  }, []);

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

  const modalSelectedOption = useMemo(() => {
    const product = modalProduct || activeModalProduct;
    if (!product) return null;
    return product.options?.find((opt) => opt.id === modalOptionId) || product.options?.[0] || null;
  }, [modalProduct, activeModalProduct, modalOptionId]);

  const isProductAvailable = (product) => {
    if (!product) return false;
    const canonicalProduct = menuItems.find((entry) => entry.id === product.id);
    if (!canonicalProduct) return false;
    if (canonicalProduct.available === false) return false;
    if (product.available === false) return false;
    return true;
  };

  const openProductModal = (product, optionId) => {
    if (!isProductAvailable(product)) {
      showToast({ type: "error", message: "Este producto no está disponible en este momento." });
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

  const addToCart = (product, option, showSuggestion = true, quantity = 1) => {
    const addingAsPreorder = !isOpen;
    if (!option) {
      showToast({ type: "error", message: "No encontramos una presentación válida para este producto." });
      return;
    }
    if (!isProductAvailable(product)) {
      showToast({ type: "error", message: "Este producto no está disponible en este momento." });
      return;
    }
    const validOption = product.options?.find((opt) => opt.id === option.id) || product.options?.[0];
    if (!validOption) {
      showToast({ type: "error", message: "No encontramos una presentación válida para este producto." });
      return;
    }
    const isComplementProduct = COMPLEMENT_CATEGORIES.includes(product.category);
    if (isComplementProduct && !hasPrimaryProduct) {
      showToast({
        type: "info",
        message: "Para añadir bebidas primero agrega una hamburguesa.",
      });
      return;
    }
    const uniqueId = `${product.id}-${validOption.id || "default"}`;
    const result = addCartItem(product, validOption, quantity);

    if (result.added === 0) {
      showCartNotice(
        result.reason === "max_items"
          ? `Tu pedido no puede tener más de ${MAX_CART_ITEMS} productos en total.`
          : `La cantidad máxima por producto es de ${MAX_QTY_PER_ITEM} unidades.`
      );
      return;
    }

    if (result.added < quantity) {
      showCartNotice(
        `Agregamos ${result.added} unidad(es): llegaste al máximo de ${MAX_QTY_PER_ITEM} por producto.`
      );
    }

    setSubmitResult(null);
    setRecentlyAdded(uniqueId);

    // Lógica inteligente de sugerencias (Smart Upselling)
    if (showSuggestion) {
      const willHaveFries = cart.some((i) => i.category === SIDES_CATEGORY) || product.category === SIDES_CATEGORY;
      const willHaveDrink = cart.some((i) => i.category === "BEBIDAS") || product.category === "BEBIDAS";
      const isBurger = PRIMARY_CATEGORIES.includes(product.category);

      if (isBurger && (!willHaveFries || !willHaveDrink)) {
        setSuggestionVisible(true);
      }
    }
    setSuggestionFor({ productId: product.id, uniqueId });

    if (addingAsPreorder) {
      setIsPreOrder(true);
      writeJson("bj_preorder", true);
      setClosedNoticeHidden(true);
    }
    setTimeout(() => {
      setRecentlyAdded((current) => (current === uniqueId ? null : current));
    }, 1200);
  };

  const handleAddProduct = (product, optionId) => {
    if (!isProductAvailable(product)) {
      showToast({ type: "error", message: "Este producto no está disponible en este momento." });
      return;
    }
    const option = product.options?.find((opt) => opt.id === optionId) || product.options?.[0];
    addToCart(product, option);
  };

  const removeFromCart = (id) => {
    const result = removeCartItem(id);

    if (result.removed.length > 0) {
      const names = [...new Set(result.removed.map((item) => item.name))].join(", ");
      showCartNotice(
        `Quitamos ${names} porque el pedido debe incluir una hamburguesa.`
      );
    }
    if (result.items.length === 0) {
      setIsPreOrder(false);
      removeItem("bj_preorder");
    }
    setSubmitResult(null);
    setOrderConfirmation(null);
  };

  const clearCart = () => {
    clearCartState();
    setSubmitResult(null);
    setOrderConfirmation(null);
    setIsPreOrder(false);
    removeItem("bj_preorder");
  };

  const updateQuantity = (id, delta) => {
    const result = updateCartQuantity(id, delta);
    if (!result.updated) {
      showCartNotice(
        result.reason === "max_items"
          ? `Tu pedido no puede tener más de ${MAX_CART_ITEMS} productos en total.`
          : `La cantidad máxima por producto es de ${MAX_QTY_PER_ITEM} unidades.`
      );
      return;
    }

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
    const entries = [
      { product: suggestedGuarn, quantity: suggestedPapasQty },
      { product: suggestedInka, quantity: suggestedInkaQty },
      { product: suggestedCoca, quantity: suggestedCocaQty },
    ]
      .filter(({ product, quantity }) => product && quantity > 0)
      .map(({ product, quantity }) => ({
        product,
        option: product.options?.[0],
        quantity,
      }));

    const { limitReached } = addMany(entries);

    if (limitReached) {
      showCartNotice(
        `No pudimos agregar todo: el límite es ${MAX_QTY_PER_ITEM} por producto y ${MAX_CART_ITEMS} en total.`
      );
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
      if (!silent) {
        showToast({
          type: "error",
          message: "Tu navegador no soporta geolocalización.",
        });
      }
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationLink(link);
        if (!silent) {
          showToast({
            type: "success",
            message: "¡Ubicación lista! La usaremos para coordinar tu delivery por inDrive.",
          });
        }
        if (!deliveryReference.trim()) {
          setDeliveryReference("Ubicación compartida por GPS");
        }
        setIsLocating(false);
      },
      () => {
        if (!silent) {
          showToast({
            type: "error",
            message:
              "No pudimos obtener tu ubicación automáticamente. Escribe tu dirección o pega un enlace de Google Maps.",
          });
        }
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, [deliveryReference, setDeliveryReference, setLocationLink, showToast]);

  const handleSelectOrderType = (type) => {
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

      clearCartState();
      resetAfterOrder();
      setIsPreOrder(false);
      removeItem("cart");
      removeItem("bj_preorder");
    } catch (error) {
      const friendlyError = buildFriendlyOrderError(error?.message);
      showToast({ type: "error", message: friendlyError, duration: 8000 });
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
    <div className="flex flex-col min-h-screen bg-[#0F0F12] text-white font-sans overflow-x-hidden">
      <SiteHeader
        cartCount={itemsCount}
        onCartClick={() => setIsCartOpen(!isCartOpen)}
      />
      <Toast toast={toast} onDismiss={dismissToast} onConfirm={confirmToast} />

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

      <CartProvider
        value={{
          isCartOpen,
          setIsCartOpen,
          cart,
          menuItems,
          openProductModal,
          updateQuantity,
          removeFromCart,
          orderType,
          handleSelectOrderType,
          customerName,
          setCustomerName,
          customerPhone,
          setCustomerPhone,
          deliveryAddress,
          setDeliveryAddress,
          deliveryReference,
          setDeliveryReference,
          deliveryDetails,
          setDeliveryDetails,
          locationLink,
          isLocating,
          getUserLocation,
          setLocationLink,
          isOpen,
          isPreOrder,
          restaurantInfo,
          PEDIDOSYA_LINK,
          RAPPI_LINK,
          paymentMethod,
          setPaymentMethod,
          notes,
          setNotes,
          clearCart,
          total,
          submitOrderToSystem,
          isSubmittingOrder,
          submitResult,
          cartNotice,
          onDismissCartNotice: clearCartNotice,
          onToast: showToast,
        }}
      >
        <CartDrawer />
      </CartProvider>

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
