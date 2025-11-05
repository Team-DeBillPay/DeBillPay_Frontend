import { API_URL } from './init';

export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Помилка реєстрації');
    }

    return await response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Невірні дані для входу');
    }

    return await response.json();
  },

  googleAuth: async (googleToken) => {
    const response = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: googleToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Помилка авторизації через Google');
    }

    return await response.json();
  },

  updateGoogleProfile: async (updateData) => {
    const token = localStorage.getItem('jwt-token');
    if (!token) {
      throw new Error('Користувач не авторизований');
    }

    const response = await fetch(`${API_URL}/api/users/google-profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Помилка оновлення профілю');
    }

    return await response.json();
  }
};