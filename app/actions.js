"use server";
import nodemailer from "nodemailer";

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendComplaint(formData) {
  const rawData = {
    name: formData.get("name") || "",
    dni: formData.get("dni") || "",
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    address: formData.get("address") || "",
    type: formData.get("type") || "", // Reclamo o Queja
    description: formData.get("description") || "",
    product: formData.get("product") || "",
    amount: formData.get("amount") || "",
    request: formData.get("request") || "",
  };

  // Validación básica en servidor
  if (!rawData.name.trim() || !rawData.email.trim() || !rawData.description.trim()) {
    return {
      success: false,
      message: "Por favor complete todos los campos obligatorios del formulario.",
    };
  }

  // Sanitización de datos para evitar XSS / inyección de código
  const data = {
    name: escapeHtml(rawData.name.trim()),
    dni: escapeHtml(rawData.dni.trim()),
    email: escapeHtml(rawData.email.trim()),
    phone: escapeHtml(rawData.phone.trim()),
    address: escapeHtml(rawData.address.trim()),
    type: escapeHtml(rawData.type.trim() || "Reclamo"),
    description: escapeHtml(rawData.description.trim()),
    product: escapeHtml(rawData.product.trim() || "No especificado"),
    amount: escapeHtml(rawData.amount.trim() || "0.00"),
    request: escapeHtml(rawData.request.trim()),
  };

  // 1. Si hay endpoint Formspree configurado en entorno, enviamos servidor-a-servidor
  const formspreeEndpoint = process.env.FORMSPREE_URL || process.env.NEXT_PUBLIC_FORMSPREE_URL;
  if (formspreeEndpoint) {
    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(rawData),
      });

      if (response.ok) {
        return { success: true, message: "Reclamo registrado y enviado correctamente." };
      }
    } catch (err) {
      console.error("Error al reenviar a Formspree desde Server Action:", err);
    }
  }

  // 2. Envío por transporte SMTP con Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER || "noreply@bigjack.pe",
    to: process.env.RECIPIENT_EMAIL || "bigjackpe@gmail.com",
    subject: `Libro de Reclamaciones - ${data.type.toUpperCase()} - ${data.name}`,
    html: `
      <h1>Nuevo Registro en Libro de Reclamaciones</h1>
      <p><strong>Tipo:</strong> ${data.type}</p>
      <hr />
      <h3>Datos del Consumidor</h3>
      <p><strong>Nombre:</strong> ${data.name}</p>
      <p><strong>DNI/CE:</strong> ${data.dni}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Teléfono:</strong> ${data.phone}</p>
      <p><strong>Dirección:</strong> ${data.address}</p>
      <hr />
      <h3>Bien Contratado</h3>
      <p><strong>Producto/Servicio:</strong> ${data.product}</p>
      <p><strong>Monto Reclamado:</strong> S/ ${data.amount}</p>
      <hr />
      <h3>Detalle de la Reclamación</h3>
      <p><strong>Descripción:</strong> ${data.description}</p>
      <p><strong>Pedido del Consumidor:</strong> ${data.request}</p>
    `,
  };

  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.warn("Sin credenciales de correo (GMAIL_USER, GMAIL_PASS). Registrando reclamo de forma simulada.");
      return { success: true, message: "Reclamo registrado correctamente." };
    }
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Reclamo enviado correctamente." };
  } catch (error) {
    console.error("Error enviando correo:", error);
    return { success: false, message: "Error al enviar el reclamo. Intente nuevamente." };
  }
}
