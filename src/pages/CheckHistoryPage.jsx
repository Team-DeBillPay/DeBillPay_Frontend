import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { checksAPI } from "../api/checks";
import { usersAPI } from "../api/users";
import returnBackIcon from "../assets/icons/returnback.png";
import iconProfile from "../assets/icons/iconProfile.png";
import Loader from "../components/Reuse/Loader";

const formatDate = (dateString) => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
};

const HistoryItem = ({ item }) => {
  return (
    <div className="w-[466px] bg-[#456DB4] rounded-[16px] p-[20px] flex flex-row items-start mb-2 last:mb-0 flex-shrink-0">
      <img
        src={iconProfile}
        alt={item.userName || `Користувач ${item.userId}`}
        className="w-[40px] h-[40px] rounded-full object-cover flex-shrink-0 mt-1"
      />

      <div className="ml-[20px] flex-1 flex flex-col items-start">
        <div className="flex justify-between w-full">
          <span className="text-white text-[18px] font-semibold leading-none">
            {item.userName || `Користувач ${item.userId}`}
          </span>
          <span className="text-[#D7E7FF] text-[14px] leading-none">
            {formatDate(item.createdAt)}
          </span>
        </div>

        <div className="mt-[8px] w-full">
          <p className="text-[#D7E7FF] text-[16px] leading-tight text-left">
            {item.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function CheckHistoryPage() {
  const { ebillId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersCache, setUsersCache] = useState({});

  const getUserName = async (userId) => {
    if (usersCache[userId]) return usersCache[userId];

    try {
      const user = await usersAPI.getUserById(userId);
      const userName =
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        `Користувач ${userId}`;

      setUsersCache((prev) => ({ ...prev, [userId]: userName }));
      return userName;
    } catch (err) {
      console.error(`Помилка отримання користувача ${userId}:`, err);
      return `Користувач ${userId}`;
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const historyData = await checksAPI.getHistory(ebillId);

        const enrichedHistory = await Promise.all(
          historyData.map(async (item) => {
            const userName = await getUserName(item.userId);
            return {
              ...item,
              id: item.ebillHistoryId || item.id || Math.random(),
              userName,
            };
          })
        );

        enrichedHistory.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setHistory(enrichedHistory);
      } catch (err) {
        console.error("Помилка завантаження історії:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (ebillId) {
      loadHistory();
    }
  }, [ebillId]);

  const handleBack = () => {
    navigate(`/checks/${ebillId}`);
  };

  return (
    <div className="p-7 bg-[#B6CDFF] rounded-[32px] h-full flex flex-col">
      <div className="bg-white rounded-[24px] px-10 pt-7 pb-9 h-full flex flex-col">
        <div className="relative flex items-center justify-center mb-7 flex-shrink-0">
          <button
            onClick={handleBack}
            className="absolute left-0 text-3xl text-[#052659]"
            title="Повернутися до деталей чеку"
          >
            <img
              src={returnBackIcon}
              alt="Повернутися"
              className="w-[32px] h-[32px]"
            />
          </button>
          <h1 className="text-center text-[32px] text-[#021024] font-semibold">
            Історія змін чеку
          </h1>
        </div>

        <div className="flex-1 max-h-[574px] overflow-y-auto custom-scrollbar flex flex-col items-center w-full">
          {loading ? (
            <Loader text="Завантаження сторінки..." />
          ) : error ? (
            <p className="text-red-600 mt-10">Помилка: {error}</p>
          ) : history.length > 0 ? (
            history.map((item) => <HistoryItem key={item.id} item={item} />)
          ) : (
            <p className="text-[#979AB7] mt-10">Історія змін порожня.</p>
          )}
        </div>
      </div>
    </div>
  );
}
