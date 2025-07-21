// /api/biodynamic-report.js
// Vercel Serverless Function

import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';

// --- API de Gemini (Inicialización y Esquema) ---
if (!process.env.API_KEY) {
  console.error("CRITICAL: API_KEY environment variable for Gemini is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    nombreLugar: { type: Type.STRING, description: "Nombre del lugar analizado, como la ciudad o región." },
    clima: {
      type: Type.OBJECT,
      properties: {
        temperaturaMin: { type: Type.NUMBER, description: "Temperatura mínima del día en grados Celsius." },
        temperaturaMax: { type: Type.NUMBER, description: "Temperatura máxima del día en grados Celsius." },
        humedad: { type: Type.NUMBER, description: "Humedad relativa en porcentaje." },
        radiacionUV: { type: Type.STRING, description: "Nivel de radiación UV (ej: 'Bajo', 'Moderado')." },
        viento: { type: Type.STRING, description: "Velocidad y dirección del viento (ej: '15 km/h del SO')." },
        presion: { type: Type.NUMBER, description: "Presión atmosférica en hPa." },
        precipitacion: { type: Type.NUMBER, description: "Precipitación acumulada del día en milímetros." },
        amanecer: { type: Type.STRING, description: "Hora del amanecer en formato HH:MM." },
        atardecer: { type: Type.STRING, description: "Hora del atardecer en formato HH:MM." },
        faseLunar: { type: Type.STRING, description: "Fase lunar actual (ej: 'Creciente Gibosa')." },
      }
    },
    recomendacion: {
      type: Type.OBJECT,
      properties: {
        resumenEjecutivo: { type: Type.STRING, description: "Un resumen corto y directo para el agricultor sobre las condiciones y tareas más importantes del día." },
        actividadPrincipal: {
          type: Type.OBJECT,
          properties: {
            titulo: { type: Type.STRING, description: "El título de la actividad biodinámica principal recomendada para hoy (ej: 'Día de Raíz: Preparar suelo')." },
            justificacion: { type: Type.STRING, description: "Explicación detallada de por qué se recomienda esta actividad, conectando el clima, la luna y los principios biodinámicos." },
          }
        },
        cultivosSugeridos: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nombreComun: { type: Type.STRING, description: "Nombre común del cultivo sugerido." },
              nombreCientifico: { type: Type.STRING, description: "Nombre científico del cultivo." },
            }
          }
        }
      }
    },
    pronostico: {
      type: Type.ARRAY,
      description: "Pronóstico para los próximos 3 días.",
      items: {
        type: Type.OBJECT,
        properties: {
          fecha: { type: Type.STRING, description: "Fecha del pronóstico en formato DD/MM." },
          dia: { type: Type.STRING, description: "Día de la semana (ej: 'Mañana', 'Miércoles')." },
          temperaturaMinMax: { type: Type.STRING, description: "Rango de temperatura (ej: '10°/22°C')." },
          precipitacion: { type: Type.NUMBER, description: "Probabilidad o cantidad de precipitación en mm." },
          faseLunar: { type: Type.STRING, description: "Fase lunar para ese día." },
        }
      }
    },
    sugerenciasAdicionales: {
      type: Type.ARRAY,
      description: "Sugerencias avanzadas o alternativas.",
      items: {
        type: Type.OBJECT,
        properties: {
          tipo: { type: Type.STRING, description: "Categoría de la sugerencia (ej: 'Fertilización', 'Control de Plagas')." },
          nombre: { type: Type.STRING, description: "Nombre de la técnica o preparado sugerido (ej: 'Preparado 500')." },
          descripcion: { type: Type.STRING, description: "Descripción detallada de la sugerencia y cómo implementarla." },
        }
      }
    }
  }
};


// --- Handler de la Función Serverless ---

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { lat, lng, address } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitud y longitud son requeridas.' });
  }

  const systemInstruction = "Actúas como un experto agrónomo mundial en agricultura biodinámica, con profundo conocimiento de los ciclos lunares, influencias cósmicas, meteorología y prácticas agrícolas sostenibles. Tu objetivo es proporcionar un informe completo, práctico y fácil de entender para un agricultor en Sudamérica. Debes obtener datos climáticos y astronómicos precisos para la ubicación y fecha actual. La respuesta DEBE ser únicamente un objeto JSON que se ajuste al esquema proporcionado, sin texto adicional ni markdown.";
  const prompt = `Genera un informe biodinámico para hoy, ${new Date().toLocaleDateString('es-ES')}, en la ubicación: ${address} (Lat: ${lat}, Lng: ${lng}). Proporciona datos climáticos precisos para hoy, un pronóstico a 3 días, y recomendaciones biodinámicas claras. Incluye sugerencias de cultivos y técnicas avanzadas.`;
  
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: reportSchema,
            temperature: 0.5,
        },
    });
    
    const jsonString = response.text;
    const reportData = JSON.parse(jsonString);
    
    // Configura headers de caching para mejorar rendimiento en Vercel
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache por 1 hora
    res.status(200).json(reportData);

  } catch (error) {
    console.error('Error desde la API de Gemini:', error);
    res.status(500).json({ error: 'No se pudo generar el informe desde la IA. Por favor, inténtelo de nuevo.' });
  }
}
