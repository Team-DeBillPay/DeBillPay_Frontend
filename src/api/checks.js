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
};