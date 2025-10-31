// src/componentes/VistaPartogramas.js
import React, { useState, useMemo } from 'react';
import { Activity, X, Search, Eye, Heart, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VistaPartogramas = ({ partogramas = [], madres = [] }) => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [partogramaSeleccionado, setPartogramaSeleccionado] = useState(null);

  const madresMap = useMemo(() => new Map(madres.map(m => [m.id, m])), [madres]);

  const partogramasFiltrados = useMemo(() => {
    return (partogramas || []).filter(part => {
      const madre = madresMap.get(part.madreId);
      return !busqueda || 
        madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        madre?.rut.toLowerCase().includes(busqueda.toLowerCase());
    });
  }, [partogramas, madresMap, busqueda]);


  // (Componente interno DetallePartograma - sin cambios de tu archivo)
  const DetallePartograma = ({ partograma }) => {
    const madre = madresMap.get(partograma.madreId);
    return (
       <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 2000
      }}>
        <div className="tarjeta" style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="texto-2xl font-bold">Detalle del Partograma</h3>
            <button onClick={() => setPartogramaSeleccionado(null)} className="boton boton-gris">
              <X size={20} />
            </button>
          </div>
          <div className="mb-6 p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
             <p className="font-semibold">{madre?.nombre} ({madre?.rut})</p>
             <p className="texto-sm texto-gris">Registrado por: {partograma.usuario}</p>
          </div>
          {/* ... (tabla de registros del partograma) ... */}
          <table className="tabla">
             <thead>
                <tr>
                  <th><Clock size={16} /> Hora</th>
                  <th><TrendingUp size={16} /> Dilatación</th>
                  <th><Heart size={16} /> FCF</th>
                </tr>
              </thead>
              <tbody>
                {partograma.registros.map((registro, idx) => (
                  <tr key={idx}>
                    <td>{registro.hora}</td>
                    <td>{registro.dilatacion} cm</td>
                    <td>{registro.fcf} lat/min</td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="texto-2xl font-bold flex items-center gap-2">
          <Activity size={28} style={{ color: '#8b5cf6' }} />
          Partogramas Guardados
        </h2>
        <button
          onClick={() => navigate('/')} // Usar navigate para cerrar
          className="boton boton-gris"
        >
          <X size={20} />
          Cerrar
        </button>
      </div>

      {/* Búsqueda */}
      <div className="tarjeta mb-6" style={{ backgroundColor: '#f9fafb' }}>
         {/* ... (input de búsqueda) ... */}
      </div>

      {/* Lista de partogramas */}
      {partogramasFiltrados.length === 0 ? (
        <div className="tarjeta texto-centro py-12">
          <Activity size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <p className="texto-gris">No hay partogramas registrados</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {partogramasFiltrados.map((partograma) => {
            const madre = madresMap.get(partograma.madreId);
            return (
              <div key={partograma.id} className="tarjeta tarjeta-hover" style={{ borderLeft: '4px solid #8b5cf6' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold texto-lg mb-2">{madre?.nombre || 'N/A'}</h3>
                    <p className="texto-sm texto-gris">RUT: {madre?.rut} | Registros: {partograma.registros.length}</p>
                  </div>
                  <button
                    onClick={() => setPartogramaSeleccionado(partograma)}
                    className="boton"
                    style={{ backgroundColor: '#8b5cf6', color: 'white' }}
                  >
                    <Eye size={18} /> Ver Detalle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de detalle */}
      {partogramaSeleccionado && (
        <DetallePartograma partograma={partogramaSeleccionado} />
      )}
    </div>
  );
};

export default VistaPartogramas;