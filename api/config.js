// /api/config.js
// Vercel Serverless Function

export default function handler(req, res) {
  if (process.env.GOOGLE_MAPS_API_KEY) {
    res.status(200).json({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY });
  } else {
    // Este error será visible en los logs de Vercel si la variable de entorno no está configurada.
    console.error("CRITICAL: GOOGLE_MAPS_API_KEY environment variable is not set.");
    res.status(500).json({ error: 'La clave de API de Google Maps no está configurada en el servidor.' });
  }
}
