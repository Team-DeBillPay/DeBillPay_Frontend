import React from "react";
import { useNavigate } from "react-router-dom";
import lockIcon from "../../assets/icons/lock2.png";
import unlockIcon from "../../assets/icons/unlock3.png";
import { getIdFromJWT } from "../../utils/jwt";

const getStatusColor = (paymentStatus) => {
  switch (paymentStatus) {
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const CheckCard = ({ check }) => {
  const navigate = useNavigate();
  const currentUserId = getIdFromJWT();

  const currentUserParticipant = check.participants?.find(
    (participant) => participant.userId.toString() === currentUserId
  );

  const isOrganizer = currentUserParticipant?.isAdminRights || false;
  const paymentStatus = currentUserParticipant?.paymentStatus || "непогашений";
  const lockStatus = getLockStatus(check.status);

  const handleNavigate = () => {
    navigate(`/checks/${check.ebillId}`);
  };

  return (
    <div className="bg-[#456DB4] rounded-[24px] py-4 px-6 text-white flex flex-col h-full">
      <div className="flex justify-between items-center">
        <span className="text-sm opacity-90">
          {formatDate(check.createdAt)}
        </span>
        <div className="flex items-center gap-2">
          {isOrganizer && (
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded">
              Організатор
            </span>
          )}
          <div
            className={`w-[24px] h-[24px] rounded-full ${getStatusColor(
              paymentStatus
            )}`}
            title={paymentStatus}
          />
          <span title={lockStatus === "open" ? "Відкрито" : "Заблоковано"}>
            <img
              src={lockStatus === "open" ? unlockIcon : lockIcon}
              alt={lockStatus === "open" ? "Відкрито" : "Заблоковано"}
              className="w-[24px] h-[24px]"
            />
          </span>
        </div>
      </div>

      <div className="flex-grow my-3">
        <h3 className="text-xl font-bold text-left truncate">{check.name}</h3>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm opacity-90">
          {check.currency} • {check.scenario}
        </span>
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
