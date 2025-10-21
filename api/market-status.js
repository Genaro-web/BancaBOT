// Este archivo se encuentra en: /api/market-status.js
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  // --- Configuración de CORS ---
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method === 'GET') {
    try {
      // --- ¡LÓGICA CLAVE! ---
      // Intenta obtener la bandera.
      const status = await kv.get('market_status');
      
      // Si el estado es "open", está abierto. 
      // Si es "null" (porque expiró o nunca se fijó), está cerrado.
      const isOpen = (status === 'open');
      
      return response.status(200).json({ isOpen: isOpen });
      
    } catch (error) {
      console.error("Error al leer la bandera de KV:", error);
      return response.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  
  response.status(405).json({ error: 'Método no permitido' });
}