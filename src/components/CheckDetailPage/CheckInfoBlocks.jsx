import React from "react";
import iconProfile from "../../assets/icons/iconProfile.png";

const statusStyles = {
  активний: "bg-[#7BE495]",
  закритий: "bg-[#E5566C]",
  погашений: "bg-[#A4FFC4]",
  "частково погашений": "bg-[#FEEBBB]",
  непогашений: "bg-[#FFACAE]",
};

const StatusTag = ({ text }) => {
  const bgColor = statusStyles[text] || "bg-gray-300";

  return (
    <span
      className={`
      ${bgColor}
      text-[#042860] text-[18px] px-8 py-[8px] rounded-[16px] font-medium
    `}
    >
      {text}
    </span>
  );
};

const CheckInfoBlocks = ({
  check,
  currentUserId,
  isUserOrganizer,
  organizerUser,
  isEditMode,
  onDescriptionChange,
  onOrganizerExpenseChange,
}) => {
  const { description, status, amountOfDept, currency, scenario } = check;

  const getOrganizerName = () => {
    if (!organizerUser) return "Завантаження...";

    const firstName = organizerUser.firstName || "";
    const lastName = organizerUser.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || `Користувач ${organizerUser.userId || organizerUser.id}`;
  };

  return (
    <div className="flex flex-row gap-4 items-start">
      <div className="bg-[#B6CDFF] p-5 rounded-[16px] flex-shrink-0">
        <h3 className="text-[20px] text-[#021024] font-semibold mb-4">
          Організатор
        </h3>
        <div className="flex items-center gap-3">
          <img
            src={iconProfile}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <span className="font-medium text-[18px] text-[#042860]">
            {getOrganizerName()} {isUserOrganizer && "(Я)"}
          </span>
        </div>
        {scenario !== "спільні витрати" && (
          <div className="mt-4 flex flex-col gap-[8px]">
            <span className="text-[18px] text-[#042860]">Витрати:</span>
            {isEditMode && scenario !== "індивідуальні суми" ? (
              <div className="relative inline-block">
                <input
                  type="number"
                  value={amountOfDept}
                  onChange={(e) => onOrganizerExpenseChange(e.target.value)}
                  className="w-[120px] bg-white rounded-lg py-2 px-4 font-semibold text-[18px] text-[#042860] border-b-2 border-[#042860] focus:outline-none"
                />
                <span className="absolute right-2 top-2 text-[#042860]">
                  {currency}
                </span>
              </div>
            ) : (
              <p className="bg-white rounded-lg py-2 px-7 font-semibold text-[18px] text-[#042860] inline-block mt-1">
                {amountOfDept || "---"} {currency}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-[#EBF1FF] p-5 rounded-[16px] flex-1">
        <h3 className="text-[20px] text-[#021024] font-semibold mb-4">Опис</h3>
        {isEditMode ? (
          <input
            value={description || ""}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full h-auto bg-transparent text-[18px] text-[#042860] border-b border-[#042860] focus:outline-none resize-none"
            placeholder="Введіть опис..."
          />
        ) : (
          <p
            className={`text-[18px] ${
              description ? "text-[#042860]" : "text-[#979AB7] italic"
            }`}
          >
            {description || "Чек не має опису."}
          </p>
        )}
      </div>

      <div className="bg-[#B6CDFF] p-5 rounded-[16px] flex-shrink-0">
        <h3 className="text-[20px] text-[#021024] font-semibold mb-4">
          Статуси
        </h3>
        <div className="flex flex-col items-start gap-2 ">
          <StatusTag text={check.status} />
          <StatusTag text={check.currentUserPaymentStatus} />
        </div>
      </div>
    </div>
  );
};

export default CheckInfoBlocks;