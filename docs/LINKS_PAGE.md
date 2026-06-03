# Página de Links - Big Jack

## 📍 Acceso
- **URL:** `/links`
- **Propósito:** Página tipo Linktree para centralizar todos los enlaces y CTAs de Big Jack

## 🎯 Objetivos principales

1. **Reseñas Google Maps** (CTA principal destacado)
   - Link directo: https://g.page/r/CRukRtdfadmpEAE/review
   - Diseño hero con gradiente llamativo
   - Mensaje claro invitando a dejar reseña

2. **Programa de Lealtad**
   - Sección visual con beneficios (descuentos, puntos, recompensas)
   - CTA para preguntar por WhatsApp

3. **Enlaces principales**
   - Ver Menú Digital (/)
   - WhatsApp
   - PedidosYa Delivery
   - Redes sociales (Instagram, TikTok, Google Maps)

## 🎨 Características de diseño

### Visual
- Fondo degradado oscuro con elementos decorativos
- Avatar circular con logo/emoji
- Tarjetas con gradientes únicos para cada link
- Iconos de lucide-react
- Animaciones suaves (fade-in, slide-in)
- Responsive mobile-first

### UX
- CTAs claros con descripciones
- Hover states y transiciones suaves
- Loading state inicial
- Enlaces externos abren en nueva pestaña
- Accesible desde footer del menú principal

## 📱 Secciones

1. **Header/Profile**
   - Logo/avatar Big Jack
   - Nombre y slogan
   - Ubicación y horarios resumidos

2. **CTA Hero - Review**
   - Destacado con gradiente amarillo-naranja-rojo
   - Badge "¡Necesitamos tu opinión!"
   - Botón principal blanco

3. **Links principales**
   - Menú Digital
   - WhatsApp
   - PedidosYa
   - Cada uno con icono, título, descripción y chevron

4. **Programa de Lealtad**
   - 3 tarjetas de beneficios
   - Diseño grid responsive
   - CTA secundario

5. **Redes Sociales**
   - Grid de 3 columnas
   - Instagram, TikTok, Google Maps
   - Colores branded

6. **Footer**
   - Mensaje de amor
   - Copyright y RUC
   - Link de regreso al menú

## 🔗 Links integrados

```javascript
// Review principal
https://g.page/r/CRukRtdfadmpEAE/review

// Menú
/

// WhatsApp
https://wa.me/51970513912

// PedidosYa
https://www.pedidosya.com.pe/restaurantes/lima/big-jack-...

// Instagram
https://instagram.com/bigjackpe

// TikTok
(desde menuData.js)

// Google Maps
(desde menuData.js)
```

## 💡 Cómo usarlo

### Compartir con clientes
1. Envía el link `/links` por WhatsApp después de cada pedido
2. Añádelo a tus stories/bio de Instagram y TikTok
3. Usa QR code impreso en local apuntando a `/links`

### Incentivar reseñas
- El diseño prioriza el CTA de review en Google
- Puedes ofrecer descuentos a cambio de reseñas verificadas
- El mensaje es amigable y no agresivo

### Programa de lealtad
- Usa la sección para comunicar beneficios
- Los clientes preguntan por WhatsApp para unirse
- Actualiza los beneficios editando el array `benefits` en el código

## 🛠️ Personalización

Edita `app/links/page.js`:

```javascript
// Cambiar orden de links
const mainLinks = [...];

// Editar beneficios del programa
const benefits = [...];

// Modificar redes sociales
const socialLinks = [...];
```

## 📊 Métricas sugeridas

Trackea en Google Analytics:
- Clicks al link de review
- Clicks a redes sociales
- Tiempo en página
- Conversión a menú digital

## 🚀 Mejoras futuras

- [ ] Integrar contador de reseñas actual
- [ ] Sistema de referidos con código único
- [ ] Sección de testimonios destacados
- [ ] Galería de fotos de clientes
- [ ] Formulario de suscripción a newsletter
- [ ] Calendario de eventos/promociones
