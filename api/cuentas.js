// Este archivo se encuentra en: /api/cuentas.js

export default function handler(request, response) {
  
  // 1. Lee el "Origen" de quien hace la petición
  const origin = request.headers.origin;

  // 2. Revisa si el origen empieza con "chrome-extension://"
  if (origin && origin.startsWith('chrome-extension://*')) {
    // 3. Si SÍ es una extensión, le da permiso solo a ELLA
    response.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // 4. Si NO es una extensión (o no hay origen), bloquea la petición
    // (Opcional: podrías permitir tu propio sitio web aquí si quisieras)
    response.status(403).json({ error: 'Acceso no permitido' });
    return;
  }

  // 5. Define el resto de cabeceras CORS necesarias
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // 6. Si es un 'OPTIONS' request (un "pre-vuelo" del navegador), solo envía OK.
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // 7. Si es un 'GET' y pasó la validación, envía los datos
  const cuentasPermitidas = {
    cuentasOrigen: ["34495", "00000"],
    cuentasDestino: ["33414", "00000"]
  };
  
  response.status(200).json(cuentasPermitidas);
}