import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import returnBackIcon from "../assets/icons/returnback.png";
import iconProfile from "../assets/icons/iconProfile.png";

// --- ЗАГЛУШКИ ---
const mockHistory = [
  {
    id: 1,
    userId: "user-123",
    userName: "Владислав Якубець",
    action: "Створив(ла) чек",
    date: "12.10.2025 14:30",
  },
  {
    id: 2,
    userId: "user-789",
    userName: "Джоніс Золото",
    action: "Приєднався(лась) до чеку",
    date: "12.10.2025 15:00",
  },
  {
    id: 3,
    userId: "user-456",
    userName: "Віталя П.",
    action: "Змінив(ла) назву чеку на 'Пікнік'",
    date: "12.10.2025 15:15",
  },
  {
    id: 4,
    userId: "user-101",
    userName: "Яся Аналітік",
    action: "Сплатив(ла) борг 100 грн",
    date: "12.10.2025 16:00",
  },
  {
    id: 5,
    userId: "user-123",
    userName: "Владислав Якубець",
    action: "Додав(ла) опис до чеку",
    date: "12.10.2025 16:30",
  },
  {
    id: 6,
    userId: "user-789",
    userName: "Джоніс Золото",
    action: "Змінив(ла) свою суму витрат",
    date: "12.10.2025 17:00",
  },
  {
    id: 7,
    userId: "user-456",
    userName: "Віталя П.",
    action: "Повністю погасив(ла) свій борг",
    date: "12.10.2025 18:00",
  },
  {
    id: 8,
    userId: "user-101",
    userName: "Яся Аналітік",
    action: "Залишив(ла) коментар",
    date: "12.10.2025 19:00",
  },
  {
    id: 9,
    userId: "user-123",
    userName: "Владислав Якубець",
    action: "Закрив(ла) чек",
    date: "13.10.2025 10:00",
  },
];

// --- КОМПОНЕНТ ЕЛЕМЕНТУ ІСТОРІЇ ---
const HistoryItem = ({ item }) => {
  return (
    <div className="w-[466px] bg-[#456DB4] rounded-[16px] p-[20px] flex flex-row items-start mb-2 last:mb-0 flex-shrink-0">
      {/* Аватарка */}
      <img
        src={iconProfile}
        alt={item.userName}
        className="w-[40px] h-[40px] rounded-full object-cover flex-shrink-0 mt-1"
      />

      {/* Текстовий блок */}
      <div className="ml-[20px] flex-1 flex flex-col items-start">
        {/* Верхній рядок: Ім'я та Дата */}
        <div className="flex justify-between w-full">
          <span className="text-white text-[18px] font-semibold leading-none">
            {item.userName}
          </span>
          <span className="text-[#D7E7FF] text-[14px] leading-none">
            {item.date}
          </span>
        </div>

        {/* Нижній рядок: Дія */}
        <div className="mt-[8px] w-full">
          <p className="text-[#D7E7FF] text-[16px] leading-tight text-left">
            {item.action}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- ГОЛОВНА СТОРІНКА ІСТОРІЇ ---
export default function CheckHistoryPage() {
  const { ebillId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Тут буде запит до бекенду: checksAPI.getHistory(ebillId)
    setHistory(mockHistory);
  }, [ebillId]);

  const handleBack = () => {
    navigate(`/checks/${ebillId}`);
  };

  return (
    <div className="p-7 bg-[#B6CDFF] rounded-[32px] h-full flex flex-col">
      <div className="bg-white rounded-[24px] px-10 pt-7 pb-9 h-full flex flex-col">
        {/* Хедер сторінки */}
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

        {/* Список історії */}
        <div className="flex-1 max-h-[574px] overflow-y-auto custom-scrollbar flex flex-col items-center w-full">
          {history.length > 0 ? (
            history.map((item) => <HistoryItem key={item.id} item={item} />)
          ) : (
            <p className="text-[#979AB7] mt-10">Історія змін порожня.</p>
          )}
        </div>
      </div>
    </div>
  );
}
