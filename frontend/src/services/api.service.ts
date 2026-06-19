const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  const match = document.cookie.match(/(^|;\s*)token=([^;]*)/);
  return match ? match[2] : '';
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

  const response = await fetch(`${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Redirigir a login si el token expira o es inválido
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

  // Si la respuesta no tiene contenido (por ejemplo DELETE)
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
