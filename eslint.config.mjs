import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // Hidratar estado desde localStorage es un efecto de sincronización
      // legítimo; se revisará al terminar de extraer los hooks de la Fase 6.
      "react-hooks/set-state-in-effect": "off",
      // Presupuesto de tamaño (Fase 6.0). Los archivos listados abajo se
      // sacan de la excepción a medida que se dividen.
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: [
      "app/reto-gamer/page.js",
      "app/page.js",
      "app/features/home/components/CartDrawer.js",
      "app/libro-de-reclamaciones/page.js",
      "app/links/page.js",
    ],
    rules: {
      "max-lines": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
