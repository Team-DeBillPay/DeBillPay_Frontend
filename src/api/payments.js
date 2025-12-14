import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

export const paymentsAPI = {
  create: async ({ ebillId, amount }) => {
    const token = getJWT();
    if (!token) throw new Error("Токен не знайдено");

    const response = await fetch(`${API_URL}/api/payments/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ebillId: Number(ebillId),
        amount: Number(amount),
      }),
    });

    if (!response.ok) {
      let errorMessage = `Помилка створення платежу: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    return await response.json();
  },
};
