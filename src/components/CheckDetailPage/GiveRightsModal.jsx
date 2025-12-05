import React, { useState, useEffect } from "react";
import FriendItem from "./FriendItem";
import checkIcon from "../../assets/icons/checkIcon.png";

const GiveRightsModal = ({ isOpen, onClose, participants, onSave }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const editors = participants
        .filter((p) => p.isEditorRights)
        .map((p) => p.userId);
      setSelectedIds(editors);
    }
  }, [isOpen, participants]);

  const handleToggle = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === participants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(participants.map((p) => p.userId));
    }
  };

  const isAllSelected =
    participants.length > 0 && selectedIds.length === participants.length;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[4px] overflow-hidden w-[402px] flex flex-col items-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#B6CDFF] py-[16px] w-full text-center flex flex-col items-center">
          <h3 className="text-[20px] text-[#021024] font-bold w-[240px]">
            Оберіть учасників чеку, яким хочете надати права Організатора
          </h3>
        </div>

        <div className="w-full px-[32px] pt-[32px] pb-[40px] flex flex-col items-center">
          <div
            className="w-full flex items-center mb-[24px] cursor-pointer"
            onClick={handleSelectAll}
          >
            <div
              className={`w-[20px] h-[20px] rounded-[4px] border flex items-center justify-center ${
                isAllSelected
                  ? "bg-white border-[#456DB4]"
                  : "border-[#456DB4] bg-white"
              }`}
            >
              {isAllSelected && (
                <img
                  src={checkIcon}
                  alt="check"
                  className="w-[14px] h-[14px]"
                />
              )}
            </div>
            <span className="ml-[16px] text-[#042860] text-[18px] font-medium">
              Обрати усіх
            </span>
          </div>

          <div className="w-full max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {participants.length === 0 ? (
              <p className="text-center text-[#979AB7] py-4">
                Немає інших учасників для надання прав.
              </p>
            ) : (
              participants.map((p) => (
                <FriendItem
                  key={p.userId}
                  name={p.userName}
                  isSelected={selectedIds.includes(p.userId)}
                  variant="rights"
                  onToggle={() => handleToggle(p.userId)}
                />
              ))
            )}
          </div>

          <button
            onClick={() => onSave(selectedIds)}
            className="mt-[32px] w-[206px] h-[54px] bg-[#456DB4] text-white text-[20px] font-semibold rounded-[16px] hover:bg-[#355a9e] flex items-center justify-center"
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiveRightsModal;