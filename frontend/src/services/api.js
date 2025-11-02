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
    // Esta es la línea que ves en el error
    return Promise.reject(new Error('No refresh token available'));
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/token/refresh/`, {
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

    // --- INICIO DE LA CORRECCIÓN ---
    //
    // Si la respuesta es 401, PERO NO es la ruta de login,
    // entonces (y solo entonces) intentamos refrescar el token.
    //
    if (response.status === 401 && endpoint !== '/api/auth/token/') {
    //
    // --- FIN DE LA CORRECCIÓN ---
        
      if (isRefreshing) {
        // (Este es el bug de la cola que corregimos antes)
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newAccessToken) => {
              headers.set('Authorization', `Bearer ${newAccessToken}`);
              resolve(fetch(`${API_URL}${endpoint}`, { ...config, headers }));
            },
            reject,
          });
        })
        .then(res => {
          if (res.status === 204) {
            return null;
          }
          if (!res.ok) {
            return res.json().catch(() => ({ detail: res.statusText }))
              .then(errorData => {
                throw new Error(errorData.detail || 'Error en la solicitud a la API');
              });
          }
          return res.json();
        });
        
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
      // Manejar otros errores HTTP (401 del login, 403, 500, etc.)
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


// --- Endpoints de API (Sin cambios) ---

// 1. Autenticación (Prefijo: /api/auth/)
export const apiLogin = async (username, password) => {
  const response = await request('/api/auth/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setTokens(response.access, response.refresh);
  return response;
};

export const apiGetUserMe = () => {
  return request('/api/auth/user/me/');
};

export const apiLogout = () => {
  clearTokens();
  return Promise.resolve();
};

// 2. Madres (Prefijo: /api/pacientes/)
export const apiGetMadres = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/api/pacientes/madres/?${query}`); // CORREGIDO
};
export const apiGetMadreById = (id) => request(`/api/pacientes/madres/${id}/`); // CORREGIDO
export const apiCreateMadre = (data) => request('/api/pacientes/madres/', { method: 'POST', body: JSON.stringify(data) }); // CORREGIDO
export const apiUpdateMadre = (id, data) => request(`/api/pacientes/madres/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }); // CORREGIDO
export const apiDeleteMadre = (id) => request(`/api/pacientes/madres/${id}/`, { method: 'DELETE' }); // CORREGIDO

// 3. Partos (Prefijo: /api/partos/)
export const apiGetPartos = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/api/partos/partos/?${query}`); // CORREGIDO
};
export const apiGetPartoById = (id) => request(`/api/partos/partos/${id}/`); // CORREGIDO
export const apiCreateParto = (data) => request('/api/partos/partos/', { method: 'POST', body: JSON.stringify(data) }); // CORREGIDO
export const apiUpdateParto = (id, data) => request(`/api/partos/partos/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }); // CORREGIDO
export const apiAnexarCorreccion = (id, data) => request(`/api/partos/partos/${id}/anexar_correccion/`, { method: 'POST', body: JSON.stringify(data) }); // CORREGIDO

// 4. Recién Nacidos (Prefijo: /api/partos/)
export const apiGetRecienNacidos = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/api/partos/recien-nacidos/?${query}`); // CORREGIDO
};
export const apiGetRecienNacidoById = (id) => request(`/api/partos/recien-nacidos/${id}/`); // CORREGIDO
export const apiCreateRecienNacido = (data) => request('/api/partos/recien-nacidos/', { method: 'POST', body: JSON.stringify(data) }); // CORREGIDO
export const apiUpdateRecienNacido = (id, data) => request(`/api/partos/recien-nacidos/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }); // CORREGIDO

// 5. Otros (Prefijo: /api/partos/ y /api/catalogos/)
export const apiGetDefunciones = () => request('/api/partos/defunciones/'); // CORREGIDO
export const apiCreateDefuncion = (data) => request('/api/partos/defunciones/', { method: 'POST', body: JSON.stringify(data) }); // CORREGIDO

export const apiGetDiagnosticos = () => request('/api/catalogos/diagnosticos-cie10/'); // CORREGIDO

// 6. Admin TI (Prefijo: /api/auth/ y /api/)
export const apiGetRoles = () => request('/api/auth/roles/'); 

export const apiGetUsuarios = () => request('/api/auth/usuarios/');
export const apiCreateUsuario = (data) => request('/api/auth/usuarios/', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateUsuario = (id, data) => request(`/api/auth/usuarios/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const apiSoftDeleteUsuario = (id) => request(`/api/auth/usuarios/${id}/`, { method: 'DELETE' }); 

export const apiGetLogs = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/api/auditoria/logs/?${query}`); // CORREGIDO
};