import React from "react";
import iconProfile from "../../assets/icons/iconProfile.png";
import addIcon from "../../assets/icons/add.png";
import checkIcon from "../../assets/icons/checkIcon.png";
import crossIcon from "../../assets/icons/add.png";

const FriendItem = ({ avatar, name, isSelected, variant, onToggle }) => {
  return (
    <div className="bg-[#B6CDFF] py-[16px] px-[24px] rounded-[16px] flex items-center justify-between w-full mb-[16px] last:mb-0">
      <div className="flex items-center">
        <img
          src={avatar || iconProfile}
          alt={name}
          className="w-[36px] h-[36px] rounded-full object-cover"
        />
        <span className="ml-[20px] text-[#042860] text-[18px] font-medium truncate max-w-[180px]">
          {name}
        </span>
      </div>

      <div onClick={onToggle} className="cursor-pointer">
        {variant === "rights" ? (
          <div className="w-[65px] h-[24px] bg-[#7EAEF4] border border-[#466FB7] rounded-[4px] flex overflow-hidden">
            <div
              className={`w-[33px] h-full flex items-center justify-center transition-all
      ${
        !isSelected
          ? "bg-[#EDF3FF] border border-[#466FB7] rounded-[4px]"
          : "bg-transparent"
      }
    `}
            >
              <img
                src={crossIcon}
                alt="Cross"
                className={`w-[12px] h-[12px] rotate-45
        ${!isSelected ? "opacity-100" : "opacity-40"}
      `}
              />
            </div>

            <div
              className={`w-[32px] h-full flex items-center justify-center transition-all
      ${
        isSelected
          ? "bg-[#EDF3FF] border border-[#466FB7] rounded-[4px]"
          : "bg-[#7EAEF4]"
      }
    `}
            >
              <img
                src={checkIcon}
                alt="Check"
                className={`w-[12px] h-[12px]
        ${isSelected ? "opacity-100" : "opacity-40"}
      `}
              />
            </div>
          </div>
        ) : (
          <div
            className={`w-[24px] h-[24px] flex items-center justify-center rounded-full border ${
              isSelected
                ? "border-[#466FB7] bg-[#EDF3FF]"
                : "border-[#466FB7] bg-white"
            }`}
          >
            {isSelected ? (
              <img src={checkIcon} alt="Check" className="w-[14px] h-[14px]" />
            ) : (
              <img src={addIcon} alt="Add" className="w-[14px] h-[14px]" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendItem;