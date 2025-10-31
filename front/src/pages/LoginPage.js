// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TURNOS } from '../services/constants';
import { Baby } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [turno, setTurno] = useState(TURNOS.DIURNO); // Valor por defecto
  
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    const success = await login(username, password, turno);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="tarjeta" style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            backgroundColor: '#2563eb', color: 'white', borderRadius: '50%',
            width: '80px', height: '80px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <Baby size={40} />
          </div>
          <h1 className="texto-3xl font-bold mb-4">SIGN - Sistema de Partos</h1>
          <p className="texto-gris">Hospital Clínico Herminda Martín</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grupo-input">
            <label className="etiqueta" htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              className="input"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="grupo-input">
            <label className="etiqueta" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="grupo-input">
            <label className="etiqueta" htmlFor="turno">Turno (si aplica)</label>
            <select
              id="turno"
              className="select"
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
            >
              <option value={TURNOS.DIURNO}>Diurno (08:00 - 20:00)</option>
              <option value={TURNOS.NOCTURNO}>Nocturno (20:00 - 08:00)</option>
              <option value={TURNOS.VESPERTINO}>Vespertino (14:00 - 22:00)</option>
            </select>
          </div>
          
          {error && (
            <div className="alerta-error" style={{padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="boton boton-primario"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
      {/* Asegúrate de que las clases .tarjeta, .input, etc., estén definidas en main.css */}
    </div>
  );
};

export default LoginPage;