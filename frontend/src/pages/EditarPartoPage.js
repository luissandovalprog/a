// src/pages/EditarPartoPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { apiGetPartoById } from '../services/api'; // Usamos la API directo para 1 solo item
import EditarParto from '../components/EditarParto'; // Tu componente

const EditarPartoPage = () => {
  const { partoId } = useParams();
  const navigate = useNavigate();
  const { state: dataState, fetchMadres, updateParto } = useData();
  
  const [parto, setParto] = useState(null);
  const [madre, setMadre] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar el parto específico
    apiGetPartoById(partoId)
      .then(partoData => {
        setParto(partoData);
        // Asegurarse que las madres están cargadas para encontrar la correcta
        if (dataState.madres.data.length === 0) {
          fetchMadres();
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [partoId, dataState.madres.data.length, fetchMadres]);

  // Encontrar la madre cuando los datos estén listos
  useEffect(() => {
    if (parto && dataState.madres.data.length > 0) {
      const madreEncontrada = dataState.madres.data.find(m => m.id === parto.madre); // Asumiendo que la API devuelve `parto.madre` como ID
      setMadre(madreEncontrada);
    }
  }, [parto, dataState.madres.data]);

  const handleGuardar = async (datosActualizados) => {
    try {
      await updateParto(partoId, datosActualizados);
      // alert('Parto actualizado');
      navigate('/');
    } catch (error) {
      console.error(error);
      // alert(`Error: ${error.message}`);
    }
  };

  if (isLoading || !parto || !madre) {
    return <div className="tarjeta texto-centro">Cargando datos del parto...</div>;
  }

  return (
    <EditarParto 
      parto={parto} 
      madre={madre} 
      onGuardar={handleGuardar}
      onCancelar={() => navigate('/')} 
    />
  );
};

export default EditarPartoPage;