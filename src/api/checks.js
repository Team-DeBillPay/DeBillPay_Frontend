import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

export const checksAPI = {
  getAllChecks: async () => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/ebills`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Помилка отримання чеків");
    }

    return await response.json();
  },

  getCheckById: async (ebillId) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/ebills/${ebillId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Помилка отримання чеку");
    }

    return await response.json();
  },

  updateEditorRights: async (ebillId, data) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/ebills/${ebillId}/editor-rights`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Помилка оновлення прав редактора";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
      }
      throw new Error(errorMessage);
    }

    const contentLength = response.headers.get('content-length');
    if (response.status === 204 || contentLength === '0') {
      return { success: true };
    }

    return await response.json();
  },

  addParticipants: async (ebillId, data) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/ebills/${ebillId}/participants/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Ответ сервера:", response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = `Помилка додавання учасників: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error("Деталі помилки:", errorData);
      } catch (e) {
        console.error("Не вдалося розірвати помилку:", e);
      }
      throw new Error(errorMessage);
    }

    const contentLength = response.headers.get('content-length');
    if (response.status === 204 || contentLength === '0') {
      return { success: true, message: "Учасники успішно додані" };
    }

    const result = await response.json();
    console.log("Успішна відповідь:", result);
    return result;
  },

  updateParticipants: async (ebillId, updateData) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/ebills/${ebillId}/participants/update`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      let errorMessage = "Помилка оновлення учасників";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
      }
      throw new Error(errorMessage);
    }

    const contentLength = response.headers.get('content-length');
    if (response.status === 204 || contentLength === '0') {
      return { success: true };
    }

    return await response.json();
  },

removeParticipant: async (ebillId, participantId) => {
  const token = getJWT();
  if (!token) {
    throw new Error("Токен не знайдено");
  }

  const response = await fetch(
    `${API_URL}/api/ebills/${ebillId}/participants/${participantId}/remove`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    let errorMessage = "Помилка видалення учасника";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return { success: true };
  }

  return await response.json();
  },

  deleteCheck: async (ebillId) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/ebills/delete${ebillId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = "Помилка видалення чеку";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }
    
    return await response.json();
  },

  getHistory: async (ebillId) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/ebills/${ebillId}/history`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = "Помилка отримання історії";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },

  updateCheck: async (ebillId, updateData) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/ebills/${ebillId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      let errorMessage = "Помилка оновлення чеку";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
      }
      throw new Error(errorMessage);
    }

    const contentLength = response.headers.get('content-length');
    if (response.status === 204 || contentLength === '0') {
      return { success: true };
    }

    return await response.json();
  },

};