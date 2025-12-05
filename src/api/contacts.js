import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

export const contactsAPI = {
  getContacts: async () => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/contacts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Помилка отримання контактів");
    }

    return await response.json();
  },

  searchNewContact: async (query) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(
      `${API_URL}/api/users/searchNewContact?query=${encodeURIComponent(
        query
      )}`,
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
      throw new Error(errorData.message || "Помилка пошуку користувача");
    }

    return await response.json();
  },

  searchFriend: async (query) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(
      `${API_URL}/api/users/searchFriend?query=${encodeURIComponent(query)}`,
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
      throw new Error(errorData.message || "Помилка пошуку друга");
    }

    return await response.json();
  },

  sendInvite: async (receiverId) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(
      `${API_URL}/api/contacts/invite?receiverId=${receiverId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Помилка відправки запрошення");
    }

    return await response.json();
  },

  acceptInvite: async (invitationId) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(
      `${API_URL}/api/contacts/accept?invitationId=${invitationId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Помилка прийняття запрошення");
    }

    return await response.json();
  },

  rejectInvite: async (invitationId) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(
      `${API_URL}/api/contacts/reject?invitationId=${invitationId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Помилка відхилення запрошення");
    }

    return await response.json();
  },

  getInvitations: async () => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/users/invitationsContacts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Помилка отримання запрошень");
    }

    return await response.json();
  },

  deleteContact: async (friendId) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(
      `${API_URL}/api/contacts/delete?friendId=${friendId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Помилка видалення контакту");
    }

    return await response.json();
  },

  validateUsers: async (userIds) => {
    const token = getJWT();
    if (!token) {
      throw new Error("Токен не знайдено");
    }

    const response = await fetch(`${API_URL}/api/users/validate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
      throw new Error("Помилка перевірки користувачів");
    }

    return await response.json();
  }
};
