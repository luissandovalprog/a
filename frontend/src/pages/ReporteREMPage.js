// src/pages/ReporteREMPage.js
import React, { useEffect } from 'react';
import { useData } from '../hooks/useData';
import ReporteREM from '../components/ReporteREM'; // Tu componente
import { useAuthRBAC } from '../hooks/useAuthRBAC';

const ReporteREMPage = () => {
  const { state, fetchMadres, fetchPartos } = useData();
  const { usuario } = useAuthRBAC();

  useEffect(() => {
    // Los reportes necesitan todos los datos, así que los cargamos
    fetchMadres();
    fetchPartos();
    // Aquí podrías registrar en auditoría que se accedió a la página de reportes
  }, [fetchMadres, fetchPartos, usuario]);

  const isLoading = state.madres.isLoading || state.partos.isLoading;

  return (
    <div className="animacion-entrada">
       <div
          className="tarjeta mb-4"
          style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444' }}
        >
          <p className="font-semibold" style={{ color: '#991b1b' }}>
            ⚠️ Alto Riesgo de Fuga de Datos
          </p>
          <p className="texto-sm mt-1" style={{ color: '#991b1b' }}>
            La generación de reportes consolidados es un privilegio de alto nivel. Toda
            exportación queda registrada en auditoría.
          </p>
        </div>

      {isLoading ? (
        <div className="tarjeta texto-centro">Cargando datos para el reporte...</div>
      ) : (
        <ReporteREM 
          partos={state.partos.data} 
          madres={state.madres.data} 
        />
      )}
    </div>
  );
};

export default ReporteREMPage;