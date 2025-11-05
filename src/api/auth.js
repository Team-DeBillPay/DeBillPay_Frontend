// api/auth.js

// Мы не используем API_URL, но оставляем импорт, чтобы ничего не сломалось
import { API_URL } from './init';

// Маленькая утилита для имитации задержки сети
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ===================================================================
// === МОК-ВЕРСИЯ API (ЗАГЛУШКИ) ===
// ===================================================================

export const authAPI = {
  
  /**
   * (МОК) Регистрация пользователя
   */
  register: async (userData) => {
    console.log('%c[MOCK API] POST /api/auth/register', 'color: #52de7d; font-weight: bold;', userData);
    await delay(500);

    // Симулируем успешную регистрацию.
    // Ваша RegisterPage после этого все равно вызывает login,
    // так что нам просто нужно вернуть успешный ответ.
    return { 
      message: 'Mock registration successful',
      user: { ...userData }
    };
  },

  /**
   * (МОК) Вход пользователя
   */
  login: async (credentials) => {
    console.log('%c[MOCK API] POST /api/auth/login', 'color: #52a2de; font-weight: bold;', credentials);
    await delay(500);

    // Симулируем ошибку, если пароль 'error'
    if (credentials.password === 'error') {
       throw new Error('Невірні дані для входу (це тестова помилка з мока)');
    }

    // Симулируем УСПЕШНЫЙ вход.
    // Возвращаем фальшивый, но декодируемый JWT токен.
    // Этот токен содержит ID пользователя, чтобы ProfilePage могла его загрузить.
    // Payload: {"http://.../nameidentifier": "mock-id-123", "isNewUser": "false", "phoneNumber": "+380991234567"}
    const fakeHeader = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    const fakePayloadLogin_b64 = "eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ICJtb2NrLWlkLTEyMyIsICJpc05ld1VzZXIiOiAiZmFsc2UiLCAicGhvbmVOdW1iZXIiOiAiKzM4MDk5MTIzNDU2NyJ9";
    const fakeSignature = "fake-signature-does-not-matter";
    
    return { 
      token: `${fakeHeader}.${fakePayloadLogin_b64}.${fakeSignature}`
    };
  },

  /**
   * (МОК) Google Аутентификация
   */
  googleAuth: async (googleToken) => {
    console.log('%c[MOCK API] POST /api/auth/google', 'color: #de528b; font-weight: bold;');
    await delay(500);

    // Симулируем СЦЕНАРИЙ НОВОГО ПОЛЬЗОВАТЕЛЯ БЕЗ ТЕЛЕФОНА.
    // Это должно вызвать ваше модальное окно на RegisterPage.
    
    // Fake Payload: {"http://.../nameidentifier": "mock-google-id-456", "isNewUser": "true"}
    const fakeHeader = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    const fakePayloadGoogleNew_b64 = "eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ICJtb2NrLWdvb2dsZS1pZC00NTYiLCAiaXNOZXdVc2VyIjogInRydWUifQ";
    
    // Ваша RegisterPage проверяет authResult.isNewUser и authResult.user.phoneNumber
    return {
      token: `${fakeHeader}.${fakePayloadGoogleNew_b64}.fake-signature`,
      isNewUser: true,
      user: {
        _id: "mock-google-id-456",
        phoneNumber: null, // <-- Это заставит появиться модальное окно
        firstName: "Google",
        lastName: "User",
        email: "mock-google-user@gmail.com"
      }
    };
  },

  /**
   * (МОК) Обновление Google Профиля
   * (Эта функция есть у вас в auth.js, но, кажется, не используется на этих страницах)
   */
  updateGoogleProfile: async (updateData) => {
    console.log('%c[MOCK API] PATCH /api/users/google-profile', 'color: #deca52; font-weight: bold;', updateData);
    await delay(300);
    return {
      ...updateData,
      message: "Mock Google profile update successful"
    };
  }
};


// ===================================================================
// === ОРИГИНАЛЬНЫЙ КОД (ВРЕМЕННО ОТКЛЮЧЕН) ===
// ===================================================================
/*
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
*/