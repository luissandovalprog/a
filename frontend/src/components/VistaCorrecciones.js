// src/componentes/VistaCorrecciones.js
import React, { useState, useMemo } from 'react';
import { FileText, AlertTriangle, X, Calendar, User, Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Importar para el botón de cerrar

const VistaCorrecciones = ({ correcciones = [], partos = [], madres = [] }) => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');

  const madresMap = useMemo(() => new Map(madres.map(m => [m.id, m])), [madres]);
  const partosMap = useMemo(() => new Map(partos.map(p => [p.id, p])), [partos]);

  const correccionesFiltradas = useMemo(() => {
    return (correcciones || []).filter(corr => {
      const parto = partosMap.get(corr.partoId);
      const madre = madresMap.get(parto?.madre); // Asumiendo que la API devuelve parto.madre (ID)
      
      const coincideBusqueda = !busqueda || 
        madre?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        madre?.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
        parto?.rnId.toLowerCase().includes(busqueda.toLowerCase());
      
      const coincideUsuario = filtroUsuario === 'todos' || corr.usuarioCorreccion === filtroUsuario;
      
      return coincideBusqueda && coincideUsuario;
    });
  }, [correcciones, partosMap, madresMap, busqueda, filtroUsuario]);

  const usuariosUnicos = useMemo(() => 
    [...new Set((correcciones || []).map(c => c.usuarioCorreccion))], 
  [correcciones]);

  return (
    <div className="tarjeta animacion-entrada" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="texto-2xl font-bold flex items-center gap-2">
          <FileText size={28} style={{ color: '#f59e0b' }} />
          Correcciones Anexadas
        </h2>
        <button
          onClick={() => navigate('/')} // Usar navigate para cerrar
          className="boton boton-gris"
        >
          <X size={20} />
          Cerrar
        </button>
      </div>

      {/* Filtros */}
      <div className="tarjeta mb-6" style={{ backgroundColor: '#f9fafb' }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="grupo-input">
            <label className="etiqueta">Buscar</label>
             <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="text"
                className="input"
                placeholder="Buscar por RUT, nombre o ID RN..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
          <div className="grupo-input">
            <label className="etiqueta">Filtrar por Usuario</label>
            <select
              className="select"
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
            >
              <option value="todos">Todos los usuarios</option>
              {usuariosUnicos.map(usuario => (
                <option key={usuario} value={usuario}>{usuario}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ... (Advertencia de trazabilidad) ... */}
      
      {/* Lista de correcciones */}
      {correccionesFiltradas.length === 0 ? (
        <div className="tarjeta texto-centro py-12">
          <FileText size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <p className="texto-gris">No hay correcciones registradas</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {correccionesFiltradas.map((correccion) => {
            const parto = partosMap.get(correccion.partoId);
            const madre = madresMap.get(parto?.madre);

            return (
              <div
                key={correccion.id}
                className="tarjeta"
                style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb' }}
              >
                {/* ... (Renderizado de la tarjeta de corrección) ... */}
                <p><strong>RN:</strong> {parto?.rnId}</p>
                <p><strong>Madre:</strong> {madre?.nombre}</p>
                <p><strong>Campo:</strong> {correccion.campo}</p>
                <p><strong>Valor Original:</strong> <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>{correccion.valorOriginal}</span></p>
                <p><strong>Valor Nuevo:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>{correccion.valorNuevo}</span></p>
                <p><strong>Justificación:</strong> {correccion.justificacion}</p>
                <p className="texto-sm texto-gris mt-2">
                  <User size={14} style={{display: 'inline'}}/> {correccion.usuarioCorreccion} ({correccion.rolUsuario})
                </p>
                <p className="texto-xs texto-gris">
                  <Calendar size={14} style={{display: 'inline'}}/> {new Date(correccion.fechaCorreccion).toLocaleString('es-CL')}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VistaCorrecciones;