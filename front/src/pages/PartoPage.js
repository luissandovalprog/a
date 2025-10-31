// src/pages/PartoPage.js
import React, { useEffect, useState } from 'react';
import { useData } from '../hooks/useData';
import { useParams, useNavigate } from 'react-router-dom';

// Asumimos que el formulario de parto está en un componente reutilizable
// import FormularioParto from '../components/FormularioParto'; 
// Por ahora, lo simulamos aquí.

const PartoPage = () => {
  const { madreId } = useParams();
  const { state, fetchMadres, addParto } = useData();
  const navigate = useNavigate();
  
  const [madre, setMadre] = useState(null);
  
  // Buscar la madre en el estado global, o fetchearla si no existe
  useEffect(() => {
    const madreExistente = state.madres.data.find(m => m.id === madreId);
    if (madreExistente) {
      setMadre(madreExistente);
    } else {
      // Opcional: fetchear madre por ID si no está en el contexto
      // apiGetMadreById(madreId).then(setMadre);
    }
    
    // Asegurarse de que las madres estén cargadas
    if (state.madres.data.length === 0) {
      fetchMadres();
    }
  }, [madreId, state.madres.data, fetchMadres]);
  
  const handleGuardarParto = async (datosParto) => {
    try {
      // Los datos del backend (API spec) no muestran que se necesite
      // el ID del recién nacido al crear el parto.
      const datosCompletos = {
        madre: madreId, // Enviar el UUID/ID de la madre
        ...datosParto,
        // ... otros campos requeridos por la API
      };
      
      await addParto(datosCompletos);
      // alert('Parto registrado exitosamente');
      navigate('/'); // Volver al dashboard
    } catch (error) {
      console.error("Error al registrar el parto:", error);
      // alert(`Error: ${error.message}`);
    }
  };

  if (!madre) {
    return <div>Cargando información de la madre...</div>;
  }

  return (
    <div className="animacion-entrada">
      {/* Aquí deberías renderizar tu componente de formulario de parto, 
        pasándole la madre y la función handleGuardarParto.
        Ejemplo:
        
        <FormularioParto 
          madre={madre} 
          onGuardar={handleGuardarParto} 
          onCancelar={() => navigate(-1)} 
        />
        
        Como no tengo FormularioParto, pongo un placeholder:
      */}
      
      <div className="tarjeta" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 className="texto-2xl font-bold mb-4">Registro de Parto</h2>
        <div className="mb-6 p-4" style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
          <p className="font-semibold">Madre: {madre.nombre}</p>
          <p className="texto-sm texto-gris">RUT: {madre.rut}</p>
        </div>
        <p>Aquí iría el formulario de registro de parto (similar al de tu App.js).</p>
        <p>Al guardar, llamaría a `handleGuardarParto`.</p>
        <button onClick={() => navigate(-1)} className="boton boton-gris mt-4">
          Cancelar (Simulación)
        </button>
      </div>
      
    </div>
  );
};

export default PartoPage;