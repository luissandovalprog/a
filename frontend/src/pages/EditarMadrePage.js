// src/pages/EditarMadrePage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { apiGetMadreById } from '../services/api';
import EditarMadre from '../components/EditarMadre';

const EditarMadrePage = () => {
  const { madreId } = useParams();
  const navigate = useNavigate();
  const { updateMadre } = useData();
  
  const [madre, setMadre] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGetMadreById(madreId)
      .then(data => setMadre(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [madreId]);

  const handleGuardar = async (datosActualizados) => {
    try {
      await updateMadre(madreId, datosActualizados);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading || !madre) {
    return <div className="tarjeta texto-centro">Cargando datos de la madre...</div>;
  }

  return (
    <EditarMadre 
      madre={madre} 
      onGuardar={handleGuardar}
      onCancelar={() => navigate(-1)} 
    />
  );
};

export default EditarMadrePage;