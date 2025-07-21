import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento root");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null, 
    React.createElement(App, null)
  )
);
