// src/components/routing/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthRBAC } from '../../hooks/useAuthRBAC';
import { PERMISOS } from '../../services/constants';

const ProtectedRoute = ({ children, rolesPermitidos, permisoRequerido }) => {
  const { isAuthenticated, isLoading, usuario, checkPermiso } = useAuthRBAC();
  const location = useLocation();

  if (isLoading) {
    // Mostrar un spinner global o layout de carga
    return <div>Cargando sesión...</div>;
  }

  if (!isAuthenticated) {
    // Redirigir al login guardando la ubicación
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Verificar roles
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol_nombre)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // 2. Verificar permiso específico (más granular)
  if (permisoRequerido && !checkPermiso(permisoRequerido)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Si pasa todas las validaciones, renderiza el componente hijo
  return children;
};

// Componente helper para permisos
export const RequirePermission = ({ permiso, children }) => {
  const { checkPermiso } = useAuthRBAC();
  
  if (!checkPermiso(permiso)) {
    return null;
  }
  
  return <>{children}</>;
};


export default ProtectedRoute;