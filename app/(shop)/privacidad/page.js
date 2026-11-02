import Link from "next/link";
import { restaurantInfo } from "../../data/menuData";
import { formatPhone, whatsappUrl } from "../../lib/site";

export const metadata = {
  title: "Política de Privacidad",
  description: `Política de Privacidad y Tratamiento de Datos Personales de ${restaurantInfo.name}, conforme a la Ley N.° 29733 (Perú).`,
  alternates: { canonical: "/privacidad" },
  openGraph: {
    title: `Política de Privacidad | ${restaurantInfo.name}`,
    description: `Conoce cómo tratamos y protegemos tus datos personales en ${restaurantInfo.name}.`,
    url: "/privacidad",
    siteName: restaurantInfo.name,
    locale: "es_PE",
    type: "website",
  },
};

export default function PrivacidadPage() {
  const legalName = restaurantInfo.legalName;
  const address = restaurantInfo.address?.full || `${restaurantInfo.address?.street}, ${restaurantInfo.address?.area}`;

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
      <header className="mb-12 border-b border-neutral-800 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-bj-yellow">Aviso Legal</p>
        <h1 className="mt-3 font-anton text-4xl uppercase tracking-wide text-white sm:text-6xl">
          Política de <span className="text-bj-yellow">Privacidad</span>
        </h1>
        <p className="mt-4 text-sm text-neutral-400">
          Última actualización: 1 de noviembre de 2026. Conforme a la Ley N.° 29733 (Ley de Protección de Datos Personales del Perú) y su Reglamento.
        </p>
      </header>

      <div className="space-y-10 text-base leading-relaxed text-neutral-300">
        <section>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-white">1. Responsable del Tratamiento</h2>
          <p className="mt-3">
            El titular y responsable del tratamiento de los datos personales recopilados a través de este sitio web es{" "}
            <strong className="text-white">{legalName}</strong>
            {restaurantInfo.ruc && ` con RUC N.° ${restaurantInfo.ruc}`}, con domicilio físico en {address}, Lima, Perú.
          </p>
        </section>

        <section>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-white">2. Datos que Recopilamos</h2>
          <p className="mt-3">
            Recopilamos únicamente la información necesaria para gestionar tus pedidos y brindarte una buena experiencia:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong className="text-white">Datos para pedidos:</strong> Nombre y apellido, número de teléfono/WhatsApp, dirección de entrega (para pedidos con delivery) y notas específicas para la cocina.
            </li>
            <li>
              <strong className="text-white">Datos de navegación y técnicos:</strong> Dirección IP, identificador de dispositivo y datos de navegación anónimos o seudonimizados mediante Google Analytics y Google Tag Manager, con el fin exclusivo de medir el rendimiento y mejorar la web.
            </li>
            <li>
              <strong className="text-white">Verificación de seguridad:</strong> Utilizamos Cloudflare Turnstile para verificar que las solicitudes de pedidos provengan de personas reales y prevenir ataques automatizados.
            </li>
            <li>
              <strong className="text-white">Libro de Reclamaciones:</strong> En caso de presentar un reclamo o queja, recopilamos los datos requeridos por el Código de Protección y Defensa del Consumidor (Ley N.° 29571): nombres, documento de identidad (DNI/CE), domicilio, teléfono y correo electrónico.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-white">3. Finalidad del Tratamiento</h2>
          <p className="mt-3">Tus datos personales son tratados con las siguientes finalidades específicas:</p>
          <ol className="mt-3 list-decimal space-y-2 pl-6">
            <li>Procesar, registrar, preparar y entregar tu pedido en el local o mediante servicio de delivery.</li>
            <li>Comunicarnos contigo a través de WhatsApp para coordinar el pago, el despacho o resolver cualquier duda sobre tu pedido.</li>
            <li>
              Facilitar tus futuras compras mediante almacenamiento en tu propio navegador (<code className="rounded bg-neutral-900 px-1.5 py-0.5 text-xs text-bj-yellow">localStorage</code>), recordando tu nombre y teléfono para que no tengas que escribirlos cada vez.
            </li>
            <li>Cumplir con las obligaciones legales aplicables en materia de atención al consumidor.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-white">4. Almacenamiento Local y Cookies</h2>
          <p className="mt-3">
            Para que no tengas que llenar tus datos de entrega en cada visita, la web guarda tu nombre, teléfono y dirección en el almacenamiento local de tu navegador (<code className="rounded bg-neutral-900 px-1.5 py-0.5 text-xs text-neutral-300">localStorage</code>). Estos datos residen exclusivamente en tu propio teléfono o computadora, no en servidores publicitarios. Puedes borrarlos en cualquier momento limpiando los datos de navegación de tu navegador.
          </p>
        </section>

        <section>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-white">5. Transferencia y Terceros</h2>
          <p className="mt-3">
            No vendemos, comercializamos ni alquilamos tus datos personales a terceros bajo ninguna circunstancia.
          </p>
          <p className="mt-3">
            Tus datos únicamente se comparten con los proveedores indispensables para completar el servicio:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong className="text-white">Repartidores / Servicios de mensajería (inDrive / Rappi):</strong> Exclusivamente los datos de entrega (nombre, dirección y teléfono) para que el repartidor pueda llevarte el pedido.
            </li>
            <li>
              <strong className="text-white">Proveedor de hosting y seguridad (Vercel / Cloudflare):</strong> Para la infraestructura técnica del sitio y la protección contra bots.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-white">6. Derechos ARCO</h2>
          <p className="mt-3">
            De acuerdo con la Ley N.° 29733, puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) sobre tus datos personales en cualquier momento.
          </p>
          <p className="mt-3">
            Para ejercer estos derechos, simplemente escríbenos a nuestro WhatsApp oficial:{" "}
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-bj-yellow underline underline-offset-4"
            >
              {formatPhone()}
            </a>
            , o acércate a nuestro local en {address}. Atenderemos tu solicitud dentro de los plazos legales establecidos.
          </p>
        </section>

        <section>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-white">7. Modificaciones</h2>
          <p className="mt-3">
            Nos reservamos el derecho de actualizar esta Política de Privacidad para adaptarla a novedades legislativas o mejoras en nuestros servicios. Cualquier cambio será publicado en este enlace indicando la fecha de última actualización.
          </p>
        </section>
      </div>

      <footer className="mt-16 border-t border-neutral-800 pt-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-bj-yellow underline-offset-4 hover:underline"
        >
          ← Volver a la carta
        </Link>
      </footer>
    </article>
  );
}

