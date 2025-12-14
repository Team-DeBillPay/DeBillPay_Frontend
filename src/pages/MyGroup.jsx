import React, { useState } from "react";
import iconProfile from "../assets/icons/iconProfile.png";
import DeleteFriend from "../assets/icons/trash.png";
import GroupClosed from "../assets/icons/ListGroupOff.png";
import GroupOpened from "../assets/icons/ListGroupOn.png";

const MyGroup = ({ groups, onDeleteGroup }) => {
  const [openGroups, setOpenGroups] = useState([]);

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  return (
    <>
      <div className="mt-[36px] w-full flex-1 overflow-y-auto space-y-[12px] flex flex-col items-center">
        {groups.length > 0 ? (
          groups.map((group) => {
            const isOpen = openGroups.includes(group.id);

            return (
              <div key={group.id} className="flex flex-col items-center">
                <div
                  className={`w-[382px] h-[68px] bg-[#B6CDFF] flex items-center px-5 shrink-0 cursor-pointer ${
                    isOpen ? "rounded-t-lg" : "rounded-lg"
                  }`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <img
                    src={isOpen ? GroupOpened : GroupClosed}
                    alt={isOpen ? "Opened" : "Closed"}
                    className={`${isOpen ? "w-[20px] h-[16px]" : "w-[16px] h-[20px]"}`}
                  />

                  <span className="ml-[20px] text-[14px] font-semibold text-[#021024]">
                    {group.name}
                  </span>

                  <div className="ml-auto flex items-center gap-3">
                    <img
                      src={DeleteFriend}
                      alt="Delete group"
                      className="w-[24px] h-[24px] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGroup(group);
                      }}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div className="w-[382px] bg-[#B6CDFF] rounded-b-lg flex flex-col items-center pt-2 pb-4">
                    <div className="space-y-2">
                      {group.members.map((member) => (
                        <div
                          key={member.id}
                          className="w-[338px] h-[64px] bg-[#EBF1FF] rounded-lg flex items-center px-5"
                        >
                          <img
                            src={iconProfile}
                            alt="avatar"
                            className="w-[32px] h-[32px] rounded-full"
                          />
                          <span className="ml-[20px] text-[14px] font-normal text-[#021024]">
                            {member.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="mt-[60px] flex-1 flex flex-col justify-start items-center text-center px-4">
            <p className="text-[#4B6C9A]">Поки що у Вас немає жодної групи...</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MyGroup;
