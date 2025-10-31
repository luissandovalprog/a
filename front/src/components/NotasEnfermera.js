// src/componentes/NotasEnfermera.js
import React, { useState } from "react";
import { useAuthRBAC } from "../hooks/useAuthRBAC"; // Importar hook de autenticación

const NotasEnfermera = ({ notas = [], onGuardarNota, madres = [] }) => {
  const { usuario } = useAuthRBAC(); // Obtener el usuario del contexto
  
  const [nuevaNota, setNuevaNota] = useState({
    paciente_id: "", // Usaremos el ID de la madre
    fecha: new Date().toISOString().substring(0, 10),
    turno: usuario.turnoSeleccionado || "", // Usar turno del contexto
    nota: "",
  });

  const handleChange = (e) => {
    setNuevaNota({ ...nuevaNota, [e.target.name]: e.target.value });
  };

  const agregarNota = (e) => {
    e.preventDefault();
    if (nuevaNota.paciente_id && nuevaNota.nota && nuevaNota.turno) {
      // La API espera el ID del usuario, no el nombre
      const notaParaGuardar = {
        ...nuevaNota,
        enfermera: usuario.id // Enviar el ID del usuario
      };
      
      onGuardarNota(notaParaGuardar); // Llamar a la función del contenedor
      
      setNuevaNota({
        paciente_id: "",
        fecha: new Date().toISOString().substring(0, 10),
        turno: usuario.turnoSeleccionado || "",
        nota: "",
      });
    }
  };

  return (
    <div className="tarjeta p-6 contenedor mt-4">
      <h2 className="texto-2xl font-bold mb-4">Registro de Notas de Enfermería</h2>
      <form className="mb-4" onSubmit={agregarNota}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="grupo-input">
            <label className="etiqueta">Paciente (Madre)</label>
            <select
              className="select"
              name="paciente_id"
              value={nuevaNota.paciente_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Seleccione Paciente --</option>
              {madres.map(madre => (
                <option key={madre.id} value={madre.id}>{madre.nombre} ({madre.rut})</option>
              ))}
            </select>
          </div>
          
          <div className="grupo-input">
            <label className="etiqueta">Turno</label>
            <input
              className="input"
              name="turno"
              type="text"
              value={nuevaNota.turno}
              onChange={handleChange}
              required
              disabled // El turno viene del login
            />
          </div>
          
          <div className="grupo-input">
             <label className="etiqueta">Fecha</label>
            <input
              className="input"
              name="fecha"
              type="date"
              value={nuevaNota.fecha}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="grupo-input">
           <label className="etiqueta">Nota Clínica</label>
          <textarea
            className="textarea mb-2"
            name="nota"
            placeholder="Escriba la nota clínica de enfermería"
            value={nuevaNota.nota}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>
        <button className="boton boton-primario" type="submit">Agregar Nota</button>
      </form>

      <h3 className="texto-xl font-semibold mb-2">Notas Registradas</h3>
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Turno</th>
            <th>Enfermera</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {notas.map((n, idx) => (
            <tr key={idx}>
              <td>{new Date(n.fecha).toLocaleDateString('es-CL')}</td>
              <td>{n.paciente_nombre || 'N/A'}</td> 
              <td>{n.turno}</td>
              <td>{n.enfermera_nombre || 'N/A'}</td>
              <td>{n.nota}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotasEnfermera;