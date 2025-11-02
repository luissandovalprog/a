// src/components/Layout/MainLayout.js
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthRBAC } from '../../hooks/useAuthRBAC';
import { Baby, LogOut, Home, UserPlus, Users, Shield, BarChart3 } from 'lucide-react';

const MainLayout = () => {
  const { usuario, logout, permisos } = useAuthRBAC();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Encabezado */}
      <nav style={{
          backgroundColor: '#2563eb',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '0.75rem 2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Baby size={36} />
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>SIGN - Sistema de Gestión Neonatal</h1>
              <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {usuario?.nombre_completo} ({usuario?.rol_nombre})
                {usuario?.turnoSeleccionado && ` | Turno: ${usuario.turnoSeleccionado}`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/" className="boton-nav">
              <Home size={20} /> Inicio
            </Link>

            {/* Renderizado Condicional basado en PERMISOS */}
            {permisos.crearPaciente && (
              <Link to="/admision" className="boton-nav">
                <UserPlus size={20} /> Admisión
              </Link>
            )}

            {permisos.generarReportes && (
              <Link to="/reportes/rem" className="boton-nav">
                <BarChart3 size={18} /> Reporte REM
              </Link>
            )}
            
            {permisos.gestionarUsuarios && (
              <Link to="/admin/usuarios" className="boton-nav">
                <Users size={20} /> Usuarios
              </Link>
            )}

            {permisos.verAuditoria && (
              <Link to="/admin/auditoria" className="boton-nav">
                <Shield size={20} /> Auditoría
              </Link>
            )}

            <button onClick={handleLogout} className="boton-nav-peligro">
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido de la Página */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <Outlet /> {/* Aquí se renderizan las páginas (DashboardPage, AdmisionPage, etc.) */}
      </main>

      {/* Pie de Página */}
      <footer style={{
          backgroundColor: '#1f2937',
          color: 'white',
          textAlign: 'center',
          padding: '1.5rem',
          marginTop: '3rem',
      }}>
        <p style={{ fontSize: '0.875rem' }}>SIGN - Sistema Integrado de Gestión Neonatal v2.0 (Arquitectura Modular)</p>
        <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
          Hospital Clínico Herminda Martín - Chillán, Chile
        </p>
      </footer>
      
      {/* Estilos simples para botones de navegación (para no depender de main.css) */}
      <style>{`
        .boton-nav, .boton-nav-peligro {
          background-color: rgba(255,255,255,0.2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .boton-nav:hover {
          background-color: rgba(255,255,255,0.3);
        }
        .boton-nav-peligro {
          background-color: #ef4444;
        }
        .boton-nav-peligro:hover {
          background-color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;