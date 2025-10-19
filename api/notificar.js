// Este archivo se encuentra en: /api/notificar.js

// --- 1. Mapas de Traducción ---
const MAPA_ORIGEN = {
  "1": "AHORROS", "3": "REMESAS", "19": "NUEVOS PRODUCTOS ELECTRÓNICO"
};
const MAPA_DESTINO = {
  "1": "MATERIA PRIMA", "2": "SUELDOS Y SALARIOS", "3": "PAGO A PROVEEDORES",
  "4": "CANCELACIÓN DE PRESTAMOS", "5": "AHORRO", "6": "INVENTARIO",
  "7": "PAGO DE SERVICIOS", "8": "HONORARIOS PROFESIONALES", "9": "CAPITAL DE TRABAJO",
  "10": "MOBILIARIO Y EQUIPOS", "99": "OTROS DESTINOS"
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
    const datosOperacion = request.body; // { cuentaOrigen, monto, ..., error? }

    // --- ¡NUEVA LÓGICA DE MENSAJE! ---
    
    // Obtiene la fecha y hora
    const fechaHora = new Date().toLocaleString('es-VE', {
      timeZone: 'America/Caracas',
      dateStyle: 'short',
      timeStyle: 'medium'
    });
    
    let mensaje;

    if (datosOperacion.error) {
      // --- 1. FORMATO DE MENSAJE DE ERROR ---
      mensaje = [
        '🛑 **¡ERROR FATAL EN BOT BANCAMIGA!** 🛑',
        '',
        `**Error:** ${datosOperacion.error}`,
        `**Monto:** ${datosOperacion.monto || 'N/D'}`,
        `**Cta. Origen:** ${datosOperacion.cuentaOrigen || 'N/D'}`,
        `**Cta. Destino:** ${datosOperacion.cuentaDestino || 'N/D'}`,
        '',
        '*El bot se ha detenido.*',
        `*Fecha:* ${fechaHora} (Venezuela)`
      ].join('\n');
      
    } else {
      // --- 2. FORMATO DE MENSAJE DE ÉXITO (El que ya tenías) ---
      const origenTexto = MAPA_ORIGEN[datosOperacion.origen] || datosOperacion.origen || 'N/D';
      const destinoTexto = MAPA_DESTINO[datosOperacion.destino] || datosOperacion.destino || 'N/D';
      
      mensaje = [
        '🤖 **¡Compra Exitosa en Bancamiga!** 🤖',
        '',
        `**Monto:** ${datosOperacion.monto || 'N/D'} Divisas`,
        `**Cta. Origen:** ${datosOperacion.cuentaOrigen || 'N/D'}`,
        `**Cta. Destino:** ${datosOperacion.cuentaDestino || 'N/D'}`,
        `**Origen Fondos:** ${origenTexto}`,
        `**Destino Fondos:** ${destinoTexto}`,
        '',
        `*Fecha:* ${fechaHora} (Venezuela)`
      ].join('\n');
    }
    // --- FIN DE LÓGICA DE MENSAJE ---

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