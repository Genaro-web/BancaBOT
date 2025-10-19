// Este archivo se encuentra en: /api/notificar.js

// --- 1. Mapas de Traducción ---
// (Para convertir los IDs numéricos en texto legible)
const MAPA_ORIGEN = {
  "1": "AHORROS",
  "3": "REMESAS",
  "19": "NUEVOS PRODUCTOS ELECTRÓNICO"
};

const MAPA_DESTINO = {
  "1": "MATERIA PRIMA",
  "2": "SUELDOS Y SALARIOS",
  "3": "PAGO A PROVEEDORES",
  "4": "CANCELACIÓN DE PRESTAMOS",
  "5": "AHORRO",
  "6": "INVENTARIO",
  "7": "PAGO DE SERVICIOS",
  "8": "HONORARIOS PROFESIONALES",
  "9": "CAPITAL DE TRABAJO",
  "10": "MOBILIARIO Y EQUIPOS",
  "99": "OTROS DESTINOS"
};
// ---------------------------------


export default async function handler(request, response) {
  
  // --- Configuración de CORS ---
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  // --- Enviar la notificación a Telegram ---
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const datosCompra = request.body;

    // --- ¡CAMBIOS DE FORMATO AQUÍ! ---

    // 1. Traduce los valores
    // (Si no encuentra el valor en el mapa, deja el número original)
    const origenTexto = MAPA_ORIGEN[datosCompra.origen] || datosCompra.origen || 'N/D';
    const destinoTexto = MAPA_DESTINO[datosCompra.destino] || datosCompra.destino || 'N/D';

    // 2. Obtiene la fecha y hora de Venezuela (-04:00)
    const fechaHora = new Date().toLocaleString('es-VE', {
      timeZone: 'America/Caracas',
      dateStyle: 'short',
      timeStyle: 'medium'
    });

    // 3. Formatea el mensaje con todos los datos
    const mensaje = [
      '🤖 **¡Compra Exitosa en Bancamiga!** 🤖',
      '',
      `**Monto:** ${datosCompra.monto || 'N/D'} Divisas`,
      `**Cta. Origen:** ${datosCompra.cuentaOrigen || 'N/D'}`,     // <-- CAMBIO
      `**Cta. Destino:** ${datosCompra.cuentaDestino || 'N/D'}`,   // <-- CAMBIO
      `**Origen Fondos:** ${origenTexto}`,     // <-- CAMBIO
      `**Destino Fondos:** ${destinoTexto}`,   // <-- CAMBIO
      '',
      `*Fecha:* ${fechaHora} (Venezuela)` // <-- CAMBIO
    ].join('\n');
    
    // -----------------------------------------

    const urlTelegram = `https://api.telegram.org/bot${botToken}/sendMessage`;

    await fetch(urlTelegram, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: 'Markdown'
      })
    });

    response.status(200).json({ status: 'notificado' });

  } catch (error) {
    console.error("Error al notificar a Telegram:", error);
    response.status(500).json({ error: 'Error interno del servidor' });
  }
}