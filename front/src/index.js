// src/index.js
// Polyfills para navegadores antiguos (Win7/IE11)
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css'; // Tus estilos globales
import App from './App'; // El nuevo App.js

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    // StrictMode ya está en App.js, pero no hace daño tenerlo aquí también.
    // Lo quitaré para seguir tu archivo al pie de la letra.
    // <React.StrictMode> 
    //   <App />
    // </React.StrictMode>
    
    // Siguiendo tu index.js (que movió StrictMode a App.js):
     <App />
);