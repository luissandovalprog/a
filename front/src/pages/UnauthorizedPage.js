// src/pages/UnauthorizedPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div className="tarjeta" style={{ maxWidth: '500px' }}>
        <AlertTriangle size={60} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h1 className="texto-3xl font-bold mb-4">Acceso Denegado (403)</h1>
        <p className="texto-lg texto-gris mb-6">
          Su rol de usuario no tiene los permisos necesarios para acceder a esta sección.
        </p>
        <Link to="/" className="boton boton-primario">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;