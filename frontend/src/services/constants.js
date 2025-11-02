// src/utilidades/constantes.js
// Constantes globales del sistema

// Información del sistema
export const SISTEMA_INFO = {
  nombre: 'Sistema de Trazabilidad de Partos',
  version: '1.0.0',
  hospital: 'Hospital Clínico Herminda Martín',
  ciudad: 'Chillán, Chile'
};

// Roles de usuario (basados en la API de Django)
export const ROLES = {
  ADMINISTRATIVO: 'administrativo',
  MATRONA: 'matrona',
  MEDICO: 'médico',
  ENFERMERA: 'enfermera',
  ADMIN_SISTEMA: 'administrador del sistema (ti)', // Coincidir con el `rol_nombre` de la API
};

// Tipos de parto
export const TIPOS_PARTO = [
  { valor: 'Vaginal', etiqueta: 'Vaginal' },
  { valor: 'Cesárea', etiqueta: 'Cesárea' },
  { valor: 'Fórceps', etiqueta: 'Fórceps' },
  { valor: 'Ventosa', etiqueta: 'Ventosa' }
];

// Rangos de validación médica
export const RANGOS_MEDICOS = {
  pesoRN: {
    min: 500,
    max: 6000,
    unidad: 'gramos'
  },
  tallaRN: {
    min: 30,
    max: 70,
    unidad: 'cm'
  },
  apgar: {
    min: 0,
    max: 10
  },
  edadMadre: {
    min: 15,
    max: 60,
    unidad: 'años'
  }
};

// Timeout de sesión (en milisegundos)
export const TIMEOUT_SESION = 30 * 60 * 1000; // 30 minutos

// Ventana de edición para matronas (en milisegundos)
// Esta lógica ahora la valida el backend, pero es bueno tenerla en el frontend para la UI.
export const VENTANA_EDICION_PARTO = 2 * 60 * 60 * 1000; // 2 horas

// Mensajes del sistema
export const MENSAJES = {
  exito: {
    madreRegistrada: 'Madre registrada exitosamente',
    partoRegistrado: 'Parto registrado exitosamente',
    datosActualizados: 'Datos actualizados correctamente',
    pdfGenerado: 'PDF generado correctamente',
    sesionCerrada: 'Sesión cerrada correctamente',
    correccionAnexada: 'Corrección anexada exitosamente'
  },
  error: {
    rutInvalido: 'El RUT ingresado no es válido',
    camposObligatorios: 'Complete todos los campos obligatorios',
    rangoInvalido: 'Valor fuera del rango permitido',
    errorServidor: 'Error al comunicarse con el servidor',
    sesionExpirada: 'Sesión expirada por inactividad',
    sinPermiso: 'No tiene permisos para realizar esta acción',
    ventanaEdicionCerrada: 'La ventana de edición de 2 horas ha expirado. Use "Anexar Corrección"',
    noAsignadoATurno: 'Este paciente no está asignado a su turno'
  },
  // ... más mensajes
};

// URLs de la API
export const API_URLS = {
  desarrollo: 'http://localhost:8000',
  produccion: 'https://partos.hermindamartin.cl/api'
};

// PERMISOS POR ROL (RBAC) - Esta es la definición del frontend
export const PERMISOS = {
  [ROLES.ADMINISTRATIVO]: {
    verDatosDemograficos: true,
    crearPaciente: true,
    editarDatosDemograficos: true,
    verDatosClinicos: false,
    verHistorialClinico: false,
    verPartograma: false,
    verExamenes: false,
    verEpicrisis: false,
    crearRegistroParto: false,
    editarRegistroParto: false,
    generarBrazalete: false,
    generarReportes: false,
    verAuditoria: false,
    gestionarUsuarios: false,
    verEstadisticas: true,
    accesoPorTurno: false
  },
  
  [ROLES.ENFERMERA]: {
    verDatosDemograficos: true,
    verDatosClinicos: true,
    verHistorialClinico: true, 
    verPartograma: false,
    verExamenes: true,
    verEpicrisis: true,
    crearNotasEnfermeria: true,
    crearSignosVitales: true,
    crearProfilaxis: true,
    crearPaciente: false,
    crearRegistroParto: false,
    editarDatosDemograficos: false,
    editarNotasEnfermeria: true,
    editarRegistroParto: false,
    generarBrazalete: false,
    generarReportes: false,
    verAuditoria: false,
    gestionarUsuarios: false,
    verEstadisticas: false,
    accesoPorTurno: true 
  },
  
  [ROLES.MATRONA]: {
    verDatosDemograficos: true,
    verDatosClinicos: true,
    verHistorialClinico: true,
    verPartograma: true,
    verExamenes: true,
    verEpicrisis: true,
    crearPaciente: true,
    crearRegistroParto: true,
    crearRecienNacido: true,
    crearPartograma: true,
    crearNotasEnfermeria: false,
    editarDatosDemograficos: true,
    editarRegistroParto: true, // El hook useAuthRBAC debe verificar la ventana de 2h
    editarPartograma: true, 
    anexarCorreccion: false, 
    generarBrazalete: true,
    generarReportes: false, 
    verAuditoria: false,
    gestionarUsuarios: false,
    verEstadisticas: true,
    accesoPorTurno: true 
  },
  
  [ROLES.MEDICO]: {
    verDatosDemograficos: true,
    verDatosClinicos: true,
    verHistorialClinico: true,
    verPartograma: true,
    verExamenes: true,
    verEpicrisis: true,
    crearPaciente: false, 
    crearRegistroParto: false,
    crearEpicrisis: true,
    crearIndicacionesMedicas: true,
    crearDerivacion: true,
    crearRegistroDefuncion: true,
    editarDatosDemograficos: false,
    editarRegistroParto: false,
    editarEpicrisis: true,
    anexarCorreccion: true, 
    generarBrazalete: true,
    generarReportes: true, 
    exportarDatos: true, 
    verAuditoria: false, 
    gestionarUsuarios: false,
    verEstadisticas: true,
    accesoPorTurno: false
  },
  
  [ROLES.ADMIN_SISTEMA]: {
    verDatosDemograficos: false,
    verDatosClinicos: false,
    verHistorialClinico: false,
    verPartograma: false,
    verExamenes: false,
    verEpicrisis: false,
    crearPaciente: false,
    crearRegistroParto: false,
    editarDatosDemograficos: false,
    editarRegistroParto: false,
    gestionarUsuarios: true,
    crearUsuarios: true,
    editarUsuarios: true,
    desactivarUsuarios: true,
    verAuditoria: true, 
    generarBrazalete: false,
    generarReportes: false,
    verEstadisticas: false, 
    accesoPorTurno: false
  },

  // Rol por defecto para usuarios no autenticados o con rol desconocido
  'anonimo': {
    verDatosDemograficos: false,
    crearPaciente: false,
    verDatosClinicos: false,
    crearRegistroParto: false,
    editarRegistroParto: false,
    generarReportes: false,
    verAuditoria: false,
    gestionarUsuarios: false,
  }
};

// Acciones de auditoría (para enviar al backend)
export const ACCIONES_AUDITORIA = {
  CREAR_PACIENTE: 'crear_paciente',
  EDITAR_PACIENTE: 'editar_paciente',
  VER_FICHA_CLINICA: 'ver_ficha_clinica',
  CREAR_PARTO: 'crear_parto',
  EDITAR_PARTO: 'editar_parto',
  ANEXAR_CORRECCION: 'anexar_correccion',
  GENERAR_REPORTE: 'generar_reporte',
  EXPORTAR_DATOS: 'exportar_datos',
  CREAR_USUARIO: 'crear_usuario',
  MODIFICAR_USUARIO: 'modificar_usuario',
  DESACTIVAR_USUARIO: 'desactivar_usuario',
  LOGIN: 'login',
  LOGOUT: 'logout',
  INTENTO_ACCESO_DENEGADO: 'intento_acceso_denegado'
};

// Turnos
export const TURNOS = {
  DIURNO: 'Mañana',
  NOCTURNO: 'Noche',
  VESPERTINO: 'Tarde'
};