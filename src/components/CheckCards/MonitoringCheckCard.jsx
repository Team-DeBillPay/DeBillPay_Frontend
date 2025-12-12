import React from "react";
import lockIcon from "../../assets/icons/lock2.png";
import unlockIcon from "../../assets/icons/unlock3.png";
import { useNavigate } from "react-router-dom";
import { getIdFromJWT } from "../../utils/jwt";

// Конфігурація статусів для відображення
const getStatusConfig = (backendStatus) => {
  const status = backendStatus?.toLowerCase();

  switch (status) {
    case "погашений":
      return { text: "Сплачено", color: "bg-[#A4FFC4]" };
    case "непогашений":
      return { text: "Очікується", color: "bg-[#FFACAE]" };
    case "частково погашений":
      return { text: "Частково", color: "bg-[#FEEBBB]" };
    default:
      return { text: status, color: "bg-gray-300" };
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getLockStatus = (status) => {
  switch (status) {
    case "активний":
      return "open";
    case "закритий":
      return "closed";
    default:
      return "open";
  }
};

const MonitoringCheckCard = ({ check, usersCache, currentUserId }) => {
  const navigate = useNavigate();

  const currentUserParticipant = check.participants?.find(
    (participant) => participant.userId.toString() === currentUserId
  );

  const isOrganizer = currentUserParticipant?.isAdminRights || false;
  const paymentStatus = currentUserParticipant?.paymentStatus || "непогашений";
  const lockStatus = getLockStatus(check.status);

  // Фільтрація учасників:
  // Якщо "спільні витрати" - показуємо всіх.
  // Якщо інший сценарій - показуємо всіх, КРІМ організатора
  const visibleParticipants = check.participants.filter((p) => {
    if (check.scenario === "спільні витрати") return true;
    return p.userId.toString() !== currentUserId?.toString();
  });

  const handleNavigate = () => {
    navigate(`/checks/${check.ebillId}`);
  };

  const getMainStatusColor = (status) => {
    switch (status) {
      case "погашений":
        return "bg-[#A4FFC4]";
      case "частково погашений":
        return "bg-[#FEEBBB]";
      case "непогашений":
        return "bg-[#FFACAE]";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="bg-[#456DB4] rounded-[24px] py-6 px-6 text-white flex flex-col h-full w-full max-w-[380px]">
      {/* --- ВЕРХНЯ ЧАСТИНА (HEADER) --- */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm opacity-90">
          {formatDate(check.createdAt)}
        </span>
        <div className="flex items-center gap-2">
          {isOrganizer && (
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded">
              Організатор
            </span>
          )}
          {/* Кружечок статусу чеку */}
          <div
            className={`w-[24px] h-[24px] rounded-full ${getMainStatusColor(
              paymentStatus
            )}`}
            title={paymentStatus}
          />
          {/* Замок */}
          <span title={lockStatus === "open" ? "Відкрито" : "Заблоковано"}>
            <img
              src={lockStatus === "open" ? unlockIcon : lockIcon}
              alt={lockStatus === "open" ? "Відкрито" : "Заблоковано"}
              className="w-[24px] h-[24px]"
            />
          </span>
        </div>
      </div>

      {/* Назва чеку */}
      <h3 className="text-[20px] font-bold mb-4 text-left truncate">
        {check.name}
      </h3>

      {/* Список учасників */}
      <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1 mb-4">
        {visibleParticipants.map((p) => {
          const { text, color } = getStatusConfig(p.paymentStatus);

          const userName = usersCache[p.userId]
            ? `${usersCache[p.userId].firstName} ${
                usersCache[p.userId].lastName
              }`
            : `User ${p.userId}`;

          return (
            <div
              key={p.participantId || p.userId}
              className="flex items-center gap-3"
            >
              {/* Блок з ім'ям (ширина 168px) */}
              <div className="w-[168px] bg-[#B6CDFF] rounded-[8px] py-2 px-3 flex items-center justify-center">
                <span className="text-[#344369] text-[14px] font-semibold truncate w-full text-center">
                  {userName}
                </span>
              </div>

              {/* Блок зі статусом (ширина 104px) */}
              <div
                className={`w-[104px] ${color} rounded-[8px] py-2 px-3 flex items-center justify-center`}
              >
                <span className="text-[#344369] text-[14px] font-semibold truncate">
                  {text}
                </span>
              </div>
            </div>
          );
        })}

        {visibleParticipants.length === 0 && (
          <p className="text-[#D7E7FF] text-sm italic">
            Немає учасників для відображення
          </p>
        )}
      </div>

      {/* --- КНОПКА ДЕТАЛЬНІШЕ --- */}
      <div className="flex justify-end mt-auto">
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

export default MonitoringCheckCard;
