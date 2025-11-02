// src/componentes/Partograma.js
import React, { useState } from 'react';
import { Activity, Heart, Droplets, TrendingUp, Save, X, Plus, Clock } from 'lucide-react';

const Partograma = ({ parto, madre, onGuardar, onCancelar, soloLectura = false }) => {
  const [registros, setRegistros] = useState([]);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    hora: new Date().toTimeString().slice(0, 5),
    dilatacion: '',
    fcf: '', // Frecuencia Cardíaca Fetal
    contracciones: '',
    presionArterial: '',
    observaciones: ''
  });

  const agregarRegistro = () => {
    if (!nuevoRegistro.hora || !nuevoRegistro.dilatacion || !nuevoRegistro.fcf) {
      alert('Complete los campos obligatorios: Hora, Dilatación y FCF');
      return;
    }
    setRegistros([...registros, { ...nuevoRegistro, id: Date.now() }]);
    setNuevoRegistro({
      hora: new Date().toTimeString().slice(0, 5),
      dilatacion: '', fcf: '', contracciones: '', presionArterial: '', observaciones: ''
    });
  };

  const handleGuardar = () => {
    if (registros.length === 0) {
      alert('Debe agregar al menos un registro al partograma');
      return;
    }
    // El contenedor (página) añadirá los IDs
    onGuardar({ registros });
  };

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="mb-6">
        <h2 className="texto-2xl font-bold mb-2">Partograma Electrónico</h2>
        <div className="p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
          <p className="font-semibold">Madre: {madre.nombre} (RUT: {madre.rut})</p>
        </div>
      </div>

      {/* Formulario para nuevo registro */}
      {!soloLectura && (
        <div className="tarjeta mb-6" style={{ backgroundColor: '#f0fdf4', border: '2px solid #10b981' }}>
          <h3 className="font-semibold mb-4">Nuevo Registro</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* ... (campos del formulario: hora, dilatacion, fcf, etc.) ... */}
            <div className="grupo-input">
              <label className="etiqueta">Hora *</label>
              <input
                type="time"
                className="input"
                value={nuevoRegistro.hora}
                onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, hora: e.target.value })}
              />
            </div>
            <div className="grupo-input">
              <label className="etiqueta">Dilatación (cm) *</label>
              <input
                type="number"
                className="input"
                placeholder="0-10"
                value={nuevoRegistro.dilatacion}
                onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, dilatacion: e.target.value })}
              />
            </div>
            <div className="grupo-input">
              <label className="etiqueta">FCF (lat/min) *</label>
              <input
                type="number"
                className="input"
                placeholder="110-160"
                value={nuevoRegistro.fcf}
                onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, fcf: e.target.value })}
              />
            </div>
          </div>
          <button onClick={agregarRegistro} className="boton boton-secundario mt-4">
            <Plus size={18} /> Agregar Registro
          </button>
        </div>
      )}

      {/* Tabla de registros */}
      <div className="tarjeta">
        <h3 className="font-semibold mb-4">Registros del Partograma ({registros.length})</h3>
        {registros.length === 0 ? (
          <p className="texto-centro texto-gris py-6">No hay registros</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th><Clock size={16} /> Hora</th>
                  <th><TrendingUp size={16} /> Dilatación</th>
                  <th><Heart size={16} /> FCF</th>
                  <th><Activity size={16} /> Contracciones</th>
                  <th><Droplets size={16} /> PA</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.id}>
                    <td className="font-semibold">{registro.hora}</td>
                    <td>{registro.dilatacion} cm</td>
                    <td>{registro.fcf} lat/min</td>
                    <td>{registro.contracciones || '-'} / 10min</td>
                    <td>{registro.presionArterial || '-'}</td>
                    <td className="texto-sm">{registro.observaciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      {!soloLectura && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleGuardar}
            className="boton boton-primario"
            style={{ flex: 1 }}
            disabled={registros.length === 0}
          >
            <Save size={20} /> Guardar Partograma
          </button>
          <button
            onClick={onCancelar}
            className="boton boton-gris"
            style={{ flex: 1 }}
          >
            <X size={20} /> Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default Partograma;