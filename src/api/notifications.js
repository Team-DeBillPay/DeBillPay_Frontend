import { API_URL } from './init';
import { getJWT } from '../utils/jwt';

export const notificationsAPI = {
  getAllNotifications: async () => {
    const token = getJWT();
    if (!token) {
      throw new Error('Токен не знайдено');
    }

    const response = await fetch(`${API_URL}/api/notifications/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
      }
      throw new Error(errorData.message || 'Помилка отримання повідомлень');
    }

    return await response.json();
  },

  markAsRead: async (notificationId) => {
    const token = getJWT();
    if (!token) {
      throw new Error('Токен не знайдено');
    }

    const response = await fetch(`${API_URL}/api/notifications/mark-read/${notificationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
      }
      throw new Error(errorData.message || 'Помилка оновлення статусу повідомлення');
    }

    if (response.status === 204) {
      return { success: true };
    }

    try {
      return await response.json();
    } catch {
      return { success: true };
    }
  },

  markMultipleAsRead: async (notificationIds) => {
    const results = [];
    for (const id of notificationIds) {
      try {
        const result = await notificationsAPI.markAsRead(id);
        results.push({ id, success: true, data: result });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }
    return results;
  }
};
