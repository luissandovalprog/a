// src/componentes/VistaDefunciones.js
import React, { useState, useMemo } from 'react';
import { Skull, X, Search, Eye, Calendar, User, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VistaDefunciones = ({ defunciones = [], partos = [], madres = [] }) => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [defuncionSeleccionada, setDefuncionSeleccionada] = useState(null);

  const madresMap = useMemo(() => new Map(madres.map(m => [m.id, m])), [madres]);
  const partosMap = useMemo(() => new Map(partos.map(p => [p.id, p])), [partos]);

  const defuncionesFiltradas = useMemo(() => {
    return (defunciones || []).filter(def => {
      if (def.tipo === 'recien_nacido') {
        const parto = partosMap.get(def.recienNacidoId); // Asumiendo que la API devuelve ID
        const madre = madresMap.get(parto?.madre);
        return !busqueda || 
          parto?.rnId.toLowerCase().includes(busqueda.toLowerCase()) ||
          madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          madre?.rut.toLowerCase().includes(busqueda.toLowerCase());
      } else {
        const madre = madresMap.get(def.madreId);
        return !busqueda ||
          madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          madre?.rut.toLowerCase().includes(busqueda.toLowerCase());
      }
    });
  }, [defunciones, partosMap, madresMap, busqueda]);

  // (Componente interno DetalleDefuncion - sin cambios de tu archivo)
  const DetalleDefuncion = ({ defuncion }) => {
     // ... (lógica del modal de detalle)
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 2000
      }}>
        <div className="tarjeta" style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
          <h3 className="texto-2xl font-bold">Detalle de Defunción</h3>
           {/* ... (contenido del modal) ... */}
           <p><strong>Causa:</strong> {defuncion.causaDefuncionCodigo}</p>
           <p><strong>Observaciones:</strong> {defuncion.observaciones}</p>
          <button onClick={() => setDefuncionSeleccionada(null)} className="boton boton-gris mt-4">Cerrar</button>
        </div>
      </div>
    );
  };

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="texto-2xl font-bold flex items-center gap-2">
          <Skull size={28} style={{ color: '#ef4444' }} />
          Registro de Defunciones
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

      {/* Lista de defunciones */}
      {defuncionesFiltradas.length === 0 ? (
        <div className="tarjeta texto-centro py-12">
          <Skull size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <p className="texto-gris">No hay defunciones registradas</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {defuncionesFiltradas.map((defuncion) => {
            // ... (lógica de renderizado de tarjeta de defunción) ...
            return (
              <div key={defuncion.id} className="tarjeta tarjeta-hover" style={{ borderLeft: '4px solid #ef4444' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{defuncion.tipo.toUpperCase()}</p>
                    <p className="texto-sm">Causa: {defuncion.causaDefuncionCodigo}</p>
                    <p className="texto-xs texto-gris">
                      {new Date(defuncion.fechaDefuncion).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <button
                    onClick={() => setDefuncionSeleccionada(defuncion)}
                    className="boton"
                    style={{ backgroundColor: '#ef4444', color: 'white' }}
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
      {defuncionSeleccionada && (
        <DetalleDefuncion defuncion={defuncionSeleccionada} />
      )}
    </div>
  );
};

export default VistaDefunciones;