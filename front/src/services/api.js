// src/services/api.js
import { API_URLS } from '../services/constants';

const API_URL = API_URLS.desarrollo; // Usar la URL base de desarrollo

// --- Gestión de Tokens ---

const getTokens = () => {
  return {
    access: localStorage.getItem('accessToken'),
    refresh: localStorage.getItem('refreshToken'),
  };
};

const setTokens = (access, refresh) => {
  localStorage.setItem('accessToken', access);
  if (refresh) {
    localStorage.setItem('refreshToken', refresh);
  }
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Función de Refresh de Token ---

const refreshToken = async () => {
  isRefreshing = true;
  const { refresh } = getTokens();
  if (!refresh) {
    isRefreshing = false;
    return Promise.reject(new Error('No refresh token available'));
  }

  try {
    const response = await fetch(`${API_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      throw new Error('Refresh token failed');
    }

    const { access } = await response.json();
    setTokens(access);
    processQueue(null, access);
    return access;
  } catch (error) {
    processQueue(error, null);
    clearTokens(); // Logout forzado si el refresh falla
    window.location.href = '/login'; // Redirigir al login
    return Promise.reject(error);
  } finally {
    isRefreshing = false;
  }
};

// --- Request Centralizado con Lógica de Refresh ---

const request = async (endpoint, options = {}) => {
  let { access } = getTokens();

  // Configuración inicial de headers
  const headers = new Headers(options.headers || {});
  headers.append('Content-Type', 'application/json');
  if (access) {
    headers.append('Authorization', `Bearer ${access}`);
  }

  const config = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(`${API_URL}${endpoint}`, config);

    if (response.status === 401) {
      if (isRefreshing) {
        // Si ya se está refrescando, poner la request en cola
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              headers.set('Authorization', `Bearer ${getTokens().access}`);
              resolve(fetch(`${API_URL}${endpoint}`, { ...config, headers }));
            },
            reject,
          });
        })
        .then(res => res.json()); // Asegurarse de que la request reintentada también se parsee
        
      } else {
        // Intentar refrescar el token
        try {
          const newAccessToken = await refreshToken();
          // Reintentar la request original con el nuevo token
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          response = await fetch(`${API_URL}${endpoint}`, { ...config, headers });
        
        } catch (refreshError) {
          // Si el refresh falla, desloguear (manejado en refreshToken)
          return Promise.reject(refreshError);
        }
      }
    }

    if (!response.ok) {
      // Manejar otros errores HTTP (403, 500, etc.)
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || 'Error en la solicitud a la API');
    }
    
    // Manejar respuestas sin contenido (ej. 204 No Content)
    if (response.status === 204) {
      return null;
    }

    return response.json();

  } catch (error) {
    console.error('Error en servicio API:', error);
    throw error;
  }
};

// --- Endpoints de API ---

// 1. Autenticación
export const apiLogin = async (username, password) => {
  const response = await request('/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setTokens(response.access, response.refresh);
  return response;
};

export const apiGetUserMe = () => {
  return request('/user/me/');
};

export const apiLogout = () => {
  // Opcional: invalidar refresh token en backend si la API lo soporta
  clearTokens();
  return Promise.resolve();
};

// 2. Madres
export const apiGetMadres = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/madres/?${query}`);
};
export const apiGetMadreById = (id) => request(`/madres/${id}/`);
export const apiCreateMadre = (data) => request('/madres/', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateMadre = (id, data) => request(`/madres/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const apiDeleteMadre = (id) => request(`/madres/${id}/`, { method: 'DELETE' });

// 3. Partos
export const apiGetPartos = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/partos/?${query}`);
};
export const apiGetPartoById = (id) => request(`/partos/${id}/`);
export const apiCreateParto = (data) => request('/partos/', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateParto = (id, data) => request(`/partos/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const apiAnexarCorreccion = (id, data) => request(`/partos/${id}/anexar_correccion/`, { method: 'POST', body: JSON.stringify(data) });

// 4. Recién Nacidos
export const apiGetRecienNacidos = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/recien-nacidos/?${query}`);
};
export const apiGetRecienNacidoById = (id) => request(`/recien-nacidos/${id}/`);
export const apiCreateRecienNacido = (data) => request('/recien-nacidos/', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateRecienNacido = (id, data) => request(`/recien-nacidos/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });

// 5. Otros
export const apiGetDefunciones = () => request('/defunciones/');
export const apiCreateDefuncion = (data) => request('/defunciones/', { method: 'POST', body: JSON.stringify(data) });

export const apiGetDiagnosticos = () => request('/diagnosticos-cie10/');
export const apiGetRoles = () => request('/roles/');

// 6. Admin TI
export const apiGetUsuarios = () => request('/usuarios/');
export const apiCreateUsuario = (data) => request('/usuarios/', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateUsuario = (id, data) => request(`/usuarios/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const apiSoftDeleteUsuario = (id) => request(`/usuarios/${id}/`, { method: 'DELETE' }); // Soft delete

export const apiGetLogs = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/logs/?${query}`);
};