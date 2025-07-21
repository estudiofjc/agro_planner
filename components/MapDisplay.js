import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import Spinner from './Spinner.js';
import { GeolocationIcon } from './constants.js';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
  borderRadius: '1rem',
};

const defaultCenter = {
  lat: -14.235004,
  lng: -51.92528,
};

const MapDisplay = ({ onLocationSelect, setSelectedPoint, selectedPoint, apiKey }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
    language: 'es',
    region: 'SA',
    id: 'google-maps-script', // Add a static ID to prevent re-rendering issues
  });

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onAutocompleteLoad = useCallback((autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        if (mapRef.current) {
            mapRef.current.panTo({ lat, lng });
            mapRef.current.setZoom(12);
        }
        setSelectedPoint({ lat, lng });
        onLocationSelect({ lat, lng, address });
      }
    }
  };
  
  const onMapClick = useCallback((e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedPoint({ lat, lng });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        if (status === 'OK' && results && results[0]) {
          address = results[0].formatted_address;
        }
        onLocationSelect({ lat, lng, address });
      });
    }
  }, [onLocationSelect, setSelectedPoint]);

  const handleGeolocate = useCallback(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            if (mapRef.current) {
                mapRef.current.panTo({ lat, lng });
                mapRef.current.setZoom(12);
            }
            setSelectedPoint({ lat, lng });

            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                if (status === 'OK' && results && results[0]) {
                    address = results[0].formatted_address;
                }
                onLocationSelect({ lat, lng, address });
            });
        }, () => {
            alert("No se pudo obtener tu ubicación. Por favor, revisa los permisos de tu navegador.");
        });
    } else {
        alert("La geolocalización no es soportada por este navegador.");
    }
  }, [onLocationSelect, setSelectedPoint]);

  if (loadError || !apiKey) {
    return (
        React.createElement('div', { className: "flex items-center justify-center h-full bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 min-h-[500px]" },
            React.createElement('div', { className: "text-center text-yellow-200 max-w-lg" },
                React.createElement('h3', { className: "font-bold text-xl mb-2" }, "Error al Cargar el Mapa"),
                React.createElement('p', { className: "mb-3" },
                   "No se pudieron cargar las funciones del mapa. Esto puede deberse a un problema de configuración en el servidor o a que la clave de API de Google Maps no es válida."
                ),
                React.createElement('p', { className: "font-semibold text-yellow-100" }, "Acción Requerida (Administrador):"),
                React.createElement('ul', { className: "text-sm text-left list-disc list-inside mt-2 text-yellow-300/90 mx-auto inline-block bg-black/20 p-3 rounded-md" },
                    React.createElement('li', { className: "mb-1" }, "Verifica que la variable de entorno ", React.createElement('code', { className: "bg-black/50 px-1 py-0.5 rounded" }, "GOOGLE_MAPS_API_KEY"), " esté configurada en cPanel."),
                    React.createElement('li', { className: "mb-1" }, "Asegúrate que la clave esté restringida al dominio correcto en Google Cloud."),
                    React.createElement('li', { className: "mb-1" }, React.createElement('span', { className: "font-bold" }, "Facturación"), " esté Habilitada en tu proyecto de Google Cloud."),
                    React.createElement('li', { className: "mb-1" }, React.createElement('span', { className: "font-bold" }, "APIs"), " estén activadas: Maps JavaScript, Places, Geocoding.")
                )
            )
        )
    );
  }
  
  if (!isLoaded) return React.createElement('div', { className: "flex justify-center items-center min-h-[500px]" }, React.createElement(Spinner, null));

  return (
    React.createElement('div', { className: "relative h-full" },
      React.createElement(Autocomplete,
          {
            onLoad: onAutocompleteLoad,
            onPlaceChanged: onPlaceChanged,
            options:{
              componentRestrictions: { country: ["ar", "bo", "br", "cl", "co", "ec", "gy", "py", "pe", "sr", "uy", "ve", "gf"] },
              fields: ["formatted_address", "geometry.location"]
            }
          },
        React.createElement('input',
          {
            type: "text",
            placeholder: "Busca una ciudad o region...",
            className: "absolute top-4 left-1/2 -translate-x-1/2 z-10 w-11/12 max-w-md p-3 bg-[#101814]/80 text-white border border-green-700/60 rounded-lg shadow-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none backdrop-blur-sm"
          }
        )
      ),
       React.createElement('button', 
        { 
          onClick: handleGeolocate, 
          'aria-label': "Usar mi ubicación actual",
          className: "absolute top-4 right-4 z-10 p-3 bg-[#101814]/80 text-white border border-green-700/60 rounded-full shadow-lg hover:bg-emerald-900/80 focus:ring-2 focus:ring-emerald-400 focus:outline-none backdrop-blur-sm transition-colors"
        },
            React.createElement(GeolocationIcon, { className: "w-6 h-6 text-emerald-300" })
        ),
      React.createElement(GoogleMap,
        {
          mapContainerStyle: mapContainerStyle,
          center: defaultCenter,
          zoom: 4,
          options: {
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: true,
            gestureHandling: 'cooperative',
            styles: [
              { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
              { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
              { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
              { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
              { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
              { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
              { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
              { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
              { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
              { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
              { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
            ],
          },
          onLoad: onMapLoad,
          onClick: onMapClick
        },
        selectedPoint && React.createElement(Marker, { position: selectedPoint })
      )
    )
  );
};

export default MapDisplay;
