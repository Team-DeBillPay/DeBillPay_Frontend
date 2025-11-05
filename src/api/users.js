import { API_URL } from './init';
import { getJWT } from '../utils/jwt';

// ===================================================================
// === МОК-ВЕРСИЯ API (ЗАГЛУШКИ) ===
// ===================================================================
//
// Этот код имитирует ответы от сервера, чтобы вы могли
// работать над страницей без рабочего бэкенда.
//

// Маленькая утилита для имитации задержки сети
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const usersAPI = {
  
  /**
   * (МОК) Получает текущего пользователя
   */
  getCurrentUser: async () => {
    console.log('%c[MOCK API] GET /api/users/current', 'color: #a252de; font-weight: bold;');
    
    // Имитируем задержку сети
    await delay(300);

    // Возвращаем фальшивые, но правдоподобные данные
    return {
      _id: 'mock-current-user-id-123',
      firstName: 'Тестовий',
      lastName: 'Користувач',
      email: 'current-user@mock.com',
      phoneNumber: '+380501234567',
    };
  },

  /**
   * (МОК) Получает пользователя по ID
   * Это то, что нужно для вашей ProfilePage
   */
  getUserById: async (userId) => {
    console.log(`%c[MOCK API] GET /api/users/${userId}`, 'color: #52a2de; font-weight: bold;');

    // Имитируем задержку сети
    await delay(300);

    // Возвращаем фальшивые, но правдоподобные данные
    return {
      _id: userId || 'mock-user-id-from-jwt',
      firstName: 'Тестовий',
      lastName: 'Профіль',
      email: 'test-profile@mock.com',
      phoneNumber: '+380998887766',
    };
  },

  /**
   * (МОК) Обновляет пользователя
   * Это то, что нужно для сохранения в ProfilePage
   */
  updateUser: async (userId, userData) => {
    console.log(`%c[MOCK API] PATCH /api/users/${userId}`, 'color: #52de7d; font-weight: bold;', userData);
    
    // Имитируем задержку сохранения
    await delay(500);

    // Проверяем, нужно ли "вызвать" ошибку для теста
    if (userData.firstName === 'Error') {
       throw new Error('Помилка оновлення (це тестова помилка з мока)');
    }

    // Возвращаем обновленные данные, как будто сервер их сохранил
    return {
      _id: userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
    };
  },

  /**
   * (МОК) Получает всех пользователей
   */
  getAllUsers: async () => {
    console.log('%c[MOCK API] GET /api/users', 'color: #de528b; font-weight: bold;');
    
    // Имитируем задержку сети
    await delay(300);

    // Возвращаем фальшивый список
    return [
      { _id: 'id1', firstName: 'Іван', lastName: 'Петренко', email: 'ivan@mock.com' },
      { _id: 'id2', firstName: 'Олена', lastName: 'Васильєва', email: 'olena@mock.com' },
      { _id: 'id3', firstName: 'Тестовий', lastName: 'Профіль', email: 'test-profile@mock.com' },
    ];
  }
};


// ===================================================================
// === ОРИГИНАЛЬНЫЙ КОД (ВРЕМЕННО ОТКЛЮЧЕН) ===
// ===================================================================
/*
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
*/