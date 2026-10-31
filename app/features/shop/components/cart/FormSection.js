// Bloque del checkout: un título corto y aire, sin cajas.
export default function FormSection({ title, children }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-4 font-anton text-2xl uppercase tracking-wide text-white">{title}</legend>
      {children}
    </fieldset>
  );
}
