const fs = require('fs');
const sharp = require('sharp');

async function generateOgImage() {
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

  <!-- Badge "DESDE S/ 15.90" rotado sobre la burger -->
  <g transform="translate(1015, 95) rotate(7)">
    <rect x="-85" y="-23" width="170" height="46" rx="8" fill="#FCC900" stroke="#0E0E11" stroke-width="3" filter="url(#pillShadow)" />
    <text x="0" y="7" text-anchor="middle" class="font-anton" font-size="23" fill="#0E0E11" letter-spacing="1">DESDE S/ 15.90</text>
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

  <!-- B. LOGO REAL DE BIG JACK (paths exactos de bigjacktitle.svg) -->
  <g transform="translate(65, 96) scale(0.68)">
    <!-- Path 1 (JACK - C y K) fill #FCC900 -->
    <path d="M409.492 1.27946C414.282 0.252132 426.037 2.05225 430.767 3.82612C442.8 8.33979 450.793 15.3984 456.352 26.9568V2.1461H480.154V40.5256C480.801 40.5365 481.446 40.5357 482.093 40.5233C499.493 40.1408 509.746 25.432 512.466 9.58206C512.723 8.07634 512.706 3.05409 513.46 2.2761C520.469 1.79697 531.143 2.13941 538.42 2.1461C538.697 9.14577 535.149 20.1693 531.904 26.285C527.233 35.1391 520.38 43.1945 511.387 47.8588C511.283 47.9118 506.225 50.6944 506.456 50.4492C507.599 51.1611 510.983 51.8586 512.356 52.6267C514.097 53.6021 515.776 54.4781 517.474 55.5465C531.396 64.301 538.623 80.4335 541.182 96.1386C541.338 97.0993 541.809 99.3328 541.338 100.083C538.926 100.39 530.486 100.209 527.634 100.199C524.592 100.212 519.703 100.37 516.824 100.061C516.048 99.5061 515.957 97.0473 515.88 96.0421C514.667 80.1034 505.082 64.7757 488.686 61.1187C487.265 60.8018 481.706 59.7346 480.573 60.2581C479.802 61.5565 480.164 71.221 480.164 73.5007L480.154 100.199H456.352L456.362 84.0573C456.362 82.8054 456.449 77.8044 456.253 76.8006C455.757 78.0976 451.889 83.6185 450.895 84.8429C434.638 104.832 401.662 106.469 382.08 90.5006C361.178 73.4584 359.118 38.2909 376.198 17.8844C384.859 7.53506 396.224 2.47765 409.492 1.27946ZM434.164 67.0983C434.536 66.2802 436.157 62.3588 436.651 61.9792C441.114 62.2602 450.692 65.6431 456.072 66.2257C456.798 65.2768 456.087 38.4338 456.357 34.8912C456.327 34.6936 456.295 34.4958 456.265 34.2982C454.589 34.2561 442.681 38.5358 440.102 39.2115C438.962 39.5104 437.278 40.3111 435.937 40.3715C434.134 35.8126 432.6 32.0536 428.918 28.5871C424.13 24.0803 417.108 22.0908 410.612 23.0424C393.428 25.2359 387.45 41.1681 389.354 56.6806C391.176 71.5013 402.222 81.5579 417.436 79.3841C424.909 78.2961 430.74 73.8028 434.164 67.0983Z" fill="#FCC900"/>
    <!-- Path 2 (BIG - B) fill #FFFFFF -->
    <path d="M0.640869 1.15582L32.2087 1.14492C47.6706 1.1261 67.6485 -0.339986 74.5266 17.3985V1.15582H119.404V20.2217H108.99V80.1432H119.404V85.2192V99.2092H74.5266V86.7618C63.4837 101.43 48.0081 99.224 31.6459 99.2216L0.640869 99.2092V1.15582ZM78.2457 72.5912C78.2531 74.2868 77.5319 79.3204 77.7642 79.8716C78.7507 80.4684 83.5965 80.1279 85.188 80.1432V20.2217H75.3411C77.8517 31.2012 74.2092 42.2419 63.8608 47.3749C63.0959 47.7544 60.974 48.3259 60.5119 48.805C61.6385 49.0593 61.9963 49.4496 62.9469 49.7504C67.798 51.2863 72.1952 55.3509 74.8586 59.8422C77.1751 63.6851 78.3498 68.1067 78.2457 72.5912ZM24.195 80.1432C30.5584 80.1626 46.907 81.3256 51.0034 77.2648C53.0836 75.2676 54.268 72.5159 54.2876 69.634C54.3008 67.2448 53.3316 63.7334 51.5625 61.9548C50.0474 60.4256 48.141 59.3413 46.0513 58.8199C42.7932 57.9839 28.5843 58.362 24.195 58.3536V80.1432ZM24.195 40.7733C30.0231 40.7944 45.0328 41.8898 48.8959 38.0187C49.9467 37.0191 50.3853 36.5382 51.0233 35.2435C52.8954 31.4429 52.2496 26.6579 49.3083 23.5518C46.1865 20.2554 41.0494 20.1811 36.8419 20.1787L24.195 20.2217V40.7733Z" fill="#FFFFFF"/>
    <!-- Path 3 (BIG - I & G) fill #FFFFFF -->
    <path d="M160.313 0.288848C162.185 0.0263822 164.667 0.100671 166.656 0.130631C181.81 0.357937 198.003 7.00698 205.456 20.8625C206.264 22.3687 208.696 26.9438 208.478 28.2378C206.916 29.1425 202.83 30.2256 200.931 30.9763C196.215 32.8381 190.909 34.8762 186.074 36.3527C185.387 36.1293 184.52 33.3724 184.086 32.5521C178.47 22.6839 167.514 19.8775 156.572 23.1083C145.142 26.4839 138.882 39.3426 139.645 50.9547C139.727 52.1965 139.668 53.3241 139.814 54.5067C140.28 58.2149 141.455 62.5928 143.295 65.9056C146.632 71.8963 152.241 76.295 158.86 78.112C171.711 81.7605 185.898 74.9696 189.454 61.9015C186.821 61.6693 182.283 61.8109 179.429 61.8111L160.809 61.8198V43.2491H183H212.133V99.2088H192.05V81.3767C190.837 83.9506 189.511 86.2059 187.691 88.4155C182.313 95.0292 174.505 99.2138 166.014 100.038C154.095 101.118 142.239 97.4038 133.068 89.7229C122.598 80.9825 116.828 68.9089 115.623 55.4575C113.026 26.4409 130.671 2.96452 160.313 0.288848Z" fill="#FFFFFF"/>
    <!-- Path 4 (JACK - A) fill #FCC900 -->
    <path d="M312.54 2.14603C315.521 2.14108 338.554 1.9118 339.509 2.43029C341.462 6.4017 345.119 17.4557 346.768 22.0278L361.012 61.5111L371.309 90.1712C371.994 92.1001 374.495 98.3918 374.644 99.9369C373.573 100.625 353.408 100.061 350.396 100.1C349.072 100.118 345.479 85.5136 343.959 83.0848C343.052 82.7345 341.011 82.8578 339.945 82.8667L319.488 82.8415C317.928 82.84 308.251 82.6084 307.882 83.2344C305.99 86.4273 303.865 97.6663 301.772 100.061C299.799 100.219 297.699 100.244 295.715 100.209C289.745 100.105 283.631 100.422 277.675 100.15L277.554 99.8775C279.116 93.9967 282.292 86.3971 284.384 80.5478C288.518 68.726 292.728 56.9314 297.014 45.1642L307.314 16.4739C308.474 13.2347 311.194 4.96556 312.54 2.14603ZM326.06 64.5436C328.222 64.5545 335.978 64.7296 337.689 64.4327C337.704 63.4586 327.109 31.9394 325.961 29.0374L317.184 54.9911C316.386 57.3357 314.923 62.4404 314.122 64.3596C315.136 64.7491 324.312 64.5513 326.06 64.5436Z" fill="#FCC900"/>
    <!-- Path 5 (JACK - J) fill #FCC900 -->
    <path d="M257.257 2.146H281.06L281.069 50.0329C281.069 58.285 281.322 67.3245 280.683 75.5302C280.033 79.3303 278.801 83.6258 277.006 86.9839C268.608 102.688 245.076 104.763 230.604 96.7328C227.616 95.0416 224.961 92.823 222.764 90.186C220.077 86.9604 215.165 77.6315 215.542 73.6296C216.836 72.8588 218.594 72.5055 220.109 72.0291C224.916 70.5164 229.997 69.285 234.727 67.6025C236.284 67.0486 235.598 67.1165 237.437 66.9065C237.774 67.4594 238.139 68.8658 238.231 69.5965C239.255 77.8221 247.528 83.4812 254.592 77.5267C257.788 74.8322 257.27 68.7448 257.267 64.5426L257.255 50.6319L257.257 2.146Z" fill="#FCC900"/>
  </g>

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
      <text x="38" y="26" class="font-poppins" font-weight="600" font-size="12" fill="#FFFFFF">Pje. Larrabure 142</text>
      <text x="162" y="26" class="font-poppins" font-weight="400" font-size="11" fill="#9CA3AF">· Lima Centro</text>
    </g>

    <!-- Badge 2: Horario -->
    <g transform="translate(282, 0)">
      <rect x="0" y="0" width="265" height="42" rx="8" fill="#131317" stroke="#262626" stroke-width="1.5" />
      <!-- Icono Clock SVG -->
      <g transform="translate(14, 12)" stroke="#FCC900" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="8.5" cy="8.5" r="7"/>
        <polyline points="8.5 4.5 8.5 8.5 11.5 10"/>
      </g>
      <text x="38" y="26" class="font-poppins" font-weight="600" font-size="12" fill="#FFFFFF">7:00 PM – 1:00 AM</text>
      <text x="166" y="26" class="font-poppins" font-weight="400" font-size="11" fill="#9CA3AF">· Todos los días</text>
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
      <text x="146" y="25" class="font-poppins" font-weight="400" font-size="11" fill="#9CA3AF">· 15 a 20 min</text>
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
      <text x="22" y="17" class="font-poppins" font-weight="700" font-size="16" fill="#FFFFFF" letter-spacing="0.5">bigjack.pe</text>
      <text x="114" y="17" class="font-poppins" font-weight="400" font-size="13" fill="#9CA3AF">· Pedidos directos</text>
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
