// Inserta datos estructurados schema.org. `<` se escapa para que el JSON
// no pueda cerrar la etiqueta <script>.
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
