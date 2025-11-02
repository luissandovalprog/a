// src/componentes/EditarParto.js
import React, { useState } from 'react';
import { Edit3, Save, X, Clock, AlertTriangle } from 'lucide-react';
import { VENTANA_EDICION_PARTO } from '../utilidades/constantes';

const EditarParto = ({ parto, madre, onGuardar, onCancelar }) => {
  const [datos, setDatos] = useState({
    tipo: parto.tipo,
    fecha: parto.fecha,
    hora: parto.hora,
    pesoRN: parto.pesoRN,
    tallaRN: parto.tallaRN,
    apgar1: parto.apgar1,
    apgar5: parto.apgar5,
    corticoides: parto.corticoides || 'no',
    observaciones: parto.observaciones || ''
  });
  const [errores, setErrores] = useState({});

  // Calcular tiempo restante de edición
  const tiempoTranscurrido = Date.now() - new Date(parto.fechaRegistro).getTime();
  const tiempoRestanteMs = Math.max(0, VENTANA_EDICION_PARTO - tiempoTranscurrido);
  const horasRestantes = Math.floor(tiempoRestanteMs / (1000 * 60 * 60));
  const minutosRestantes = Math.floor((tiempoRestanteMs / (1000 * 60)) % 60);
  
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!datos.pesoRN) nuevosErrores.pesoRN = 'El peso es obligatorio';
    else if (datos.pesoRN < 500 || datos.pesoRN > 6000) {
      nuevosErrores.pesoRN = 'Peso fuera del rango válido (500-6000g)';
    }
    
    if (!datos.tallaRN) nuevosErrores.tallaRN = 'La talla es obligatoria';
    else if (datos.tallaRN < 30 || datos.tallaRN > 70) {
      nuevosErrores.tallaRN = 'Talla fuera del rango válido (30-70cm)';
    }
    
    if (datos.apgar1 === '' || datos.apgar1 === null) nuevosErrores.apgar1 = 'APGAR 1min es obligatorio';
    if (datos.apgar5 === '' || datos.apgar5 === null) nuevosErrores.apgar5 = 'APGAR 5min es obligatorio';
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onGuardar(datos);
    }
  };

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Advertencia de ventana temporal */}
      <div
        className="mb-6 p-4"
        style={{
          backgroundColor: horasRestantes < 1 ? '#fee2e2' : '#fef3c7',
          borderLeft: `4px solid ${horasRestantes < 1 ? '#ef4444' : '#f59e0b'}`,
          borderRadius: '0.5rem'
        }}
      >
        <div className="flex items-start gap-3">
          <Clock size={24} style={{ color: horasRestantes < 1 ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
          <div>
            <p className="font-semibold" style={{ color: horasRestantes < 1 ? '#991b1b' : '#92400e' }}>
              Ventana de Edición: {horasRestantes}h {minutosRestantes}min restantes
            </p>
            <p className="texto-sm mt-1" style={{ color: horasRestantes < 1 ? '#991b1b' : '#92400e' }}>
              Puede editar este registro solo dentro de las primeras 2 horas.
            </p>
          </div>
        </div>
      </div>

      <h2 className="texto-2xl font-bold mb-4 flex items-center gap-2">
        <Edit3 size={28} style={{ color: '#2563eb' }} />
        Editar Registro de Parto
      </h2>

      {/* Información del parto */}
      <div className="mb-6 p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="texto-sm texto-gris">Madre</p>
            <p className="font-semibold">{madre?.nombre}</p>
            <p className="texto-sm">RUT: {madre?.rut}</p>
          </div>
          <div>
            <p className="texto-sm texto-gris">Recién Nacido</p>
            <p className="font-semibold">{parto.rnId}</p>
            <p className="texto-sm">
              Registrado: {new Date(parto.fechaRegistro).toLocaleString('es-CL')}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Tipo de Parto *</label>
            <select
              className="select"
              value={datos.tipo}
              onChange={(e) => setDatos({ ...datos, tipo: e.target.value })}
            >
              <option value="Vaginal">Vaginal</option>
              <option value="Cesárea">Cesárea</option>
              <option value="Fórceps">Fórceps</option>
              <option value="Ventosa">Ventosa</option>
            </select>
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta">Fecha *</label>
            <input
              type="date"
              className="input"
              value={datos.fecha}
              onChange={(e) => setDatos({ ...datos, fecha: e.target.value })}
            />
          </div>
        </div>
        
        {/* ... (resto de campos: hora, peso, talla, apgar, corticoides, observaciones) ... */}

        <div className="grid grid-cols-3 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Talla del RN (cm) *</label>
            <input
              type="number"
              className={`input ${errores.tallaRN ? 'input-error' : ''}`}
              placeholder="50"
              value={datos.tallaRN}
              onChange={(e) => setDatos({ ...datos, tallaRN: e.target.value })}
              min="30"
              max="70"
            />
            {errores.tallaRN && <p className="mensaje-error">{errores.tallaRN}</p>}
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta">APGAR 1 min *</label>
            <input
              type="number"
              className={`input ${errores.apgar1 ? 'input-error' : ''}`}
              placeholder="9"
              value={datos.apgar1}
              onChange={(e) => setDatos({ ...datos, apgar1: e.target.value })}
              min="0"
              max="10"
            />
            {errores.apgar1 && <p className="mensaje-error">{errores.apgar1}</p>}
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta">APGAR 5 min *</label>
            <input
              type="number"
              className={`input ${errores.apgar5 ? 'input-error' : ''}`}
              placeholder="10"
              value={datos.apgar5}
              onChange={(e) => setDatos({ ...datos, apgar5: e.target.value })}
              min="0"
              max="10"
            />
            {errores.apgar5 && <p className="mensaje-error">{errores.apgar5}</p>}
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <button onClick={handleSubmit} className="boton boton-primario" style={{ flex: 1 }}>
            <Save size={20} />
            Guardar Cambios
          </button>
          <button
            onClick={onCancelar}
            className="boton boton-gris"
            style={{ flex: 1 }}
          >
            <X size={20} />
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarParto;