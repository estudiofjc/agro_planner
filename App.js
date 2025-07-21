import React, { useState, useCallback, useEffect } from 'react';
import { getBiodynamicReport } from './services/geminiService.js';
import MapDisplay from './components/MapDisplay.js';
import Spinner from './components/Spinner.js';
import { 
  ThermometerIcon, 
  DropIcon, 
  WindIcon, 
  SunriseIcon, 
  SunsetIcon, 
  MoonIcon, 
  PressureIcon, 
  UvIcon,
  ChevronDownIcon
} from './components/constants.js';

// --- Sub-componentes para el nuevo ReportDisplay ---

const ForecastDisplay = ({ forecast }) => (
    React.createElement('div', { className: "pt-4" },
        React.createElement('h4', { className: "text-xl font-bold text-emerald-300 mb-3" }, "Pronóstico a 3 Días"),
        React.createElement('div', { className: "overflow-x-auto bg-black/20 p-2 rounded-lg" },
            React.createElement('table', { className: "w-full text-left border-collapse" },
                React.createElement('thead', null,
                    React.createElement('tr', { className: "border-b border-green-800/50" },
                        React.createElement('th', { className: "p-2 font-semibold text-slate-300 text-sm" }, "Día"),
                        React.createElement('th', { className: "p-2 font-semibold text-slate-300 text-sm text-center" }, "Temp."),
                        React.createElement('th', { className: "p-2 font-semibold text-slate-300 text-sm text-center" }, "Lluvia"),
                        React.createElement('th', { className: "p-2 font-semibold text-slate-300 text-sm text-center" }, "Fase Lunar")
                    )
                ),
                React.createElement('tbody', null,
                    forecast.map(day => (
                        React.createElement('tr', { key: day.fecha, className: "border-b border-green-900/40 last:border-none" },
                            React.createElement('td', { className: "p-2 font-bold text-slate-200 text-sm whitespace-nowrap" }, day.dia, " ", React.createElement('span', { className: "font-normal text-slate-400 text-xs" }, `(${day.fecha})`)),
                            React.createElement('td', { className: "p-2 text-center text-slate-300 text-sm" }, day.temperaturaMinMax),
                            React.createElement('td', { className: "p-2 text-center text-cyan-300 text-sm font-semibold" }, `${day.precipitacion} mm`),
                            React.createElement('td', { className: "p-2 text-center text-slate-300 text-sm" }, day.faseLunar)
                        )
                    ))
                )
            )
        )
    )
);

const AccordionItem = ({ sugerencia, isOpen, onClick }) => (
    React.createElement('div', { className: "bg-[#2d463d] rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out" },
        React.createElement('button', { onClick: onClick, className: "w-full p-4 text-left flex justify-between items-center focus:outline-none" },
            React.createElement('p', { className: "font-bold text-lg text-white flex-1" },
                React.createElement('span', { className: "text-amber-400" }, `${sugerencia.tipo}:`), " ", sugerencia.nombre
            ),
            React.createElement(ChevronDownIcon, { className: `w-6 h-6 text-amber-300 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}` })
        ),
        React.createElement('div', { className: `transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}` },
            React.createElement('div', { className: "px-4 pb-4" },
                React.createElement('p', { className: "text-slate-300 text-base text-justify border-t border-green-700/50 pt-3" }, sugerencia.descripcion)
            )
        )
    )
);

const Accordion = ({ sugerencias }) => {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        React.createElement('div', { className: "space-y-4" },
            sugerencias.map((sug, index) => (
                React.createElement(AccordionItem, {
                    key: index,
                    sugerencia: sug,
                    isOpen: openIndex === index,
                    onClick: () => setOpenIndex(openIndex === index ? null : index)
                })
            ))
        )
    );
};


const ReportDisplay = ({ report }) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const { clima, recomendacion, pronostico, nombreLugar, sugerenciasAdicionales } = report;

  const weatherItems = [
    { icon: React.createElement(ThermometerIcon, { className: "w-6 h-6 text-sky-300" }), label: "Temperatura", value: `${clima.temperaturaMin}° / ${clima.temperaturaMax}°C` },
    { icon: React.createElement(DropIcon, { className: "w-6 h-6 text-blue-300" }), label: "Humedad", value: `${clima.humedad}%` },
    { icon: React.createElement(UvIcon, { className: "w-6 h-6 text-yellow-300" }), label: "Radiación UV", value: clima.radiacionUV },
    { icon: React.createElement(WindIcon, { className: "w-6 h-6 text-slate-400" }), label: "Viento", value: clima.viento },
    { icon: React.createElement(PressureIcon, { className: "w-6 h-6 text-slate-400" }), label: "Presión", value: `${clima.presion} hPa` },
    { icon: React.createElement(DropIcon, { className: "w-6 h-6 text-cyan-300" }), label: "Precipitación", value: `${clima.precipitacion} mm` },
    { icon: React.createElement(SunriseIcon, { className: "w-6 h-6 text-orange-400" }), label: "Amanecer", value: clima.amanecer },
    { icon: React.createElement(SunsetIcon, { className: "w-6 h-6 text-orange-500" }), label: "Atardecer", value: clima.atardecer },
    { icon: React.createElement(MoonIcon, { className: "w-6 h-6 text-indigo-300" }), label: "Fase Lunar", value: clima.faseLunar },
  ];
  
  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'clima', label: 'Clima Hoy' },
    { id: 'plan', label: 'Plan de Cultivo' },
    { id: 'explorar', label: 'Explorar' },
  ];

  return (
    React.createElement('div', { className: "bg-gradient-to-br from-[#243c32] to-[#1e322b] border border-green-800/50 rounded-2xl shadow-2xl shadow-emerald-900/20 p-4 sm:p-6 animate-fade-in w-full" },
      React.createElement('h2', { className: "text-3xl font-bold text-emerald-300 mb-2" }, `Informe para ${nombreLugar}`),
      React.createElement('p', { className: "text-amber-300 font-semibold mb-6" }, new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })),
      React.createElement('div', { className: "border-b border-green-700/50 mb-6" },
        React.createElement('nav', { className: "-mb-px flex space-x-4", 'aria-label': "Tabs" },
          tabs.map(tab => (
            React.createElement('button',
              {
                key: tab.id,
                onClick: () => setActiveTab(tab.id),
                className: `${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`
              },
              tab.label
            )
          ))
        )
      ),
      React.createElement('div', { className: "min-h-[300px]" },
        activeTab === 'resumen' && (
            React.createElement('div', { className: "space-y-6" },
                 React.createElement('div', { className: "bg-black/20 p-5 rounded-lg border border-amber-600/30" },
                    React.createElement('h3', { className: "text-xl font-bold text-amber-300 mb-3" }, "Resumen Ejecutivo"),
                    React.createElement('p', { className: "text-slate-200 text-lg" }, recomendacion.resumenEjecutivo)
                 ),
                 React.createElement('div', { className: "bg-black/20 p-5 rounded-lg border border-green-900/50" },
                    React.createElement('h3', { className: "text-xl font-bold text-emerald-300 mb-3" }, "Recomendación Principal"),
                    React.createElement('p', { className: "text-xl font-semibold text-white" }, recomendacion.actividadPrincipal.titulo),
                    React.createElement('p', { className: "text-slate-300 mt-2 text-justify" }, recomendacion.actividadPrincipal.justificacion)
                )
            )
        ),
        activeTab === 'clima' && (
            React.createElement('div', null,
                 React.createElement('h3', { className: "text-2xl font-bold text-emerald-300 mb-4" }, "Condiciones Actuales"),
                 React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6" },
                    weatherItems.map(item => (
                        React.createElement('div', { key: item.label, className: "flex items-center space-x-3" },
                          item.icon,
                          React.createElement('div', null,
                            React.createElement('p', { className: "text-sm text-slate-400 font-semibold" }, item.label),
                            React.createElement('p', { className: "font-bold text-slate-100" }, item.value)
                          )
                        )
                    ))
                )
            )
        ),
        activeTab === 'plan' && (
            React.createElement('div', { className: "space-y-6" },
                React.createElement('div', null,
                    React.createElement('h3', { className: "text-2xl font-bold text-emerald-300 mb-4" }, "Cultivos Sugeridos"),
                    React.createElement('ul', { className: "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3" },
                      recomendacion.cultivosSugeridos.map((crop) => (
                        React.createElement('li', { key: crop.nombreComun, className: "flex items-center space-x-3" },
                          React.createElement('svg', { className: "w-5 h-5 text-green-400 flex-shrink-0", fill: "currentColor", viewBox: "0 0 20 20" }, React.createElement('path', { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" })),
                          React.createElement('div', null,
                            React.createElement('p', { className: "font-semibold text-slate-200" }, crop.nombreComun),
                            React.createElement('p', { className: "text-sm text-slate-400 italic" }, crop.nombreCientifico)
                          )
                        )
                      ))
                    )
                ),
                pronostico && pronostico.length > 0 && React.createElement(ForecastDisplay, { forecast: pronostico })
            )
        ),
         activeTab === 'explorar' && (
             React.createElement('div', null,
                React.createElement('h3', { className: "text-2xl font-bold text-emerald-300 mb-4" }, "Sugerencias de Vanguardia"),
                React.createElement(Accordion, { sugerencias: sugerenciasAdicionales })
             )
         )
      )
    )
  );
};

// Main App Component
const App = () => {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [config, setConfig] = useState(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'No se pudo cargar la configuración del servidor.' }));
          throw new Error(errorData.error || 'Error del servidor al cargar la configuración.');
        }
        const appConfig = await response.json();
        if (!appConfig.googleMapsApiKey) {
          throw new Error('La clave de API para el mapa no fue proporcionada por el servidor.');
        }
        setConfig(appConfig);
      } catch (err) {
        setError(err.message || 'Error crítico de configuración.');
      } finally {
        setIsConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleLocationSelect = useCallback(async (location) => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await getBiodynamicReport(location);
      setReport(result);
    } catch (err) {
      setError(err.message || 'Ocurrio un error inesperado.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  if (isConfigLoading) {
    return (
      React.createElement('div', { className: "min-h-screen flex flex-col items-center justify-center text-slate-200 p-4 bg-[#1a2a24]" },
          React.createElement(Spinner, null),
          React.createElement('p', { className: "mt-4 text-lg text-emerald-300" }, "Cargando configuración...")
      )
    );
  }
  
  if (!config) {
      return (
          React.createElement('div', { className: "min-h-screen flex flex-col items-center justify-center text-slate-200 p-4 bg-[#1a2a24]" },
              React.createElement('div', { className: "bg-red-900/50 border border-red-700 text-red-200 p-6 rounded-lg text-center w-full max-w-lg" },
                  React.createElement('h3', { className: "font-bold text-xl mb-2" }, "Error de Configuración Crítico"),
                  React.createElement('p', null, error || "No se ha podido cargar la configuración necesaria para iniciar la aplicación."),
                  React.createElement('p', { className: "mt-4 text-sm text-red-300" }, "Por favor, contacta al administrador del sitio. Es necesario configurar las claves de API en el servidor cPanel.")
              )
          )
      );
  }

  return (
    React.createElement('div', { className: "min-h-screen text-slate-200 p-4 sm:p-6 lg:p-8" },
      React.createElement('main', { className: "max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8" },
        
        React.createElement('div', { className: "space-y-6 flex flex-col" },
          React.createElement('header', { className: "text-center" },
            React.createElement('h1', { className: "text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 pb-2" },
              "Agro Planner Biodinámico"
            ),
            React.createElement('p', { className: "mt-1 text-lg text-slate-300 max-w-2xl mx-auto" },
              "Inteligencia artificial para una agricultura conectada con los ciclos de la tierra y el cosmos."
            )
          ),
          React.createElement('div', { className: "bg-gradient-to-br from-[#243c32] to-[#1e322b] border border-green-800/50 rounded-2xl shadow-lg p-2 md:p-4 flex-grow" },
            React.createElement(MapDisplay, { 
              onLocationSelect: handleLocationSelect, 
              selectedPoint: selectedPoint,
              setSelectedPoint: setSelectedPoint,
              apiKey: config.googleMapsApiKey
            })
          )
        ),

        React.createElement('div', { className: "flex items-center justify-center min-h-[500px] lg:min-h-full" },
          isLoading && React.createElement(Spinner, null),
          error && !isLoading && (
            React.createElement('div', { className: "bg-red-900/50 border border-red-700 text-red-200 p-6 rounded-lg text-center animate-fade-in w-full" },
              React.createElement('h3', { className: "font-bold text-xl mb-2" }, "Error en el Análisis"),
              React.createElement('p', null, error)
            )
          ),
          report && !isLoading && React.createElement(ReportDisplay, { report: report }),
           !report && !isLoading && !error && (
            React.createElement('div', { className: "text-center text-slate-400 p-8 border-2 border-dashed border-green-800/40 rounded-2xl w-full h-full flex flex-col justify-center items-center" },
                React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "mx-auto h-16 w-16 text-green-700/80 animate-pulse", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1", d: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.8 4.903l1.414 1.414M14.786 19.097l1.414-1.414M12 21.055V19M12 5.055V3M4.903 16.2l1.414-1.414M19.097 7.8l-1.414 1.414" }),
                    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M12 14a2 2 0 100-4 2 2 0 000 4z" })
                ),
              React.createElement('h3', { className: "mt-4 text-xl font-semibold text-slate-300" }, "El Oráculo del Campo te Espera"),
              React.createElement('p', { className: "mt-2 text-base max-w-sm" }, "Selecciona un punto en el mapa o usa tu ubicación para que la tierra te hable.")
            )
          )
        )
      ),

      React.createElement('footer', { className: "text-center mt-12 pb-4" },
        React.createElement('p', { className: "text-sm text-slate-500" }, "Potenciado por Gemini y datos geoespaciales. Un Proyecto COSUFER.")
      )
    )
  );
};

export default App;