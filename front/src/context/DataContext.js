// src/context/DataContext.js
import React, { createContext, useReducer, useCallback } from 'react';
import * as api from '../services/api';

const DataContext = createContext(null);

const initialState = {
  madres: { data: [], total: 0, isLoading: false, error: null },
  partos: { data: [], total: 0, isLoading: false, error: null },
  usuarios: { data: [], total: 0, isLoading: false, error: null },
  diagnosticos: { data: [], isLoading: false, error: null },
  roles: { data: [], isLoading: false, error: null },
  logs: { data: [], total: 0, isLoading: false, error: null },
};

const reducer = (state, action) => {
  const { type, payload, resource } = action;

  switch (type) {
    case 'FETCH_START':
      return {
        ...state,
        [resource]: { ...state[resource], isLoading: true, error: null },
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        [resource]: { 
          data: payload.results || payload, // Asumiendo paginación (results) o lista simple
          total: payload.count || (payload.results || payload).length,
          isLoading: false, 
          error: null 
        },
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        [resource]: { ...state[resource], isLoading: false, error: payload },
      };
    // Casos para CUD (Crear, Actualizar, Borrar)
    // Estos son simplificados; en una app real, se actualizaría el array 'data'.
    case 'ACTION_SUCCESS':
      return {
        ...state,
        [resource]: { ...state[resource], isLoading: false, error: null },
      };
    case 'ACTION_START':
      return {
        ...state,
        [resource]: { ...state[resource], isLoading: true, error: null },
      };
    case 'ACTION_ERROR':
      return {
        ...state,
        [resource]: { ...state[resource], isLoading: false, error: payload },
      };
    default:
      return state;
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // --- Funciones Genéricas ---
  const fetchData = useCallback(async (resource, apiFunc, params) => {
    dispatch({ type: 'FETCH_START', resource });
    try {
      const data = await apiFunc(params);
      dispatch({ type: 'FETCH_SUCCESS', resource, payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', resource, payload: error.message });
    }
  }, []);

  const executeAction = useCallback(async (resource, apiFunc, ...args) => {
    dispatch({ type: 'ACTION_START', resource });
    try {
      const result = await apiFunc(...args);
      dispatch({ type: 'ACTION_SUCCESS', resource });
      return result;
    } catch (error) {
      dispatch({ type: 'ACTION_ERROR', resource, payload: error.message });
      throw error;
    }
  }, []);

  // --- Métodos Expuestos ---
  const value = {
    state,
    
    // Madres
    fetchMadres: (params) => fetchData('madres', api.apiGetMadres, params),
    addMadre: (data) => executeAction('madres', api.apiCreateMadre, data),
    updateMadre: (id, data) => executeAction('madres', api.apiUpdateMadre, id, data),
    
    // Partos
    fetchPartos: (params) => fetchData('partos', api.apiGetPartos, params),
    addParto: (data) => executeAction('partos', api.apiCreateParto, data),
    updateParto: (id, data) => executeAction('partos', api.apiUpdateParto, id, data),
    anexarCorreccion: (id, data) => executeAction('partos', api.apiAnexarCorreccion, id, data),

    // Usuarios (Admin)
    fetchUsuarios: () => fetchData('usuarios', api.apiGetUsuarios),
    updateUsuario: (id, data) => executeAction('usuarios', api.apiUpdateUsuario, id, data),
    deleteUsuario: (id) => executeAction('usuarios', api.apiSoftDeleteUsuario, id),
    
    // Logs (Admin)
    fetchLogs: (params) => fetchData('logs', api.apiGetLogs, params),

    // Catálogos
    fetchDiagnosticos: () => fetchData('diagnosticos', api.apiGetDiagnosticos),
    fetchRoles: () => fetchData('roles', api.apiGetRoles),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;