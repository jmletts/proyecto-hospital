const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  id_usuario: number;
  correo: string;
  rol: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// Helpers para interactuar con la base de datos mock compartida
interface MockDb {
  roles: any[];
  usuarios: any[];
}

function getMockDb(): MockDb {
  if (typeof window === 'undefined') return { roles: [], usuarios: [] };
  const dbStr = localStorage.getItem('nawi_mock_db');
  if (!dbStr) return { roles: [], usuarios: [] };
  try {
    return JSON.parse(dbStr);
  } catch {
    return { roles: [], usuarios: [] };
  }
}

function saveMockDb(db: MockDb) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nawi_mock_db', JSON.stringify(db));
  }
}

export const authService = {
  async register(correo: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar el usuario.');
      }

      const resJson = await response.json();
      return resJson.data || resJson;
    } catch (err) {
      console.warn('[Backend no disponible] Registrando usuario en la base de datos mock local.');
      const db = getMockDb();
      const userExists = db.usuarios.some(u => u.correo === correo);
      if (userExists) {
        throw new Error('El correo ya se encuentra registrado.');
      }

      const maxId = db.usuarios.reduce((max, u) => Math.max(max, u.id_usuario || 0), 0);
      const newId = maxId + 1;
      const newUser = {
        id_usuario: newId,
        id_rol: 1, // Por defecto Admin para pruebas locales
        correo,
        estado: true,
        fecha_creacion: new Date().toISOString(),
        rol: { id_rol: 1, nombre: 'Admin' }
      };

      db.usuarios.push(newUser);
      saveMockDb(db);
      return newUser;
    }
  },

  async login(correo: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciales inválidas.');
      }

      const resJson = await response.json();
      const data: LoginResponse = resJson.data || resJson;
      
      if (typeof window !== 'undefined') {
        document.cookie = `token=${data.access_token}; path=/; max-age=${8 * 60 * 60}; SameSite=Strict`;
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (err) {
      console.warn('[Backend no disponible] Iniciando sesión en MODO DEMO/MOCK.');
      // En modo mock, permitimos ingresar con cualquier correo y contraseña.
      // Si el correo ya existe en el mock db lo usamos, sino creamos uno Admin por defecto.
      const db = getMockDb();
      const existingUser = db.usuarios.find(u => u.correo === correo);
      
      const userRolName = existingUser?.rol?.nombre || 'Admin';
      
      const mockUser: User = {
        id_usuario: existingUser?.id_usuario || 1,
        correo: correo || 'admin@nawi.com',
        rol: userRolName,
      };

      // Crear un fake token con payload Base64 para que Astro SSR lo decodifique correctamente
      const payload = { correo: mockUser.correo, rol: mockUser.rol };
      const payloadBase64 = btoa(JSON.stringify(payload));
      const fakeToken = `fakeheader.${payloadBase64}.fakesignature`;

      const data: LoginResponse = {
        access_token: fakeToken,
        user: mockUser
      };
      
      if (typeof window !== 'undefined') {
        document.cookie = `token=${data.access_token}; path=/; max-age=${8 * 60 * 60}; SameSite=Strict`;
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    }
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
      localStorage.removeItem('user');
    }
  },

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
};
