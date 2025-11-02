// src/pages/NotasEnfermeraPage.js
import React, { useEffect, useState } from 'react';
import { useData } from '../hooks/useData';
import NotasEnfermera from '../components/NotasEnfermera';
// import { apiGetNotas, apiCreateNota } from '../services/api'; // Asumir que existen

const NotasEnfermeraPage = () => {
  const { state: dataState, fetchMadres } = useData();
  const [notas, setNotas] = useState([]); // Estado local para las notas
  
  useEffect(() => {
    fetchMadres();
    // apiGetNotas().then(data => setNotas(data.results));
  }, [fetchMadres]);

  const handleGuardarNota = async (datosNota) => {
    try {
      // const nuevaNota = await apiCreateNota(datosNota);
      // setNotas(prev => [nuevaNota, ...prev]);
      console.log('Guardando nota:', datosNota);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <NotasEnfermera 
      notas={notas}
      onGuardarNota={handleGuardarNota}
      madres={dataState.madres.data}
    />
  );
};

export default NotasEnfermeraPage;