// src/componentes/GestionUsuarios.js
import React, { useState } from 'react';
import { Shield, UserPlus, Edit2, UserX, Save, X } from 'lucide-react';
import { ROLES, TURNOS, MENSAJES } from '../utilidades/constantes';

const GestionUsuarios = ({ usuarios = [], onGuardarUsuario, onDesactivarUsuario, mostrarAlerta }) => {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    username: '',
    rol: ROLES.ENFERMERA,
    turno: TURNOS.DIURNO,
    activo: true
  });

  const iniciarNuevoUsuario = () => {
    setFormulario({
      nombre: '',
      username: '',
      rol: ROLES.ENFERMERA,
      turno: TURNOS.DIURNO,
      activo: true
    });
    setUsuarioEditando(null);
    setModoEdicion(true);
  };

  const iniciarEdicion = (usuario) => {
    setFormulario({
      nombre: usuario.nombre_completo, // Ajustado a la API
      username: usuario.username,
      rol: usuario.rol_nombre.toLowerCase(), // Ajustado a la API
      turno: usuario.turno || TURNOS.DIURNO,
      activo: usuario.activo
    });
    setUsuarioEditando(usuario);
    setModoEdicion(true);
  };

  const handleGuardar = () => {
    if (!formulario.nombre || !formulario.username) {
      mostrarAlerta(MENSAJES.error.camposObligatorios, 'error');
      return;
    }
    
    // La API espera el UUID del rol, no el nombre.
    // En una implementación real, `rolesDisponibles` (de /api/roles/) 
    // se usaría para buscar el ID del rol.
    // Por ahora, simulamos que el backend acepta el `rol_nombre`.
    const datosUsuario = {
      ...formulario,
      id: usuarioEditando?.id || null, // ID para actualizar, o null para crear
      rol_nombre: formulario.rol, // El backend debería inferir el ID de rol
    };

    onGuardarUsuario(datosUsuario);
    setModoEdicion(false);
  };

  const handleDesactivar = (usuario) => {
    if (window.confirm(`¿Está seguro de desactivar al usuario ${usuario.nombre_completo}?`)) {
      onDesactivarUsuario(usuario.id);
    }
  };

  const rolesConTurno = [ROLES.ENFERMERA, ROLES.MATRONA];
  
  // Mapear los roles de la API a los roles de constantes.js
  const mapApiRol = (apiRolNombre) => {
    return apiRolNombre.toLowerCase();
  };

  return (
    <div className="tarjeta">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="texto-2xl font-bold">Gestión de Usuarios</h2>
          <p className="texto-sm texto-gris mt-1">
            Administración de cuentas y asignación de roles
          </p>
        </div>
        {!modoEdicion && (
          <button
            onClick={iniciarNuevoUsuario}
            className="boton boton-primario"
          >
            <UserPlus size={20} />
            Nuevo Usuario
          </button>
        )}
      </div>

      {modoEdicion ? (
        <div className="p-6" style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
          <h3 className="texto-xl font-bold mb-4">
            {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="grupo-input">
              <label className="etiqueta">Nombre Completo *</label>
              <input
                type="text"
                className="input"
                placeholder="Juan Pérez"
                value={formulario.nombre}
                onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
              />
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Usuario (Login) *</label>
              <input
                type="text"
                className="input"
                placeholder="jperez"
                value={formulario.username}
                onChange={(e) => setFormulario({ ...formulario, username: e.target.value })}
                disabled={!!usuarioEditando}
              />
            </div>

            <div className="grupo-input">
              <label className="etiqueta">Rol *</label>
              <select
                className="select"
                value={formulario.rol}
                onChange={(e) => setFormulario({ ...formulario, rol: e.target.value })}
              >
                {Object.values(ROLES).map(rol => (
                  <option key={rol} value={rol}>{rol.charAt(0).toUpperCase() + rol.slice(1)}</option>
                ))}
              </select>
            </div>

            {rolesConTurno.includes(formulario.rol) && (
              <div className="grupo-input">
                <label className="etiqueta">Turno Asignado *</label>
                <select
                  className="select"
                  value={formulario.turno}
                  onChange={(e) => setFormulario({ ...formulario, turno: e.target.value })}
                >
                  <option value={TURNOS.DIURNO}>Diurno</option>
                  <option value={TURNOS.NOCTURNO}>Nocturno</option>
                  <option value={TURNOS.VESPERTINO}>Vespertino</option>
                </select>
              </div>
            )}
            
            {/* ... (resto del formulario) ... */}

          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleGuardar} className="boton boton-primario">
              <Save size={20} /> Guardar
            </button>
            <button onClick={() => setModoEdicion(false)} className="boton boton-gris">
              <X size={20} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Turno</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan="6" className="texto-centro">No hay usuarios</td></tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="font-semibold">{usuario.nombre_completo}</td>
                    <td>{usuario.username}</td>
                    <td>
                      <span className="texto-sm font-semibold">
                        {usuario.rol_nombre}
                      </span>
                    </td>
                    <td>
                      {rolesConTurno.includes(mapApiRol(usuario.rol_nombre)) ? (
                        <span className="texto-sm">
                          {usuario.turno_display || '-'}
                        </span>
                      ) : (
                        <span className="texto-sm texto-gris">N/A</span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        color: 'white',
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                        backgroundColor: usuario.activo ? '#10b981' : '#ef4444',
                      }}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => iniciarEdicion(usuario)}
                          className="boton" style={{ padding: '0.5rem', backgroundColor: '#3b82f6', color: 'white' }}
                          title="Editar usuario"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDesactivar(usuario)}
                          className="boton" style={{ padding: '0.5rem', backgroundColor: '#ef4444', color: 'white' }}
                          title="Desactivar usuario"
                          disabled={!usuario.activo}
                        >
                          <UserX size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* ... (Advertencia RBAC) ... */}
    </div>
  );
};

export default GestionUsuarios;