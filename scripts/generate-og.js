const fs = require('fs');
const sharp = require('sharp');
const opentype = require('opentype.js');

// Ancho real de un texto con Poppins (para ubicar el texto que va a continuación).
const poppinsMetrics = {
  600: opentype.loadSync('scripts/fonts/Poppins-SemiBold.ttf'),
  700: opentype.loadSync('scripts/fonts/Poppins-Bold.ttf'),
};
const textWidth = (text, size, weight = 600) => poppinsMetrics[weight].getAdvanceWidth(text, size);

// "19:00" → "7 PM" (forma corta para piezas gráficas, manual §8.2).
function shortTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = h % 12 || 12;
  return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
}

async function generateOgImage() {
  // Datos del negocio desde la fuente única (precio, horario, dirección, dominio).
  const { menuItems, restaurantInfo } = await import('../app/data/menuData.js');
  const { SITE_URL } = await import('../app/lib/site.js');
  const { groupSchedule } = await import('../app/lib/schedule.js');

  const burgerFrom = Math.min(
    ...menuItems
      .filter((item) => item.category === 'LAS INTOCABLES' && item.available !== false)
      .flatMap((item) => item.options.map((option) => option.price))
  );
  const priceText = `DESDE S/ ${burgerFrom.toFixed(2)}`;
  const firstOpenDay = Object.values(restaurantInfo.hours).find(Boolean);
  const hoursText = `${shortTime(firstOpenDay.open)} – ${shortTime(firstOpenDay.close)}`;
  const daysText = `· ${groupSchedule().filter((g) => g.hours !== 'Cerrado').map((g) => g.days).join(', ')}`;
  const street = restaurantInfo.address.street;
  const prep = restaurantInfo.prepTimeMinutes;
  const prepText = `· ${prep.min} a ${prep.max} min`;
  const domain = new URL(SITE_URL).host;
  const antonFontBase64 = fs.readFileSync('scripts/fonts/Anton-Regular.ttf').toString('base64');
  const poppinsBoldBase64 = fs.readFileSync('scripts/fonts/Poppins-Bold.ttf').toString('base64');
  const poppinsSemiBase64 = fs.readFileSync('scripts/fonts/Poppins-SemiBold.ttf').toString('base64');
  const poppinsRegBase64 = fs.readFileSync('scripts/fonts/Poppins-Regular.ttf').toString('base64');

  // Dimensiones
  const width = 1200;
  const height = 630;

  // Cargar el recorte de la burger (WebP con transparencia) y redimensionar
  const burgerBuffer = await sharp('public/images/burger-hero.webp')
    .png()
    .resize({ width: 525, fit: 'inside' })
    .toBuffer();
  const burgerBase64 = burgerBuffer.toString('base64');

  // Logo oficial (generado por scripts/brand/build.mjs), ubicado en la esquina superior izquierda.
  const logoSvg = fs.readFileSync('public/brand/logo-horizontal.svg', 'utf8');
  const [vx, vy, vw, vh] = logoSvg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const logoScale = Math.min(380 / vw, 110 / vh);
  const brandLogo = `<g transform="translate(${65 - vx * logoScale} ${92 - vy * logoScale}) scale(${logoScale})">${logoSvg.replace(/^<svg[^>]*>|<\/svg>$/g, '').replace(/<title>.*?<\/title>/, '')}</g>`;

  // SVG con el diseño refinado
  const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Anton';
        src: url('data:font/truetype;charset=utf-8;base64,${antonFontBase64}') format('truetype');
      }
      @font-face {
        font-family: 'Poppins';
        font-weight: 700;
        src: url('data:font/truetype;charset=utf-8;base64,${poppinsBoldBase64}') format('truetype');
      }
      @font-face {
        font-family: 'Poppins';
        font-weight: 600;
        src: url('data:font/truetype;charset=utf-8;base64,${poppinsSemiBase64}') format('truetype');
      }
      @font-face {
        font-family: 'Poppins';
        font-weight: 400;
        src: url('data:font/truetype;charset=utf-8;base64,${poppinsRegBase64}') format('truetype');
      }

      .font-anton { font-family: 'Anton', Impact, sans-serif; }
      .font-poppins { font-family: 'Poppins', sans-serif; }
    </style>

    <!-- Patrón de retícula streetwear (30x30) -->
    <pattern id="streetGrid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.038)" stroke-width="1"/>
    </pattern>

    <!-- Resplandor radial cálido detrás de la burger -->
    <radialGradient id="burgerGlow" cx="74%" cy="46%" r="42%">
      <stop offset="0%" stop-color="#FCC900" stop-opacity="0.24" />
      <stop offset="45%" stop-color="#FCC900" stop-opacity="0.08" />
      <stop offset="85%" stop-color="#0E0E11" stop-opacity="0" />
    </radialGradient>

    <!-- Sombra profunda para la burger -->
    <filter id="burgerShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="30" flood-color="#000000" flood-opacity="0.95" />
    </filter>

    <filter id="pillShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- 1. Fondo base negro asfalto (#0E0E11) -->
  <rect width="100%" height="100%" fill="#0E0E11" />

  <!-- 2. Textura de retícula urbana -->
  <rect width="100%" height="100%" fill="url(#streetGrid)" />

  <!-- 3. Resplandor dorado cálido -->
  <rect width="100%" height="100%" fill="url(#burgerGlow)" />

  <!-- 4. Acentos de marca perimetrales (Brutalismo streetwear) -->
  <rect x="0" y="0" width="${width}" height="5" fill="#FCC900" />
  <rect x="0" y="${height - 5}" width="${width}" height="5" fill="#FCC900" />
  <rect x="0" y="0" width="5" height="${height}" fill="#FCC900" />
  <rect x="${width - 5}" y="0" width="5" height="${height}" fill="#FCC900" />

  <!-- ================= LADO DERECHO: BURGER HERO PROTAGONISTA ================= -->
  <!-- Sombra en la base de la hamburguesa -->
  <ellipse cx="915" cy="510" rx="210" ry="26" fill="rgba(0,0,0,0.85)" filter="blur(16px)" />

  <!-- Imagen de la burger real -->
  <g transform="translate(650, 28)" filter="url(#burgerShadow)">
    <image href="data:image/png;base64,${burgerBase64}" width="525" height="525" preserveAspectRatio="xMidYMid meet" />
  </g>

  <!-- Badge de precio "DESDE" (hamburguesa más barata) rotado sobre la burger -->
  <g transform="translate(1015, 95) rotate(7)">
    <rect x="-85" y="-23" width="170" height="46" rx="8" fill="#FCC900" stroke="#0E0E11" stroke-width="3" filter="url(#pillShadow)" />
    <text x="0" y="7" text-anchor="middle" class="font-anton" font-size="23" fill="#0E0E11" letter-spacing="1">${priceText}</text>
  </g>

  <!-- Badge "HIT LIMEÑO" -->
  <g transform="translate(675, 475) rotate(-5)">
    <rect x="-65" y="-17" width="130" height="34" rx="6" fill="#1F1F24" stroke="#FCC900" stroke-width="2" filter="url(#pillShadow)" />
    <text x="0" y="5" text-anchor="middle" class="font-poppins" font-weight="700" font-size="12" fill="#FCC900" letter-spacing="1.8">★ HIT LIMEÑO</text>
  </g>

  <!-- ================= LADO IZQUIERDO: INFORMACIÓN IMPORTANTE ================= -->

  <!-- A. Tag streetwear superior -->
  <g transform="translate(65, 48)">
    <rect x="0" y="0" width="310" height="30" rx="6" fill="#1F1F24" stroke="#33333D" stroke-width="1.5" />
    <text x="15" y="20" class="font-poppins" font-weight="700" font-size="12" fill="#FCC900" letter-spacing="1.5">[ CARNE 100% RES · LIMA CENTRO ]</text>
  </g>

  <!-- B. LOGO BIG JACK (vector oficial de public/brand/logo-horizontal.svg) -->
  ${brandLogo}

  <!-- C. TITULAR DISPLAY GRANDE (Anton) -->
  <g transform="translate(65, 224)">
    <text x="0" y="0" class="font-anton" font-size="52" fill="#FFFFFF" letter-spacing="1.5">HAMBURGUESAS</text>
    <text x="0" y="55" class="font-anton" font-size="52" fill="#FCC900" letter-spacing="1.5">GRUESAS <tspan fill="#FFFFFF">A LA PLANCHA</tspan></text>
  </g>

  <!-- D. SUBTÍTULO / PROPUESTA DE VALOR -->
  <text x="65" y="318" class="font-poppins" font-weight="600" font-size="17" fill="#E5E7EB">
    Carne 100% de res, queso derretido y salsas de la casa.
  </text>
  <text x="65" y="344" class="font-poppins" font-weight="400" font-size="15" fill="#9CA3AF">
    No vendemos humo. Vendemos carne, fuego y barrio.
  </text>

  <!-- E. BLOQUE DE INFORMACIÓN IMPORTANTE (Badges con iconos vectoriales limpios) -->
  <g transform="translate(65, 376)">
    <!-- Badge 1: Ubicación -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="270" height="42" rx="8" fill="#131317" stroke="#262626" stroke-width="1.5" />
      <!-- Icono MapPin SVG -->
      <g transform="translate(14, 12)" stroke="#FCC900" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 6.667C14 11.333 8 16 8 16S2 11.333 2 6.667a6 6 0 0 1 12 0Z"/>
        <circle cx="8" cy="6.667" r="2"/>
      </g>
      <text x="38" y="26" class="font-poppins" font-weight="600" font-size="12" fill="#FFFFFF">${street}</text>
      <text x="${44 + textWidth(street, 12)}" y="26" class="font-poppins" font-weight="400" font-size="11" fill="#9CA3AF">· Lima Centro</text>
    </g>

    <!-- Badge 2: Horario -->
    <g transform="translate(282, 0)">
      <rect x="0" y="0" width="265" height="42" rx="8" fill="#131317" stroke="#262626" stroke-width="1.5" />
      <!-- Icono Clock SVG -->
      <g transform="translate(14, 12)" stroke="#FCC900" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="8.5" cy="8.5" r="7"/>
        <polyline points="8.5 4.5 8.5 8.5 11.5 10"/>
      </g>
      <text x="38" y="26" class="font-poppins" font-weight="600" font-size="12" fill="#FFFFFF">${hoursText}</text>
      <text x="${44 + textWidth(hoursText, 12)}" y="26" class="font-poppins" font-weight="400" font-size="11" fill="#9CA3AF">${daysText}</text>
    </g>
  </g>

  <!-- F. MODALIDADES Y SERVICIO -->
  <g transform="translate(65, 430)">
    <!-- Badge 3: Delivery -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="270" height="40" rx="8" fill="#131317" stroke="#262626" stroke-width="1.5" />
      <!-- Icono Truck SVG -->
      <g transform="translate(13, 11)" stroke="#FCC900" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="2" width="11" height="9" rx="1"/>
        <polygon points="12 5 16 5 17 8 17 11 12 11"/>
        <circle cx="4.5" cy="12.5" r="1.8"/>
        <circle cx="13.5" cy="12.5" r="1.8"/>
      </g>
      <text x="38" y="25" class="font-poppins" font-weight="600" font-size="12" fill="#FFFFFF">Delivery Lima Centro</text>
      <text x="180" y="25" class="font-poppins" font-weight="400" font-size="11" fill="#9CA3AF">y aledaños</text>
    </g>

    <!-- Badge 4: Recojo rápido -->
    <g transform="translate(282, 0)">
      <rect x="0" y="0" width="265" height="40" rx="8" fill="#131317" stroke="#262626" stroke-width="1.5" />
      <!-- Icono Zap SVG -->
      <g transform="translate(14, 11)" stroke="#FCC900" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="10 1 2 10 7.5 10 6 16 14 7 8.5 7 10 1"/>
      </g>
      <text x="38" y="25" class="font-poppins" font-weight="600" font-size="12" fill="#FFFFFF">Recojo al toque</text>
      <text x="${44 + textWidth('Recojo al toque', 12)}" y="25" class="font-poppins" font-weight="400" font-size="11" fill="#9CA3AF">${prepText}</text>
    </g>
  </g>

  <!-- G. CALL TO ACTION / CARTA DIGITAL -->
  <g transform="translate(65, 502)">
    <!-- Botón primario streetwear -->
    <rect x="0" y="0" width="255" height="52" rx="10" fill="#FCC900" stroke="#000000" stroke-width="2.5" filter="url(#pillShadow)" />
    <text x="127" y="33" text-anchor="middle" class="font-anton" font-size="20" fill="#0E0E11" letter-spacing="1.2">PIDE EN LA CARTA ONLINE</text>

    <!-- Web oficial con badge status verde -->
    <g transform="translate(274, 14)">
      <circle cx="8" cy="12" r="5" fill="#22C55E" />
      <text x="22" y="17" class="font-poppins" font-weight="700" font-size="16" fill="#FFFFFF" letter-spacing="0.5">${domain}</text>
      <text x="${30 + textWidth(domain, 16, 700) + domain.length * 0.5}" y="17" class="font-poppins" font-weight="400" font-size="13" fill="#9CA3AF">· Pedidos directos</text>
    </g>
  </g>
</svg>
`;

  console.log('Generating refined OG Image...');
  const finalImage = await sharp(Buffer.from(svg))
    .png({ quality: 95, compressionLevel: 8 })
    .toBuffer();

  fs.writeFileSync('public/images/og-bigjack.png', finalImage);
  console.log('Saved public/images/og-bigjack.png (' + finalImage.length + ' bytes)');

  // También generamos og-bigjack.jpg
  const jpgImage = await sharp(finalImage)
    .jpeg({ quality: 90 })
    .toBuffer();
  fs.writeFileSync('public/images/og-bigjack.jpg', jpgImage);
  console.log('Saved public/images/og-bigjack.jpg (' + jpgImage.length + ' bytes)');
}

generateOgImage().catch(console.error);
