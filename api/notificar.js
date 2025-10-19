// Este archivo se encuentra en: /api/notificar.js

export default async function handler(request, response) {
  
  // --- 1. Configuración de CORS ---
  // (Permite que cualquier sitio/extensión llame a esta API)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Si es una petición OPTIONS (pre-vuelo), solo responde OK
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // --- 2. Asegurarse de que sea un POST ---
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  // --- 3. Enviar la notificación a Telegram ---
  try {
    // Lee los secretos guardados en Vercel
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Lee los datos enviados desde la extensión
    const datosCompra = request.body; // { cuentaOrigen, cuentaDestino, monto... }

    // Formatea un mensaje bonito
    const mensaje = [
      '🤖 **¡Compra Exitosa en Bancamiga!** 🤖',
      '',
      `**Monto:** ${datosCompra.monto || 'N/D'} Divisas`,
      `**Cta. Origen:** ...${(datosCompra.cuentaOrigen || '??').slice(-3)}`, // Solo los últimos 3 dígitos
      `**Cta. Destino:** ...${(datosCompra.cuentaDestino || '??').slice(-3)}`,
      `**Origen Fondos:** ${datosCompra.origen || 'N/D'}`,
      `**Destino Fondos:** ${datosCompra.destino || 'N/D'}`,
    ].join('\n');

    // Prepara la URL de la API de Telegram
    const urlTelegram = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // Llama a la API de Telegram
    await fetch(urlTelegram, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: 'Markdown' // Para que acepte las negritas **
      })
    });

    // 4. Responde a la extensión que todo salió bien
    response.status(200).json({ status: 'notificado' });

  } catch (error) {
    console.error("Error al notificar a Telegram:", error);
    response.status(500).json({ error: 'Error interno del servidor' });
  }
}