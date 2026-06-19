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

export const authService = {
  async register(correo: string, password: string): Promise<any> {
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
  },

  async login(correo: string, password: string): Promise<LoginResponse> {
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
    
    // Setea el token en las cookies del lado del cliente para que Astro SSR y el middleware puedan leerlo
    if (typeof window !== 'undefined') {
      document.cookie = `token=${data.access_token}; path=/; max-age=${8 * 60 * 60}; SameSite=Strict`;
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
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
