export const getBiodynamicReport = async (location) => {
  try {
    const response = await fetch('/api/biodynamic-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        address: location.address,
      }),
    });

    if (!response.ok) {
        // Intenta leer el cuerpo del error para un mensaje más específico
        const errorData = await response.json().catch(() => ({ error: `Error del servidor: ${response.status} ${response.statusText}` }));
        const errorMessage = errorData?.error || `Error del servidor: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();

    // Validar que la data recibida tiene la estructura esperada
    if (!data.clima || !data.recomendacion || !data.pronostico || !data.sugerenciasAdicionales) {
        throw new Error("La respuesta del servidor no tiene la estructura de informe esperada.");
    }

    return data;

  } catch (error) {
    console.error("Error al obtener el informe desde el servidor:", error);
    if (error instanceof Error) {
        // Re-lanza el error para que el componente de UI pueda manejarlo
        throw new Error(`Error en la comunicación con el servidor: ${error.message}`);
    }
    // Caso de error genérico que no es una instancia de Error
    throw new Error("Ocurrió un error desconocido al contactar el servidor.");
  }
};