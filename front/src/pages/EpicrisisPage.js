// src/pages/EpicrisisPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { apiGetPartoById } from '../services/api';
import EpicrisisMedica from '../components/EpicrisisMedica';
// import { apiCreateEpicrisis } from '../services/api'; // Asumir que existe

const EpicrisisPage = () => {
  const { partoId } = useParams();
  const navigate = useNavigate();
  const { state, fetchMadres } = useData();
  
  const [parto, setParto] = useState(null);
  const [madre, setMadre] = useState(null);

  useEffect(() => {
    apiGetPartoById(partoId)
      .then(partoData => {
        setParto(partoData);
        if (state.madres.data.length === 0) fetchMadres();
      })
      .catch(err => console.error(err));
  }, [partoId, state.madres.data.length, fetchMadres]);

  useEffect(() => {
    if (parto && state.madres.data.length > 0) {
      setMadre(state.madres.data.find(m => m.id === parto.madre));
    }
  }, [parto, state.madres.data]);

  const handleGuardar = async (datosEpicrisis) => {
    try {
      // await apiCreateEpicrisis(datosEpicrisis); // Implementar en api.js
      console.log('Guardando epicrisis:', datosEpicrisis);
      // alert('Epicrisis guardada');
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  if (!parto || !madre) return <div>Cargando...</div>;

  return (
    <EpicrisisMedica
      parto={parto}
      madre={madre}
      onGuardar={handleGuardar}
      onCancelar={() => navigate('/')}
    />
  );
};

export default EpicrisisPage;