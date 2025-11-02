// src/components/routing/AppRouter.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layout y Páginas
import MainLayout from '../Layout/MainLayout';
import LoginPage from '../../pages/LoginPage';
import DashboardPage from '../../pages/DashboardPage';
import AdmisionPage from '../../pages/AdmisionPage';
import AdminUsuariosPage from '../../pages/AdminUsuariosPage';
import AuditoriaPage from '../../pages/AuditoriaPage';
import UnauthorizedPage from '../../pages/UnauthorizedPage';
import PartoPage from '../../pages/PartoPage';
// Importa las demás páginas (EditarParto, Correcion, etc.)
// import EditarPartoPage from '../../pages/EditarPartoPage';
// import CorrecionPage from '../../pages/CorrecionPage';
// import ReporteREMPage from '../../pages/ReporteREMPage';

import { ROLES } from '../../services/constants';

const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Rutas Privadas (requieren autenticación) */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard (index) */}
        <Route index element={<DashboardPage />} />

        {/* Admisión (Administrativo, Matrona) */}
        <Route 
          path="admision" 
          element={
            <ProtectedRoute permisoRequerido="crearPaciente">
              <AdmisionPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Registro de Parto (Matrona) */}
        <Route 
          path="parto/nuevo/:madreId" 
          element={
            <ProtectedRoute permisoRequerido="crearRegistroParto">
              <PartoPage />
            </ProtectedRoute>
          } 
        />
        
        {/* TODO: Agregar rutas para EditarParto, CorregirParto, etc. */}
        {/*
        <Route 
          path="parto/editar/:partoId" 
          element={
            <ProtectedRoute permisoRequerido="editarRegistroParto">
              <EditarPartoPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="parto/corregir/:partoId" 
          element={
            <ProtectedRoute permisoRequerido="anexarCorreccion">
              <CorrecionPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="reportes/rem" 
          element={
            <ProtectedRoute permisoRequerido="generarReportes">
              <ReporteREMPage />
            </ProtectedRoute>
          } 
        />
        */}

        {/* Administración (Solo Admin TI) */}
        <Route 
          path="admin/usuarios" 
          element={
            <ProtectedRoute rolesPermitidos={[ROLES.ADMIN_SISTEMA]}>
              <AdminUsuariosPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/auditoria" 
          element={
            <ProtectedRoute rolesPermitidos={[ROLES.ADMIN_SISTEMA]}>
              <AuditoriaPage />
            </ProtectedRoute>
          } 
        />

        {/* Ruta para cualquier otra cosa (404 dentro del layout) */}
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Route>
    </Routes>
  );
};

export default AppRouter;