import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

export const paymentsAPI = {
  createPayment: async (ebillId, amount) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/payments/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ebillId: parseInt(ebillId),
        amount: parseFloat(amount)
      }),
    });

    if (!response.ok) {
      let errorMessage = `Помилка створення платежу: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        const text = await response.text();
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  }
};