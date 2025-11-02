// src/pages/AdminUsuariosPage.js
import React, { useEffect, useState } from 'react';
import { useData } from '../hooks/useData';
import GestionUsuarios from '../components/GestionUsuarios'; // Importamos tu componente

const AdminUsuariosPage = () => {
  const { state, fetchUsuarios, updateUsuario, deleteUsuario, fetchRoles } = useData();
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsuarios();
    fetchRoles(); // Cargar roles para el dropdown de edición
  }, [fetchUsuarios, fetchRoles]);

  const handleGuardar = async (datosUsuario) => {
    try {
      setError(null);
      await updateUsuario(datosUsuario.id, datosUsuario);
      fetchUsuarios(); // Recargar la lista
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDesactivar = async (usuarioId) => {
    try {
      setError(null);
      if (window.confirm('¿Está seguro de desactivar (soft delete) este usuario?')) {
        await deleteUsuario(usuarioId);
        fetchUsuarios(); // Recargar la lista
      }
    } catch (e) {
      setError(e.message);
    }
  };

  // Preparamos una función para "mostrar alerta"
  const mostrarAlerta = (mensaje, tipo) => {
    // En una app real, esto usaría un contexto de Notificaciones
    if (tipo === 'error') {
      setError(mensaje);
    } else {
      setError(null); // Asumimos éxito
    }
  };
  
  if (state.usuarios.isLoading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className="animacion-entrada">
      {error && (
        <div className="alerta-error mb-4">{error}</div>
      )}
      <GestionUsuarios
        usuarios={state.usuarios.data}
        onGuardarUsuario={handleGuardar}
        onDesactivarUsuario={handleDesactivar}
        mostrarAlerta={mostrarAlerta}
        // Pasamos los roles del backend si el componente los necesita
        // rolesDisponibles={state.roles.data} 
      />
    </div>
  );
};

export default AdminUsuariosPage;