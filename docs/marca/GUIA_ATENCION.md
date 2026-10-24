# Guía de Atención — BIG JACK

**Versión:** 1.0 · **Fecha:** 2026-10-24 · Parte del [Manual de Marca](./MANUAL_DE_MARCA.md).
**Canales:** WhatsApp (`restaurantInfo.contact.whatsapp`), DMs y comentarios de Instagram, TikTok y Facebook, reseñas de Google Maps.

> **En la venta, el tío. En la queja, el vecino serio.** Primero se resuelve; el cariño va después.

---

## 1. Reglas de oro ✅

1. **Nadie se ignora.** Aunque sea una queja fea: respeto y solución.
2. **No se miente.** Si la cocina está saturada, se avisa **antes** de que pague.
3. **Fotos reales.** Lo que mandamos por chat es lo que va a recibir.
4. **Brevedad.** El cliente escribe por una solución, no por una charla.
5. **En la queja, el tío baja el volumen.** Nivel 0: cero chistes, cero "sobrino", cero lisuras.
6. **Todos son vecinos.** Se atiende igual al que vive en el pasaje, al que trabaja de noche en la zona y al que llega de otro distrito.

## 2. Volumen por situación

| Situación | Picante | Trato |
| :--- | :-: | :--- |
| Consulta de carta, precio, ubicación | 1 | "Vecino/vecina" |
| Cliente feliz, etiqueta, reseña buena | 1–2 | "Vecino", algo de humor |
| Demora, error, queja | 0 | "Vecino" o por su nombre; nada más |
| Reclamo formal | 0 | Neutro |

Nunca lisuras en atención, ni censuradas.

---

## 3. Guiones

Los datos entre corchetes salen de `app/data/menuData.js` o de cocina en ese momento. Nunca se inventan.

**Saludo / carta**
> "Habla, vecino. Aquí tienes la carta con precios: [link de la web]. ¿Qué te mando?"

**Ubicación**
> "Estamos en Pje. Larrabure 142, Centro de Lima. [Referencia de cómo llegar, B14]. Abrimos [horario de `restaurantInfo`]."

**La zona** (si preguntan si es seguro o por qué ahí)
> "Es el Centro, vecino: no es el barrio más bonito, pero es la burger más rica del barrio. Si prefieres, te la mandamos o la recoges al toque."
> *No se habla mal de la zona ni de la gente que vive o trabaja ahí.*

**Delivery / cobertura**
> "Pásame tu dirección exacta y te confirmo si llegamos y cuánto demora."

**Nos etiquetan**
> "Gracias por la etiqueta, vecino. Así se come. 🍔"

**Ofertas**
> "Promos no tenemos ahora, pero La Misia sigue siendo la más barata de la casa: [link]."
> *Solo si es cierto ese día.*

**Pedido equivocado o incompleto**
> "Fallamos nosotros. En [tiempo real] te llega lo correcto, y quédate con lo que te llegó."
> *Acción:* la reposición sale antes que cualquier otro pedido.

**Demora**
> "Disculpa la demora. Se nos juntaron los pedidos; el tuyo sale en [tiempo real]. Te aviso apenas salga."
> *Acción:* decir el tiempo real. Nunca "ya está llegando" si sigue en cocina.

**Calidad** (llegó fría, pan roto, etc.)
> "Eso no debería pasar. Mándanos una foto y te mandamos otra ahora. Si prefieres, te devolvemos lo que pagaste."

**Precio o tamaño**
> "Es carne a la plancha en medallón grueso y pan de verdad; por eso cuesta lo que cuesta. La idea es que te llenes."
> *Gramaje solo si [B8](./MANUAL_DE_MARCA.md#12-decisiones-pendientes) está confirmado.*

**Sin stock**
> "Qué piña: se nos acabó [insumo] por hoy. Mañana abrimos [horario]. Gracias por preguntar."

**Pagos digitales caídos**
> "Yape/Plin no está funcionando ahorita. [Opción según la política vigente]. Disculpa el roche."
> 🔒 Delivery no acepta efectivo. Definir qué se ofrece ([B10](./MANUAL_DE_MARCA.md#12-decisiones-pendientes)).

**Fuera de horario**
> "Ya cerramos, vecino. Volvemos [próxima apertura de `restaurantInfo`]. Puedes dejar tu pedido para recojo desde la web."
> *La pre-orden fuera de horario es solo para recojo.*

**Comentario ofensivo sobre la marca** (sin queja real)
> Una respuesta con gracia (nivel 1–2) o silencio. Nunca insultos, nunca una pelea.

**Comentario ofensivo contra otra persona o grupo** en nuestras publicaciones
> Se oculta. Si es grave o repetido, se bloquea.

---

## 4. Reseñas de Google Maps

| Reseña | Respuesta |
| :--- | :--- |
| 5 estrellas | Corta, con algo de humor: "Gracias, vecino. Ya sabes dónde estamos." |
| 3–4 estrellas con comentario | Agradecer + tomar nota de lo concreto. Sin excusas. |
| 1–2 estrellas | Nivel 0: reconocer lo que sea cierto, ofrecer solución por WhatsApp. Nunca discutir en público. |
| Falsa o de spam | Reportar a Google. No responder con ataque. |

---

## 5. Libro de Reclamaciones

Si un cliente quiere presentar un reclamo o queja formal, se le indica el **Libro de Reclamaciones** de la web (`/libro-de-reclamaciones`) con tono neutro:

> "Puedes registrar tu reclamo en nuestro Libro de Reclamaciones: [link]. Te respondemos dentro del plazo de ley."

Es una obligación legal: **nunca** se bromea, se desalienta ni se dice que quedó registrado si no se confirmó.

---

## 6. Crisis

| Nivel | Ejemplo | Quién responde | Cómo |
| :-: | :--- | :--- | :--- |
| 1 | Una queja pública puntual | Community manager | Guion de [§3](#3-guiones); en público una línea + pasar a privado. |
| 2 | Varias quejas iguales, una reseña viral, **una pieza de humor que se malinterpreta o cae mal** | Dueños + CM | Pausar lo programado, responder con una sola voz, reconocer lo que sea cierto. |
| 3 | Salud (intoxicación), denuncia de discriminación, tema legal | Dueños (+ asesoría legal) | Cero humor. Comunicado breve, humano y verdadero. Sin el tío. |

### 6.1 Si una pieza polémica se sale de control

Somos controversiales a propósito, así que esto va a pasar. Cómo se maneja:

1. **No se borra al toque.** Primero se lee qué se está diciendo.
2. **Se separa la crítica del ruido.** Si la crítica es que el chiste le pegó a un grupo o a una víctima (fuera de nuestras propias reglas), **se baja la pieza y se reconoce en una línea**, sin pedir perdón en tono corporativo:
   > "Esta no nos salió. La bajamos. Seguimos."
3. Si la crítica es solo "no me gustó el humor", el tío no retrocede: se responde con gracia una vez o se deja.
4. **Nunca** se pelea con el que critica, se le expone ni se publica su perfil.
5. Si llega una carta notarial o una denuncia de INDECOPI, se pasa a nivel 3.

**Controversia que buscamos:** el tráfico, la garúa, la piña en la burger, Halloween vs. Canción Criolla, la comida pituca cara, el tío vs. los chibolos, los políticos, el escándalo de la semana.
**Controversia que no buscamos:** ver [líneas duras](./MANUAL_DE_MARCA.md#10-líneas-duras) y [UNIVERSO_PERUANO.md §7](./UNIVERSO_PERUANO.md#7-lo-que-no-se-hace).
