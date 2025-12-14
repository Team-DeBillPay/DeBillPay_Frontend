import { API_URL } from "./init";
import { getJWT } from "../utils/jwt";

async function authedFetch(url, options = {}) {
  const token = getJWT();
  if (!token) throw new Error("Токен не знайдено");

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let msg = "Помилка запиту";
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const groupsAPI = {
  getGroups: async () => {
    return authedFetch(`${API_URL}/api/groups`, { method: "GET" });
  },

  createGroup: async (name, friendIds) => {
    return authedFetch(`${API_URL}/api/groups/create`, {
      method: "POST",
      body: JSON.stringify({ name, friendIds }),
    });
  },

  deleteGroup: async (groupId) => {
    return authedFetch(`${API_URL}/api/groups/${groupId}/delete`, {
      method: "DELETE",
    });
  },

  getGroupById: async (groupId) => {
    return authedFetch(`${API_URL}/api/groups/${groupId}`, { method: "GET" });
  },
};
