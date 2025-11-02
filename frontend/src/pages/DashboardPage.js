// src/pages/DashboardPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useAuthRBAC } from '../hooks/useAuthRBAC';
import { useNavigate } from 'react-router-dom';
import { Search, Edit3, Eye, Printer, AlertCircle, Clock } from 'lucide-react';
import { VENTANA_EDICION_PARTO } from '../services/constants';
// Asumimos que generarBrazaletePDF existe en esta ruta
import { generarBrazaletePDF } from '../utils/generarPDF'; 

const DashboardPage = () => {
  const { state: dataState, fetchMadres, fetchPartos } = useData();
  const { usuario, permisos, checkPermiso } = useAuthRBAC();
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState('');

  // Cargar datos al montar
  useEffect(() => {
    fetchMadres();
    fetchPartos();
  }, [fetchMadres, fetchPartos]);

  const { data: madres, isLoading: loadingMadres } = dataState.madres;
  const { data: partos, isLoading: loadingPartos } = dataState.partos;

  // Lógica de filtrado (idéntica a la del App.js monolítico)
  const perteneceATurno = (paciente) => {
    if (!paciente || !checkPermiso('accesoPorTurno')) return true;
    if (usuario.turnoSeleccionado && paciente.turno) {
      return usuario.turnoSeleccionado === paciente.turno;
    }
    return true; // Si no hay datos de turno, se muestra
  };

  const madresMap = useMemo(() => 
    new Map(madres.map(m => [m.id, m])), 
  [madres]);

  const partosFiltrados = useMemo(() => {
    return partos.filter((parto) => {
      const madre = madresMap.get(parto.madreId);
      if (!madre) return false;

      const coincideBusqueda =
        !busqueda ||
        madre.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
        madre.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        parto.rnId.toLowerCase().includes(busqueda.toLowerCase());

      return coincideBusqueda && perteneceATurno(madre);
    });
  }, [partos, madresMap, busqueda, perteneceATurno]);
  
  const madresSinParto = useMemo(() => 
    madres.filter(madre => 
      perteneceATurno(madre) && 
      !partos.some(p => p.madreId === madre.id)
    ),
  [madres, partos, perteneceATurno]);

  // Lógica de permisos de botón
  const puedeEditarParto = (parto) => {
    if (!usuario || !parto) return false;
    if (!checkPermiso('editarRegistroParto')) return false;

    const tiempoTranscurrido = Date.now() - new Date(parto.fechaRegistro).getTime();
    const dentroDeVentana = tiempoTranscurrido <= VENTANA_EDICION_PARTO;
    const esDelMismoUsuario = parto.registradoPor === usuario.username; // Asumiendo que `registradoPor` guarda el `username`

    // La lógica de negocio puede variar, aquí replicamos la original:
    // Solo Matronas, dentro de la ventana, y siendo el mismo usuario.
    return (
      usuario.rol_nombre.toLowerCase() === 'matrona' &&
      dentroDeVentana &&
      esDelMismoUsuario
    );
  };
  
  const handleImprimirBrazalete = (parto) => {
    const madre = madresMap.get(parto.madreId);
    if (madre) {
      generarBrazaletePDF(parto, madre);
    }
  };

  const isLoading = loadingMadres || loadingPartos;

  return (
    <div className="animacion-entrada">
      {isLoading && <div className="texto-centro">Cargando datos...</div>}

      {/* Alerta de Turno */}
      {checkPermiso('accesoPorTurno') && usuario.turnoSeleccionado && (
        <div className="alerta-info mb-6">
          <Clock size={24} />
          <div>
            <p className="font-semibold">
              Turno Activo: {usuario.turnoSeleccionado.charAt(0).toUpperCase() + usuario.turnoSeleccionado.slice(1)}
            </p>
            <p className="texto-sm">
              Solo visualiza pacientes asignados a su turno según Ley 20.584
            </p>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="tarjeta mb-6">
        <div style={{ position: 'relative' }}>
          <Search
            size={20}
            style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: '#6b7280',
            }}
          />
          <input
            type="text"
            className="input"
            placeholder="Buscar por RUT de madre, nombre o ID del RN..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>
      
      {/* Sección de Madres sin Parto (para Matronas) */}
      {checkPermiso('crearRegistroParto') && (
        <div className="tarjeta mb-6">
          <h3 className="texto-xl font-bold mb-4">Madres sin Parto Registrado (Mi Turno)</h3>
          {madresSinParto.length === 0 ? (
            <p className="texto-centro texto-gris py-4">
              Todas las madres de su turno tienen partos registrados
            </p>
          ) : (
            <div className="grid gap-3">
              {madresSinParto.map((madre) => (
                <div
                  key={madre.id}
                  className="flex justify-between items-center p-4"
                  style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                >
                  <div>
                    <p className="font-semibold">{madre.nombre}</p>
                    <p className="texto-sm texto-gris">
                      RUT: {madre.rut} - Edad: {madre.edad} años
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/parto/nuevo/${madre.id}`)}
                    className="boton boton-secundario"
                  >
                    Registrar Parto
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabla de Partos (Datos Clínicos) */}
      {checkPermiso('verDatosClinicos') && (
        <div className="tarjeta">
          <h2 className="texto-2xl font-bold mb-4">Recién Nacidos Hospitalizados</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>ID Recién Nacido</th>
                  <th>Madre</th>
                  <th>RUT Madre</th>
                  <th>Fecha Ingreso</th>
                  <th>Tipo</th>
                  <th>Peso</th>
                  <th>APGAR</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {partosFiltrados.map((parto) => {
                  const madre = madresMap.get(parto.madreId);
                  const puedeEditar = puedeEditarParto(parto);

                  return (
                    <tr key={parto.id}>
                      <td className="font-semibold">{parto.rnId}</td>
                      <td>{madre?.nombre || 'N/A'}</td>
                      <td>{madre?.rut || 'N/A'}</td>
                      <td>{new Date(parto.fechaIngreso).toLocaleDateString('es-CL')}</td>
                      <td>{parto.tipo}</td>
                      <td>{parto.pesoRN}g</td>
                      <td>{parto.apgar1}/{parto.apgar5}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {permisos.generarBrazalete && (
                            <button
                              onClick={() => handleImprimirBrazalete(parto)}
                              className="boton boton-primario"
                              style={{ padding: '0.5rem' }}
                              title="Imprimir brazalete"
                            >
                              <Printer size={18} />
                            </button>
                          )}
                          
                          {puedeEditar && (
                             <button
                              onClick={() => navigate(`/parto/editar/${parto.id}`)}
                              className="boton"
                              style={{ padding: '0.5rem', backgroundColor: '#8b5cf6', color: 'white' }}
                              title="Editar parto (ventana de 2h)"
                            >
                              <Edit3 size={18} />
                            </button>
                          )}
                          
                          {permisos.anexarCorreccion && !puedeEditar && (
                            <button
                              onClick={() => navigate(`/parto/corregir/${parto.id}`)}
                              className="boton"
                              style={{ padding: '0.5rem', backgroundColor: '#f59e0b', color: 'white' }}
                              title="Anexar corrección (Médico)"
                            >
                              <AlertCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Tabla de Madres (Datos Demográficos para Administrativos) */}
      {checkPermiso('verDatosDemograficos') && !checkPermiso('verDatosClinicos') && (
         <div className="tarjeta">
            <h2 className="texto-2xl font-bold mb-4">Listado de Madres (Demográfico)</h2>
             {/* ... (Implementar tabla demográfica si es necesario) ... */}
         </div>
      )}

    </div>
  );
};

export default DashboardPage;