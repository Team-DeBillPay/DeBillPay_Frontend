import React from "react";
import { useNavigate } from "react-router-dom";
import lockIcon from "../assets/icons/lock2.png";
import unlockIcon from "../assets/icons/unlock3.png";

const CURRENT_USER_ID = "user-123";

const getStatusColor = (status) => {
  switch (status) {
    case "paid":
      return "bg-[#A4FFC4]";
    case "partial":
      return "bg-[#FEEBBB]";
    case "unpaid":
      return "bg-[#FFACAE]";
    default:
      return "bg-gray-300";
  }
};

const CheckCard = ({ check }) => {
  const navigate = useNavigate();
  const isOrganizer = check.organizerId === CURRENT_USER_ID;

  const handleNavigate = () => {
    navigate(`/checks/${check.id}`);
  };

  return (
    <div className="bg-[#456DB4] rounded-[24px] py-4 px-6 text-white flex flex-col h-full">
      {/* Верхній блок: Дата та Статуси */}
      <div className="flex justify-between items-center">
        <span className="text-sm opacity-90">{check.date}</span>
        <div className="flex items-center gap-2">
          {isOrganizer && (
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded">
              Організатор
            </span>
          )}
          <div
            className={`w-[24px] h-[24px] rounded-full ${getStatusColor(
              check.paymentStatus
            )}`}
            title={check.paymentStatus}
          />
          <span title={check.lockStatus}>
            <img
              src={check.lockStatus === "open" ? unlockIcon : lockIcon}
              alt={check.lockStatus === "open" ? "Відкрито" : "Заблоковано"}
              className="w-[24px] h-[24px]"
            />
          </span>
        </div>
      </div>

      {/* Середній блок: Назва */}
      <div className="flex-grow my-3">
        <h3 className="text-xl font-bold text-left truncate">{check.title}</h3>
      </div>

      {/* Нижній блок: Кнопка */}
      <div className="flex justify-end">
        <button
          onClick={handleNavigate}
          className="bg-[#B6CDFF] text-[#021024] rounded-[16px] py-2 px-6 font-semibold hover:bg-gray-100 transition-colors"
        >
          Детальніше
        </button>
      </div>
    </div>
  );
};

export default CheckCard;
