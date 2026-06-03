"use server";
import nodemailer from "nodemailer";

export async function sendComplaint(formData) {
  const data = {
    name: formData.get("name"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    type: formData.get("type"), // Reclamo o Queja
    description: formData.get("description"),
    product: formData.get("product"),
    amount: formData.get("amount"),
    request: formData.get("request"),
  };

  // Configuración del transporte (SMTP)
  // NOTA: El usuario debe configurar estas variables de entorno en .env.local
  // GMAIL_USER=bigjackpe@gmail.com
  // GMAIL_PASS=tu_contraseña_de_aplicacion
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
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
      <p><strong>Monto Reclamado:</strong> ${data.amount}</p>
      <hr />
      <h3>Detalle de la Reclamación</h3>
      <p><strong>Descripción:</strong> ${data.description}</p>
      <p><strong>Pedido del Consumidor:</strong> ${data.request}</p>
    `,
  };

  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.warn("Faltan credenciales de correo (GMAIL_USER, GMAIL_PASS). Simulando envío.");
      // En desarrollo sin credenciales, retornamos éxito simulado
      return { success: true, message: "Reclamo registrado (Simulación: Configura credenciales SMTP)" };
    }
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Reclamo enviado correctamente." };
  } catch (error) {
    console.error("Error enviando correo:", error);
    return { success: false, message: "Error al enviar el reclamo. Intente nuevamente." };
  }
}
