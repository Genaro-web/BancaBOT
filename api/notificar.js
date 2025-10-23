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

// --- MAPA DE IDENTIFICADORES DE CUENTAS ---
const MAPA_CUENTAS = {
  "34495": "Deivis",
  "50824": "GUIPO",
  "84623": "JORGE",
  "56636": "GABRIEL",
  "24520": "JULIO",
  "24850": "GERARDO",
  "30035": "DEIVIS_PEREA", // tg
  "65777": "YEINNY", // tg jean
  "37758": "MARIANNY", // tg jean
  "37589": "Norelis64", // tg katiuska
  "98059": "ANYER", // tg anyer
  "77327": "DENIREX" // tg Jose Daniel
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
    const datosOperacion = request.body;
    const cuentaOrigen = datosOperacion.cuentaOrigen;

    // --- ¡¡INICIO DE NUEVA LÓGICA DE SELECCIÓN DE BOT!! ---
    
    // 1. Intenta buscar las credenciales específicas para esta cuenta
    const specificBotTokenKey = `BOT_TOKEN_${cuentaOrigen}`;
    const specificChatIdKey = `CHAT_ID_${cuentaOrigen}`;

    let botToken = process.env[specificBotTokenKey];
    let chatId = process.env[specificChatIdKey];

    // 2. Si no se encontraron, usa las credenciales "Admin" por defecto
    if (!botToken || !chatId) {
      console.log(`No se encontró bot específico para ${cuentaOrigen}. Usando bot admin por defecto.`);
      botToken = process.env.TELEGRAM_BOT_TOKEN;
      chatId = process.env.TELEGRAM_CHAT_ID;
    } else {
      console.log(`Usando bot específico para ${cuentaOrigen}.`);
    }

    // 3. Si AÚN ASÍ no hay credenciales, detiene la ejecución.
    if (!botToken || !chatId) {
      console.error("Error fatal: No se encontraron variables de entorno de Telegram (ni específicas ni por defecto).");
      return response.status(500).json({ error: 'Configuración de notificación incompleta en el servidor.' });
    }
    // --- ¡¡FIN DE NUEVA LÓGICA DE SELECCIÓN DE BOT!! ---


    // --- LÓGICA DE MENSAJE (Sin cambios) ---
    
    const fechaHora = new Date().toLocaleString('es-VE', {
      timeZone: 'America/Caracas',
      dateStyle: 'short',
      timeStyle: 'medium'
    });

    // Identificación de Cuenta Origen
    const cuentaOrigenOriginal = datosOperacion.cuentaOrigen || 'N/D';
    const identificadorOrigen = MAPA_CUENTAS[cuentaOrigenOriginal];
    let textoCuentaOrigen = identificadorOrigen ? `${identificadorOrigen} (${cuentaOrigenOriginal})` : cuentaOrigenOriginal;
    
    // Identificación de Cuenta Destino
    const cuentaDestinoOriginal = datosOperacion.cuentaDestino || 'N/D';
    const identificadorDestino = MAPA_CUENTAS[cuentaDestinoOriginal];
    let textoCuentaDestino = identificadorDestino ? `${identificadorDestino} (${cuentaDestinoOriginal})` : cuentaDestinoOriginal;
    
    let mensaje;

    if (datosOperacion.error) {
      // --- 1. FORMATO DE MENSAJE DE ERROR FATAL ---
      mensaje = [
        '🛑 **¡ERROR FATAL EN BOT BANCAMIGA!** 🛑',
        '',
        `**Error:** ${datosOperacion.error}`,
        `**Monto:** ${datosOperacion.monto || 'N/D'}`,
        `**Cta. Origen:** ${textoCuentaOrigen}`,
        `**Cta. Destino:** ${textoCuentaDestino}`,
        '',
        '*El bot se ha detenido.*',
        `*Fecha:* ${fechaHora} (Venezuela)`
      ].join('\n');
      
    } else if (datosOperacion.warning) {
      // --- 2. FORMATO DE MENSAJE DE ADVERTENCIA (REINTENTO) ---
      mensaje = [
        '⚠️ **ALERTA EN BOT BANCAMIGA** ⚠️',
        '',
        `**Aviso:** ${datosOperacion.warning}`,
        `**Monto:** ${datosOperacion.monto || 'N/D'}`,
        `**Cta. Origen:** ${textoCuentaOrigen}`,
        '',
        '*El bot reintentará el ciclo.*',
        `*Fecha:* ${fechaHora} (Venezuela)`
      ].join('\n');
      
    } else {
      // --- 3. FORMATO DE MENSAJE DE ÉXITO ---
      const origenTexto = MAPA_ORIGEN[datosOperacion.origen] || datosOperacion.origen || 'N/D';
      const destinoTexto = MAPA_DESTINO[datosOperacion.destino] || datosOperacion.destino || 'N/D';
      
      mensaje = [
        '🤖 **¡Compra Exitosa en Bancamiga!** 🤖',
        '',
        `**Monto:** ${datosOperacion.monto || 'N/D'} Divisas`,
        `**Cta. Origen:** ${textoCuentaOrigen}`,
        `**Cta. Destino:** ${textoCuentaDestino}`,
        `**Origen Fondos:** ${origenTexto}`,
        `**Destino Fondos:** ${destinoTexto}`,
        '',
        `*Fecha:* ${fechaHora} (Venezuela)`
      ].join('\n');
    }
    // --- FIN DE LÓGICA DE MENSAJE ---

    // La URL ahora usa las variables 'botToken' y 'chatId' que seleccionamos
    const urlTelegram = `https://api.telegram.org/bot${botToken}/sendMessage`;

    await fetch(urlTelegram, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId, // Usa el Chat ID seleccionado
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