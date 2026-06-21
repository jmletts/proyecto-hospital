const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  const match = document.cookie.match(/(^|;\s*)token=([^;]*)/);
  return match ? match[2] : '';
}

// ==========================================
// MOCK DATABASE & ROUTER STANDALONE
// ==========================================
interface MockDb {
  roles: any[];
  usuarios: any[];
  servicios: any[];
  pacientes: any[];
  medicos: any[];
  citas: any[];
  historias: any[];
  recetas: any[];
  facturacion: any[];
}

const defaultMockDb: MockDb = {
  roles: [
    { id_rol: 1, nombre: 'Admin', descripcion: 'Administrador del sistema' },
    { id_rol: 2, nombre: 'Médico', descripcion: 'Personal médico (Oftalmólogos)' },
    { id_rol: 3, nombre: 'Recepción', descripcion: 'Personal de recepción y caja' },
    { id_rol: 4, nombre: 'Paciente', descripcion: 'Pacientes de la clínica' },
  ],
  usuarios: [
    { id_usuario: 1, id_rol: 1, correo: 'admin@nawi.com', estado: true, fecha_creacion: new Date().toISOString(), rol: { id_rol: 1, nombre: 'Admin' } },
    { id_usuario: 2, id_rol: 2, correo: 'doctor.perez@nawi.com', estado: true, fecha_creacion: new Date().toISOString(), rol: { id_rol: 2, nombre: 'Médico' } },
  ],
  servicios: [
    { id_servicio: 1, nombre: 'Consulta Oftalmológica General', descripcion: 'Evaluación completa de la vista y presión ocular', precio: 100.00 },
    { id_servicio: 2, nombre: 'Medida de Vista', descripcion: 'Evaluación y receta para lentes de medida', precio: 50.00 },
    { id_servicio: 3, nombre: 'Cirugía de Cataratas', descripcion: 'Cirugía ambulatoria para remoción de cataratas', precio: 1500.00 },
  ],
  pacientes: [
    { id_paciente: 1, id_usuario: null, dni: '12345678', nombres: 'Juan', apellidos: 'Pérez Gómez', telefono: '987654321', fecha_nacimiento: '1985-05-15T00:00:00.000Z', usuario: null },
    { id_paciente: 2, id_usuario: null, dni: '87654321', nombres: 'María', apellidos: 'Flores Ruiz', telefono: '912345678', fecha_nacimiento: '1990-08-20T00:00:00.000Z', usuario: null },
  ],
  medicos: [
    { id_medico: 1, id_usuario: 2, nombres: 'Carlos', apellidos: 'Pérez Torres', cmp: 'CMP54321', especialidad: 'Oftalmología General', usuario: { id_usuario: 2, correo: 'doctor.perez@nawi.com' } },
  ],
  citas: [
    { 
      id_cita: 1, 
      id_paciente: 1, 
      id_medico: 1, 
      id_servicio: 1, 
      fecha_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // mañana
      estado: 'Pendiente', 
      motivo_consulta: 'Control anual de miopía',
      paciente: { id_paciente: 1, nombres: 'Juan', apellidos: 'Pérez Gómez', dni: '12345678' },
      medico: { id_medico: 1, nombres: 'Carlos', apellidos: 'Pérez Torres', cmp: 'CMP54321' },
      servicio: { id_servicio: 1, nombre: 'Consulta Oftalmológica General', precio: 100.00 }
    }
  ],
  historias: [
    {
      id_historia: 1,
      id_paciente: 1,
      id_cita: 1,
      fecha_registro: new Date().toISOString(),
      agudeza_visual_od: '20/20',
      agudeza_visual_oi: '20/25',
      presion_intraocular_od: '14 mmHg',
      presion_intraocular_oi: '15 mmHg',
      diagnostico: 'Miopía leve en ambos ojos',
      observaciones: 'Paciente refiere cansancio al leer de noche.',
      paciente: { id_paciente: 1, nombres: 'Juan', apellidos: 'Pérez Gómez', dni: '12345678' },
      cita: { id_cita: 1, fecha_hora: new Date().toISOString() }
    }
  ],
  recetas: [
    {
      id_receta: 1,
      id_historia: 1,
      od_esfera: -1.25,
      od_cilindro: -0.50,
      od_eje: 180,
      oi_esfera: -1.00,
      oi_cilindro: -0.75,
      oi_eje: 175,
      adicion: 0.00,
      distancia_pupilar: 63.00,
      fecha_emision: new Date().toISOString()
    }
  ],
  facturacion: [
    {
      id_factura: 1,
      id_cita: 1,
      monto_total: 100.00,
      fecha_emision: new Date().toISOString(),
      metodo_pago: 'Efectivo',
      estado_pago: 'Pagado',
      cita: {
        id_cita: 1,
        fecha_hora: new Date().toISOString(),
        paciente: { nombres: 'Juan', apellidos: 'Pérez Gómez' },
        medico: { nombres: 'Carlos', apellidos: 'Pérez Torres' },
        servicio: { nombre: 'Consulta Oftalmológica General' }
      }
    }
  ]
};

function getMockDb(): MockDb {
  if (typeof window === 'undefined') return defaultMockDb;
  const dbStr = localStorage.getItem('nawi_mock_db');
  if (!dbStr) {
    localStorage.setItem('nawi_mock_db', JSON.stringify(defaultMockDb));
    return defaultMockDb;
  }
  try {
    return JSON.parse(dbStr);
  } catch {
    return defaultMockDb;
  }
}

function saveMockDb(db: MockDb) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nawi_mock_db', JSON.stringify(db));
  }
}

function handleMockRequest(endpoint: string, options: RequestInit = {}): any {
  const method = options.method || 'GET';
  const cleanEndpoint = endpoint.replace(/^\//, '').split('/');
  const resource = cleanEndpoint[0];
  const idStr = cleanEndpoint[1];
  const id = idStr ? Number(idStr) : null;
  const body = options.body ? JSON.parse(options.body as string) : null;

  // Manejo del chatbot en modo Standalone
  if (resource === 'chatbot' && cleanEndpoint[1] === 'chat') {
    const text = (body?.mensaje || '').toLowerCase();
    let reply = 'Hola. Soy Nawi-Bot, el asistente inteligente de la clínica Nawi en modo Standalone (offline).\n\nPuedes preguntarme sobre Pacientes, Citas, Médicos, Historias Clínicas, Recetas de Lentes, Servicios, Facturación o Roles.';
    
    if (text.includes('cita')) {
      reply = '📅 **Gestión de Citas:**\nPara programar una cita, dirígete a la pestaña **Citas** (/citas). Haz clic en **Agendar Cita** y selecciona el Paciente, el Médico que le atenderá, la fecha/hora y el Servicio correspondiente.';
    } else if (text.includes('paciente')) {
      reply = '👥 **Gestión de Pacientes:**\nPara registrar un nuevo paciente, ve a la sección **Pacientes** (/pacientes) y haz clic en **Registrar Paciente**. Deberás completar el DNI, nombres, apellidos, teléfono y fecha de nacimiento. Opcionalmente puedes vincular su cuenta de usuario.';
    } else if (text.includes('receta') || text.includes('lente') || text.includes('medida')) {
      reply = '👓 **Recetas de Lentes:**\nPuedes emitir medidas ópticas en la sección **Recetas de Lentes** (/recetas). El formulario te solicitará los valores de esfera, cilindro, eje, adición y distancia pupilar para el ojo derecho e izquierdo, vinculados a la historia clínica del paciente.';
    } else if (text.includes('historia') || text.includes('clinica')) {
      reply = '📝 **Historias Clínicas:**\nRegistra el expediente clínico en la sección **Historias Clínicas** (/historias). Aquí se almacena el diagnóstico y observaciones, junto a los datos oftalmológicos específicos de **agudeza visual** y **presión intraocular (mmHg)** para ambos ojos (OD/OI).';
    } else if (text.includes('medico') || text.includes('doctor')) {
      reply = '👨‍⚕️ **Personal Médico:**\nEn la sección **Médicos** (/medicos) se puede listar al personal disponible, con su DNI/CMP y su especialidad médica (Oftalmología General por defecto).';
    } else if (text.includes('servicio') || text.includes('precio')) {
      reply = '💰 **Catálogo de Servicios:**\nEn la sección **Servicios** (/servicios) puedes configurar los tipos de consulta y cirugías disponibles con sus respectivos precios (por ejemplo, "Cirugía de Cataratas" o "Medida de Vista").';
    } else if (text.includes('factura') || text.includes('pago') || text.includes('cobro')) {
      reply = '💳 **Facturación y Cobros:**\nEn **Facturación** (/facturacion) se gestionan los recibos de cobro de las citas médicas. Puedes indicar el método de pago (Efectivo, Tarjeta, etc.) y marcar el estado como "Pagado" o "Pendiente".';
    } else if (text.includes('usuario') || text.includes('rol')) {
      reply = '🔒 **Roles y Usuarios:**\nLos accesos de personal y privilegios administrativos se configuran en **Usuarios** (/usuarios) y **Roles** (/roles). Esta función requiere tener rol de Administrador (`Admin`).';
    } else if (text.includes('hola') || text.includes('buenos') || text.includes('tardes') || text.includes('dias')) {
      reply = '👋 ¡Hola! Soy Nawi-Bot, el asistente virtual de la clínica oftalmológica Nawi. ¿En qué sección del sistema o flujo médico te gustaría que te guíe hoy?';
    } else if (text.includes('gracias') || text.includes('ok') || text.includes('yap')) {
      reply = '¡De nada! Si tienes más dudas sobre cómo registrar pacientes, programar citas o registrar medidas de lentes, escríbeme. 😊';
    }
    
    return {
      respuesta: reply
    };
  }

  const db = getMockDb();
  const list = (db as any)[resource] || [];

  if (method === 'GET') {
    if (id !== null) {
      const item = list.find((x: any) => {
        const key = Object.keys(x).find(k => k.startsWith('id_'));
        return key ? x[key] === id : x.id === id;
      });
      if (!item) throw new Error(`${resource} con ID ${id} no encontrado.`);
      return item;
    }
    return list;
  }

  if (method === 'POST') {
    const key = `id_${resource.replace(/s$/, '')}`;
    const maxId = list.reduce((max: number, x: any) => Math.max(max, x[key] || x.id || 0), 0);
    const newId = maxId + 1;
    const newItem = {
      [key]: newId,
      ...body,
    };
    
    if (resource === 'pacientes') {
      newItem.usuario = newItem.id_usuario ? db.usuarios.find(u => u.id_usuario === newItem.id_usuario) : null;
    } else if (resource === 'medicos') {
      newItem.usuario = newItem.id_usuario ? db.usuarios.find(u => u.id_usuario === newItem.id_usuario) : null;
    } else if (resource === 'citas') {
      newItem.paciente = db.pacientes.find(p => p.id_paciente === newItem.id_paciente) || null;
      newItem.medico = db.medicos.find(m => m.id_medico === newItem.id_medico) || null;
      newItem.servicio = db.servicios.find(s => s.id_servicio === newItem.id_servicio) || null;
    } else if (resource === 'historias') {
      newItem.paciente = db.pacientes.find(p => p.id_paciente === newItem.id_paciente) || null;
      newItem.cita = db.citas.find(c => c.id_cita === newItem.id_cita) || null;
      newItem.fecha_registro = new Date().toISOString();
    } else if (resource === 'recetas') {
      newItem.fecha_emision = new Date().toISOString();
    } else if (resource === 'facturacion') {
      newItem.fecha_emision = new Date().toISOString();
      const cita = db.citas.find(c => c.id_cita === newItem.id_cita);
      newItem.cita = cita ? {
        id_cita: cita.id_cita,
        fecha_hora: cita.fecha_hora,
        paciente: cita.paciente,
        medico: cita.medico,
        servicio: cita.servicio
      } : null;
    }

    list.push(newItem);
    saveMockDb(db);
    return newItem;
  }

  if (method === 'PATCH' || method === 'PUT') {
    if (id === null) throw new Error(`Se requiere ID para actualizar ${cleanEndpoint[0]}`);
    const key = Object.keys(list[0] || {}).find(k => k.startsWith('id_')) || 'id';
    const index = list.findIndex((x: any) => x[key] === id);
    if (index === -1) throw new Error(`${resource} con ID ${id} no encontrado.`);
    
    const updatedItem = {
      ...list[index],
      ...body
    };

    if (resource === 'pacientes') {
      updatedItem.usuario = updatedItem.id_usuario ? db.usuarios.find(u => u.id_usuario === updatedItem.id_usuario) : null;
    } else if (resource === 'medicos') {
      updatedItem.usuario = updatedItem.id_usuario ? db.usuarios.find(u => u.id_usuario === updatedItem.id_usuario) : null;
    } else if (resource === 'citas') {
      updatedItem.paciente = db.pacientes.find(p => p.id_paciente === updatedItem.id_paciente) || null;
      updatedItem.medico = db.medicos.find(m => m.id_medico === updatedItem.id_medico) || null;
      updatedItem.servicio = db.servicios.find(s => s.id_servicio === updatedItem.id_servicio) || null;
    }

    list[index] = updatedItem;
    saveMockDb(db);
    return updatedItem;
  }

  if (method === 'DELETE') {
    if (id === null) throw new Error(`Se requiere ID para eliminar ${cleanEndpoint[0]}`);
    const key = Object.keys(list[0] || {}).find(k => k.startsWith('id_')) || 'id';
    const filtered = list.filter((x: any) => x[key] !== id);
    (db as any)[resource] = filtered;
    saveMockDb(db);
    return { success: true };
  }

  return null;
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    console.warn(`[Backend no disponible] Usando base de datos mock para: ${endpoint}`);
    return handleMockRequest(endpoint, options);
  }

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('Sesión expirada. Inicie sesión nuevamente.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ocurrió un error en el servidor.');
  }

  if (response.status === 204) {
    return null;
  }

  const json = await response.json();
  return json && typeof json === 'object' && json.hasOwnProperty('success') && json.hasOwnProperty('data') ? json.data : json;
}

export const apiService = {
  async getAll<T>(endpoint: string): Promise<T[]> {
    return request(endpoint, { method: 'GET' });
  },

  async getOne<T>(endpoint: string, id: number | string): Promise<T> {
    return request(`${endpoint}/${id}`, { method: 'GET' });
  },

  async create<T>(endpoint: string, data: any): Promise<T> {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update<T>(endpoint: string, id: number | string, data: any): Promise<T> {
    return request(`${endpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint: string, id: number | string): Promise<any> {
    return request(`${endpoint}/${id}`, { method: 'DELETE' });
  },
};
