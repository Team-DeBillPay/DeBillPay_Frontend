import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import returnBackIcon from "../../assets/icons/returnback.png";
import commentsIcon from "../../assets/icons/commentsIcon.png";
import historyIcon from "../../assets/icons/historyIcon.png";
import settingsIcon from "../../assets/icons/settingsIcon.png";
import SettingsMenu from "./SettingsMenu";

const CheckHeader = ({
  title,
  isUserOrganizer,
  isEditMode,
  onTitleChange,
  onEditClick,
  onOpenPermissions,
  onHistoryClick,
  onDeleteCheck,
  onCommentsClick,
}) => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleBack = () => {
    navigate("/checks");
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleMenuAction = (action) => {
    setIsSettingsOpen(false);

    if (action === "edit") {
      onEditClick();
    } else if (action === "permissions") {
      onOpenPermissions();
    } else if (action === "delete") {
      onDeleteCheck();
    }
  };

  return (
    <div className="relative flex items-center gap-[16px] z-10">
      {isEditMode && (
        <div className="absolute left-[0px] top-0 bg-[#D1D4E8] rounded-[4px] px-[12px] py-[8px]">
          <span className="text-[#021024] text-[16px] font-medium">
            Режим редагування чеку
          </span>
        </div>
      )}

      {!isEditMode && (
        <button
          onClick={handleBack}
          className="absolute left-0 text-3xl text-[#052659]"
          title="Повернутися до чеків"
        >
          <img
            src={returnBackIcon}
            alt="Повернутися"
            className="w-[32px] h-[32px]"
          />
        </button>
      )}

      <div className="w-full flex justify-center">
        {isEditMode ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-center text-[32px] text-[#021024] font-semibold border-b-2 border-[#021024] bg-transparent focus:outline-none px-2"
          />
        ) : (
          <h1 className="text-center text-[32px] text-[#021024] font-semibold">
            Деталі чеку: “{title}”
          </h1>
        )}
      </div>

      {!isEditMode && (
        <div className="absolute right-0 flex items-center gap-4 ">
          <button title="Коментарі" onClick={onCommentsClick}>
            <img
              src={commentsIcon}
              alt="Коментарі"
              className="w-[28px] h-[28px] cursor-pointer"
            />
          </button>
          <button title="Історія змін чеку" onClick={onHistoryClick}>
            <img
              src={historyIcon}
              alt="Історія"
              className="w-[28px] h-[28px] cursor-pointer"
            />
          </button>
          {isUserOrganizer && (
            <div>
              <button title="Налаштування чеку" onClick={toggleSettings}>
                <img
                  src={settingsIcon}
                  alt="Налаштування"
                  className="w-[28px] h-[28px] cursor-pointer"
                />
              </button>
              <SettingsMenu
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onAction={handleMenuAction}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckHeader;
