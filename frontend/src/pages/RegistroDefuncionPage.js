// src/pages/RegistroDefuncionPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import RegistroDefuncion from '../components/RegistroDefuncion';
import { apiCreateDefuncion } from '../services/api';

const RegistroDefuncionPage = () => {
  const navigate = useNavigate();
  const { state, fetchMadres, fetchPartos, fetchDiagnosticos } = useData();

  useEffect(() => {
    fetchMadres();
    fetchPartos();
    fetchDiagnosticos();
  }, [fetchMadres, fetchPartos, fetchDiagnosticos]);

  const handleGuardar = async (datosDefuncion) => {
    try {
      await apiCreateDefuncion(datosDefuncion); // Llama a la API directamente
      // alert('Defunción registrada correctamente');
      navigate('/');
    } catch (error) {
      console.error(error);
      // alert(`Error: ${error.message}`);
    }
  };

  return (
    <RegistroDefuncion 
      madres={state.madres.data}
      partos={state.partos.data}
      diagnosticosCIE10={state.diagnosticos.data}
      onGuardar={handleGuardar}
      onCancelar={() => navigate('/')}
    />
  );
};

export default RegistroDefuncionPage;