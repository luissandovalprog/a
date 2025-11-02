// src/pages/AnexarCorreccionPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { apiGetPartoById } from '../services/api';
import AnexarCorreccion from '../components/AnexarCorreccion'; // Tu componente

const AnexarCorreccionPage = () => {
  const { partoId } = useParams();
  const navigate = useNavigate();
  const { state: dataState, fetchMadres, anexarCorreccion } = useData();
  
  const [parto, setParto] = useState(null);
  const [madre, setMadre] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGetPartoById(partoId)
      .then(partoData => {
        setParto(partoData);
        if (dataState.madres.data.length === 0) {
          fetchMadres();
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [partoId, dataState.madres.data.length, fetchMadres]);

  useEffect(() => {
    if (parto && dataState.madres.data.length > 0) {
      const madreEncontrada = dataState.madres.data.find(m => m.id === parto.madre);
      setMadre(madreEncontrada);
    }
  }, [parto, dataState.madres.data]);

  const handleGuardar = async (datosCorreccion) => {
    try {
      // La API espera el ID del parto y los datos de corrección
      await anexarCorreccion(partoId, datosCorreccion); 
      // alert('Corrección anexada');
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
    <AnexarCorreccion 
      parto={parto} 
      madre={madre} 
      onGuardar={handleGuardar}
      onCancelar={() => navigate('/')} 
    />
  );
};

export default AnexarCorreccionPage;