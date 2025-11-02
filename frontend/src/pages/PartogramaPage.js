// src/pages/PartogramaPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { apiGetMadreById } from '../services/api'; // Asumiendo que existe
import Partograma from '../components/Partograma';
// Asumimos que la API tiene un endpoint para guardar partogramas
// import { apiCreatePartograma } from '../services/api';

const PartogramaPage = () => {
  const { madreId } = useParams();
  const navigate = useNavigate();
  const { state, fetchMadres } = useData();
  
  const [madre, setMadre] = useState(null);

  useEffect(() => {
    const madreExistente = state.madres.data.find(m => m.id === madreId);
    if (madreExistente) {
      setMadre(madreExistente);
    } else {
      // apiGetMadreById(madreId).then(setMadre);
      // Por ahora, solo buscamos en el estado
      if(state.madres.data.length === 0) fetchMadres();
    }
  }, [madreId, state.madres.data, fetchMadres]);

  const handleGuardar = async (datosPartograma) => {
    try {
      // await apiCreatePartograma(datosPartograma); // Implementar en api.js
      console.log('Guardando partograma:', datosPartograma);
      // alert('Partograma guardado');
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  if (!madre) return <div>Cargando madre...</div>;

  return (
    <Partograma 
      madre={madre}
      parto={state.partos.data.find(p => p.madre === madre.id)} // Busca el parto asociado
      onGuardar={handleGuardar}
      onCancelar={() => navigate('/')}
    />
  );
};

export default PartogramaPage;