import { API_URL } from './init';
import { getJWT } from '../utils/jwt';

export const usersAPI = {
  getCurrentUser: async () => {
    const token = getJWT();
    if (!token) {
      throw new Error('Токен не знайдено');
    }

    const response = await fetch(`${API_URL}/api/users/current`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Помилка отримання даних користувача');
    }

    return await response.json();
  },

  getUserById: async (userId) => {
    const token = getJWT();
    if (!token) {
      throw new Error('Токен не знайдено');
    }

    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Помилка отримання даних користувача');
    }

    return await response.json();
  },

  updateUser: async (userId, userData) => {
    const token = getJWT();
    if (!token) {
      throw new Error('Токен не знайдено');
    }

    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Помилка оновлення даних');
    }

    return await response.json();
  },

  getAllUsers: async () => {
    const token = getJWT();
    if (!token) {
      throw new Error('Токен не знайдено');
    }

    const response = await fetch(`${API_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Помилка отримання списку користувачів');
    }

    return await response.json();
  }
};