// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { apiLogin, apiGetUserMe, apiLogout } from '../services/api';
import { ROLES, TURNOS } from '../services/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarUsuario = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }

    // Intentar obtener datos del usuario (la API se encargará del refresh si es necesario)
    try {
      const userData = await apiGetUserMe();
      
      // Re-hidratar el turno seleccionado si aplica
      const rolNombre = userData.rol_nombre.toLowerCase();
      let turnoSeleccionado = null;
      if (rolNombre === ROLES.MATRONA || rolNombre === ROLES.ENFERMERA) {
        turnoSeleccionado = localStorage.getItem('sessionTurno') || TURNOS.DIURNO;
      }
      
      setUsuario({ ...userData, turnoSeleccionado });
      setIsAuthenticated(true);
    } catch (e) {
      // El refresh token falló o la sesión es inválida
      apiLogout(); // Limpia tokens
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuario();
  }, [cargarUsuario]);

  const login = async (username, password, turno) => {
    setError(null);
    setIsLoading(true);
    try {
      // 1. Obtener tokens
      await apiLogin(username, password);
      
      // 2. Obtener datos del usuario
      const userData = await apiGetUserMe();
      
      // 3. Almacenar el turno seleccionado si aplica
      const rolNombre = userData.rol_nombre.toLowerCase();
      let turnoSeleccionado = null;
      if (rolNombre === ROLES.MATRONA || rolNombre === ROLES.ENFERMERA) {
        turnoSeleccionado = turno;
        localStorage.setItem('sessionTurno', turno);
      }

      setUsuario({ ...userData, turnoSeleccionado });
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      apiLogout(); // Limpiar tokens si el login falla
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUsuario(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sessionTurno');
  };

  const value = {
    usuario,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuthStatus: cargarUsuario // Exponer para re-verificar
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;