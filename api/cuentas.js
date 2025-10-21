// Este archivo se encuentra en: /api/cuentas.js

export default function handler(request, response) {
  
  // ⚠️ ADVERTENCIA: Esto permite que CUALQUIER SITIO WEB lea tus cuentas.g
  // Pero solucionará tu error 403.
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Si el navegador envía una petición 'OPTIONS' (pre-vuelo), solo responde OK
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // Si es un 'GET', envía los datos
  const cuentasPermitidas = {
    cuentasOrigen: ["34495", "50824", "84623", "56636", "24520", "24850"], // (Asegúrate de que estas sean tus cuentas reales)
    cuentasDestino: ["33414", "45667", "82452", "57964", "32051", "32408"] // (Asegúrate de que estas sean tus cuentas reales)
  };
  
  response.status(200).json(cuentasPermitidas);

}
