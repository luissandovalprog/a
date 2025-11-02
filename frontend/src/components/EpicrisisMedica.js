// src/componentes/EpicrisisMedica.js
import React, { useState } from 'react';
import { FileText, Pill, AlertCircle, Save, X, Plus, Trash2 } from 'lucide-react';

const EpicrisisMedica = ({ parto, madre, onGuardar, onCancelar }) => {
  const [epicrisis, setEpicrisis] = useState({
    motivoIngreso: '',
    resumenEvolucion: '',
    diagnosticoEgreso: '',
    condicionEgreso: 'buena',
    indicacionesAlta: '',
    controlPosterior: '',
    observaciones: ''
  });

  const [indicaciones, setIndicaciones] = useState([]);
  const [nuevaIndicacion, setNuevaIndicacion] = useState({
    tipo: 'medicamento',
    descripcion: '',
    dosis: '',
    via: 'oral',
    frecuencia: ''
  });

  const agregarIndicacion = () => {
    if (!nuevaIndicacion.descripcion) {
      alert('Debe ingresar una descripción para la indicación');
      return;
    }
    setIndicaciones([...indicaciones, { ...nuevaIndicacion, id: Date.now() }]);
    setNuevaIndicacion({
      tipo: 'medicamento', descripcion: '', dosis: '', via: 'oral', frecuencia: ''
    });
  };

  const eliminarIndicacion = (id) => {
    setIndicaciones(indicaciones.filter(ind => ind.id !== id));
  };

  const handleGuardar = () => {
    if (!epicrisis.diagnosticoEgreso || !epicrisis.resumenEvolucion) {
      alert('Complete los campos obligatorios: Diagnóstico de Egreso y Resumen de Evolución');
      return;
    }
    // El contenedor (página) se encargará de añadir IDs de madre, parto y médico
    onGuardar({ epicrisis, indicaciones });
  };

  return (
    <div className="animacion-entrada" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Información del paciente */}
      <div className="tarjeta mb-6">
        <h2 className="texto-2xl font-bold mb-4">Epicrisis e Indicaciones Médicas</h2>
        <div className="p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="texto-sm texto-gris">Paciente</p>
              <p className="font-semibold">{madre.nombre}</p>
              <p className="texto-sm">RUT: {madre.rut} | Edad: {madre.edad} años</p>
            </div>
            {parto && (
              <div>
                <p className="texto-sm texto-gris">Recién Nacido</p>
                <p className="font-semibold">{parto.rnId}</p>
                <p className="texto-sm">Peso: {parto.pesoRN}g | APGAR: {parto.apgar1}/{parto.apgar5}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Epicrisis */}
      <div className="tarjeta mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={24} style={{ color: '#2563eb' }} />
          <h3 className="texto-xl font-bold">Epicrisis</h3>
        </div>
        <div className="grid gap-4">
          {/* ... (todos los campos del formulario de epicrisis: motivoIngreso, resumenEvolucion, etc.) ... */}
           <div className="grupo-input">
            <label className="etiqueta">Resumen de Evolución *</label>
            <textarea
              className="textarea"
              rows="4"
              placeholder="Describa la evolución del paciente"
              value={epicrisis.resumenEvolucion}
              onChange={(e) => setEpicrisis({ ...epicrisis, resumenEvolucion: e.target.value })}
            />
          </div>
          <div className="grupo-input">
            <label className="etiqueta">Diagnóstico de Egreso *</label>
            <textarea
              className="textarea"
              rows="3"
              placeholder="Diagnóstico principal y secundarios"
              value={epicrisis.diagnosticoEgreso}
              onChange={(e) => setEpicrisis({ ...epicrisis, diagnosticoEgreso: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Sección de Indicaciones Médicas */}
      <div className="tarjeta mb-6">
         <div className="flex items-center gap-2 mb-4">
          <Pill size={24} style={{ color: '#10b981' }} />
          <h3 className="texto-xl font-bold">Indicaciones Médicas</h3>
        </div>
        
        {/* Formulario nueva indicación */}
        <div className="p-4 mb-4" style={{ backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '2px solid #10b981' }}>
           <h4 className="font-semibold mb-3">Nueva Indicación</h4>
           {/* ... (formulario de nueva indicación) ... */}
           <div className="grupo-input">
              <label className="etiqueta">Descripción *</label>
              <input
                type="text"
                className="input"
                placeholder="Ej: Paracetamol 500mg"
                value={nuevaIndicacion.descripcion}
                onChange={(e) => setNuevaIndicacion({ ...nuevaIndicacion, descripcion: e.target.value })}
              />
            </div>
           <button onClick={agregarIndicacion} className="boton boton-secundario mt-3">
            <Plus size={18} /> Agregar Indicación
           </button>
        </div>
        
        {/* Lista de indicaciones */}
        {indicaciones.length === 0 ? (
          <p className="texto-centro texto-gris py-4">No hay indicaciones médicas agregadas</p>
        ) : (
          <div className="grid gap-3">
            {indicaciones.map((indicacion) => (
              <div key={indicacion.id} className="p-4" style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold">{indicacion.descripcion}</span>
                    <p className="texto-sm texto-gris">{indicacion.dosis} {indicacion.via} {indicacion.frecuencia}</p>
                  </div>
                  <button
                    onClick={() => eliminarIndicacion(indicacion.id)}
                    className="boton" style={{ padding: '0.5rem', backgroundColor: '#ef4444', color: 'white' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4">
        <button
          onClick={handleGuardar}
          className="boton boton-primario"
          style={{ flex: 1 }}
        >
          <Save size={20} />
          Guardar Epicrisis e Indicaciones
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
  );
};

export default EpicrisisMedica;