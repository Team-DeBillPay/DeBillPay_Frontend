import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

export const analyticsAPI = {
  // Отримання динаміки боргів (6 або 12 місяців)
  getDebtsFlow: async (period = 6) => {
    const token = getJWT();
    if (!token) throw new Error("Токен не знайдено");

    const response = await fetch(
      `${API_URL}/api/analytics/debts-flow/monthly/${period}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Помилка отримання аналітики");
    }

    return await response.json();
  },
};
