import React from "react";

const SettingsMenu = ({
  isOpen,
  onClose,
  onAction,
  canGrantRights,
  canDeleteCheck,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>

      <div className="absolute top-[110%] right-0 bg-white rounded-[8px] shadow-xl z-50 overflow-hidden w-max">
        <div className="bg-[#B6CDFF] py-[16px] px-[48px]">
          <p className="text-[20px] text-[#021024] font-bold whitespace-nowrap">
            Налаштування чеку
          </p>
        </div>

        <div className="flex flex-col">
          <button
            onClick={() => onAction("edit")}
            className="py-[20px] px-[20px] text-[18px] text-[#042860] font-medium hover:bg-gray-50 transition-colors"
          >
            Редагувати чек
          </button>

          {canGrantRights && (
            <>
              <div className="h-[1px] bg-[#D1D4E8] mx-[20px]"></div>
              <button
                onClick={() => onAction("permissions")}
                className="py-[20px] px-[20px] text-[18px] text-[#042860] font-medium hover:bg-gray-50 transition-colors"
              >
                Надати права учасникам
              </button>
            </>
          )}

          {canDeleteCheck && (
            <>
              <div className="h-[1px] bg-[#D1D4E8] mx-[20px]"></div>
              <button
                onClick={() => onAction("delete")}
                className="py-[20px] px-[20px] text-[18px] text-[#E5566C] font-medium hover:bg-gray-50 transition-colors"
              >
                Видалити чек
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsMenu;
