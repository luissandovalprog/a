// src/hooks/useAuthRBAC.js
import { useAuth } from './useAuth';
import { PERMISOS } from '../services/constants';

/**
 * Hook para obtener el usuario y su objeto de permisos (RBAC)
 */
export const useAuthRBAC = () => {
  const { usuario, ...authRest } = useAuth();
  
  const rol = usuario?.rol_nombre?.toLowerCase() || 'anonimo';
  const permisos = PERMISOS[rol] || {};

  const checkPermiso = (permisoKey) => {
    return !!permisos[permisoKey];
  };

  return {
    usuario,
    rol,
    permisos,
    checkPermiso,
    ...authRest,
  };
};