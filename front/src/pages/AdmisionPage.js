// src/pages/AdmisionPage.js
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useNavigate } from 'react-router-dom';
import { validarRUT } from '../utils/validaciones';
import { MENSAJES } from '../services/constants';

// NOTA: Este componente replica el formulario de admisión de tu App.js
// Si tienes 'FormularioAdmision' en un archivo separado, impórtalo y úsalo aquí.

const AdmisionPage = () => {
  const { addMadre, state } = useData();
  const navigate = useNavigate();
  const [datos, setDatos] = useState({
    rut: '',
    nombre: '',
    edad: '',
    fechaNacimiento: '',
    nacionalidad: 'Chilena',
    perteneceaPuebloOriginario: false,
    direccion: '',
    telefono: '',
    prevision: 'FONASA A',
    antecedentes: '',
  });
  const [errores, setErrores] = useState({});
  const [apiError, setApiError] = useState(null);

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!datos.rut) nuevosErrores.rut = 'El RUT es obligatorio';
    else if (!validarRUT(datos.rut)) nuevosErrores.rut = 'RUT inválido';
    if (!datos.nombre) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!datos.edad) nuevosErrores.edad = 'La edad es obligatoria';
    // ... más validaciones
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validarFormulario()) {
      return;
    }

    try {
      await addMadre(datos);
      // alert(MENSAJES.exito.madreRegistrada); // O usar un sistema de notificaciones
      navigate('/'); // Redirigir al dashboard
    } catch (error) {
      setApiError(error.message || MENSAJES.error.errorServidor);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDatos(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 className="texto-2xl font-bold mb-6">Admisión de Madre</h2>
      
      {apiError && (
        <div className="alerta-error mb-4">{apiError}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">RUT *</label>
            <input type="text" name="rut" value={datos.rut} onChange={handleChange}
              className={`input ${errores.rut ? 'input-error' : ''}`} />
            {errores.rut && <p className="mensaje-error">{errores.rut}</p>}
          </div>
          <div className="grupo-input">
            <label className="etiqueta">Nombre Completo *</label>
            <input type="text" name="nombre" value={datos.nombre} onChange={handleChange}
              className={`input ${errores.nombre ? 'input-error' : ''}`} />
            {errores.nombre && <p className="mensaje-error">{errores.nombre}</p>}
          </div>
          {/* ... Repetir para todos los campos: edad, fechaNacimiento, etc. ... */}
        </div>
        
        {/* Ejemplo de un campo más */}
         <div className="grupo-input">
            <label className="etiqueta">Antecedentes Médicos</label>
            <textarea
              name="antecedentes"
              className="textarea"
              rows="3"
              placeholder="Antecedentes médicos relevantes (visible solo para personal clínico)"
              value={datos.antecedentes}
              onChange={handleChange}
            />
          </div>

        <div className="flex gap-4 mt-6">
          <button type="submit" className="boton boton-primario" disabled={state.madres.isLoading}>
            {state.madres.isLoading ? 'Registrando...' : 'Registrar Madre'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="boton boton-gris">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmisionPage;