// src/componentes/VistaEpicrisis.js
import React, { useState, useMemo } from 'react';
import { Stethoscope, X, Search, Eye, FileText, Pill, Download } from 'lucide-react';
import { generarEpicrisisPDF } from '../utilidades/generarPDF';
import { useNavigate } from 'react-router-dom';

const VistaEpicrisis = ({ epicrisis = [], partos = [], madres = [] }) => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [epicrisisSeleccionada, setEpicrisisSeleccionada] = useState(null);

  const madresMap = useMemo(() => new Map(madres.map(m => [m.id, m])), [madres]);
  const partosMap = useMemo(() => new Map(partos.map(p => [p.id, p])), [partos]);

  const epicrisisFiltradas = useMemo(() => {
    return (epicrisis || []).filter(epi => {
      const madre = madresMap.get(epi.madreId);
      const parto = partosMap.get(epi.partoId);
      
      return !busqueda || 
        madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        madre?.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
        parto?.rnId.toLowerCase().includes(busqueda.toLowerCase());
    });
  }, [epicrisis, madresMap, partosMap, busqueda]);

  // (Componente interno DetalleEpicrisis - sin cambios de tu archivo)
  const DetalleEpicrisis = ({ epicrisis }) => {
    const madre = madresMap.get(epicrisis.madreId);
    const parto = partosMap.get(epicrisis.partoId);

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 2000
      }}>
        <div className="tarjeta" style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
           <div className="flex justify-between items-center mb-4">
            <h3 className="texto-2xl font-bold">Epicrisis e Indicaciones</h3>
            <div className="flex gap-2">
              <button
                onClick={() => generarEpicrisisPDF(parto, madre, epicrisis)}
                className="boton"
                style={{ backgroundColor: '#10b981', color: 'white' }}
              >
                <Download size={18} /> Descargar PDF
              </button>
              <button
                onClick={() => setEpicrisisSeleccionada(null)}
                className="boton boton-gris"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          {/* ... (contenido del modal) ... */}
           <div className="mb-6 p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
              <p><strong>Paciente:</strong> {madre?.nombre} ({madre?.rut})</p>
              <p><strong>RN:</strong> {parto?.rnId}</p>
           </div>
           <div className="tarjeta mb-6">
              <h4 className="texto-xl font-bold mb-2">Epicrisis</h4>
              <p><strong>Diagnóstico Egreso:</strong> {epicrisis.epicrisis.diagnosticoEgreso}</p>
              <p><strong>Resumen:</strong> {epicrisis.epicrisis.resumenEvolucion}</p>
           </div>
           <div className="tarjeta" style={{ backgroundColor: '#f0fdf4' }}>
              <h4 className="texto-xl font-bold mb-2">Indicaciones ({epicrisis.indicaciones.length})</h4>
              {/* ... (mapa de indicaciones) ... */}
           </div>
        </div>
      </div>
    );
  };


  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="texto-2xl font-bold flex items-center gap-2">
          <Stethoscope size={28} style={{ color: '#7c3aed' }} />
          Epicrisis e Indicaciones Guardadas
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

      {/* Lista de epicrisis */}
      {epicrisisFiltradas.length === 0 ? (
        <div className="tarjeta texto-centro py-12">
          <Stethoscope size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <p className="texto-gris">No hay epicrisis registradas</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {epicrisisFiltradas.map((epi) => {
            const madre = madresMap.get(epi.madreId);
            const parto = partosMap.get(epi.partoId);
            return (
              <div key={epi.id} className="tarjeta tarjeta-hover" style={{ borderLeft: '4px solid #7c3aed' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold texto-lg mb-2">{madre?.nombre || 'N/A'}</h3>
                    <p className="texto-sm texto-gris mb-3">
                      RUT: {madre?.rut} | RN: {parto?.rnId}
                    </p>
                    <p className="texto-xs texto-gris">
                      Diagnóstico: {epi.epicrisis.diagnosticoEgreso.substring(0, 30)}...
                    </p>
                  </div>
                  <button
                    onClick={() => setEpicrisisSeleccionada(epi)}
                    className="boton"
                    style={{ backgroundColor: '#7c3aed', color: 'white' }}
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
      {epicrisisSeleccionada && (
        <DetalleEpicrisis epicrisis={epicrisisSeleccionada} />
      )}
    </div>
  );
};

export default VistaEpicrisis;