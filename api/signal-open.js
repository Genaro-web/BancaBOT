// Este archivo se encuentra en: /api/signal-open.js
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  // --- Configuración de CORS ---
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method === 'POST') {
    try {
      // --- ¡LÓGICA CLAVE! ---
      // Establece el estado "open" con una expiración (ex) de 10 segundos.
      await kv.set('market_status', 'open', { ex: 10 });
      
      console.log("Señal de mercado abierto recibida y establecida por 10s.");
      return response.status(200).json({ status: 'signaled' });
      
    } catch (error) {
      console.error("Error al establecer la bandera en KV:", error);
      return response.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  
  response.status(405).json({ error: 'Método no permitido' });
}