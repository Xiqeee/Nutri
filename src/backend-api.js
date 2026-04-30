const API_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('nutritrack_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  async register(email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro no registo');
    if (data.token) localStorage.setItem('nutritrack_token', data.token);
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro no login');
    if (data.token) localStorage.setItem('nutritrack_token', data.token);
    return data;
  },

  async saveProfile(profile) {
    const res = await fetch(`${API_URL}/user/profile`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao guardar perfil');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_URL}/user/me`, { headers: getHeaders() });
    if (res.status === 401) {
      localStorage.removeItem('nutritrack_token');
      return null;
    }
    const data = await res.json();
    return data;
  },

  async analyze(text) {
    const res = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro na análise');
    return data;
  },

  async getMeals(date) {
    const res = await fetch(`${API_URL}/meals/${date}`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao carregar refeições');
    return data;
  },

  async saveMeal(meal) {
    const res = await fetch(`${API_URL}/meals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(meal)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao guardar refeição');
    return data;
  },

  async deleteMeal(id) {
    const res = await fetch(`${API_URL}/meals/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erro ao eliminar');
    }
    return true;
  },

  logout() {
    localStorage.removeItem('nutritrack_token');
    window.location.reload();
  }
};
