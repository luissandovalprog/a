// src/pages/AuditoriaPage.js
import React, { useEffect } from 'react';
import { useData } from '../hooks/useData';
import TablaAuditoria from '../components/TablaAuditoria'; // Importamos tu componente

// NOTA: Debes refactorizar TablaAuditoria.js
// Quita la lógica de 'obtenerEventosAuditoria' interna
// y haz que reciba 'eventos' como prop.
// Además, la API real 'apiGetLogs' debe ser llamada aquí.

const AuditoriaPage = () => {
  const { state, fetchLogs } = useData();
  
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (state.logs.isLoading) {
    return <div>Cargando registros de auditoría...</div>;
  }
  
  // Aquí asumimos que refactorizaste TablaAuditoria para aceptar props
  // Si no, TablaAuditoria seguirá usando su propia lógica (que ahora llama a la API)
  
  // Si TablaAuditoria.js fue refactorizada para usar la API (como parece ser el caso
  // al importar 'obtenerEventosAuditoria' de 'servicios/api'), 
  // entonces simplemente renderizarla funcionará.
  
  return (
    <div className="animacion-entrada">
      <TablaAuditoria 
        // Si TablaAuditoria es "tonta" y recibe props:
        // eventos={state.logs.data}
        // Si TablaAuditoria es "inteligente" y hace su propio fetch:
      />
    </div>
  );
};

export default AuditoriaPage;