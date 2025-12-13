import React, { useState, useMemo } from "react";
import iconProfile from "../assets/icons/iconProfile.png";
import AddFriendIcon from "../assets/icons/add.png";
import DeleteFriend from "../assets/icons/trash.png";
import GroupClosed from "../assets/icons/ListGroupOff.png";
import GroupOpened from "../assets/icons/ListGroupOn.png";

const MyGroup = ({
  groups,
  currentUserId,
  allFriends, 
  onUpdateGroup, 
  onDeleteGroup,
  onDeleteMember,
}) => {
  const [openGroups, setOpenGroups] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [groupForAdding, setGroupForAdding] = useState(null);
  const [stagedMembers, setStagedMembers] = useState([]);

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleOpenAddModal = (group) => {
    setGroupForAdding(group);
    setStagedMembers(group.members);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setGroupForAdding(null);
    setStagedMembers([]);
  };

  const toggleStagedMember = (friend) => {
    const isAlreadyAdded = stagedMembers.some((m) => m.id === friend.id);
    if (!isAlreadyAdded) {
      setStagedMembers((prev) => [...prev, friend]);
    }
  };

  const handleSaveMembers = () => {
    if (groupForAdding && onUpdateGroup) {
      onUpdateGroup({ ...groupForAdding, members: stagedMembers });
    }
    handleCloseAddModal();
  };

  const availableFriendsToAdd = useMemo(() => {
    if (!groupForAdding) return [];
    return allFriends.filter(
      (friend) => !stagedMembers.some((member) => member.id === friend.id)
    );
  }, [allFriends, stagedMembers, groupForAdding]);


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
                    className={`${
                      isOpen ? "w-[20px] h-[16px]" : "w-[16px] h-[20px]"
                    }`}
                  />
                  <span className="ml-[20px] text-[14px] font-semibold text-[#021024]">
                    {group.name}
                  </span>
                  <div className="ml-auto flex items-center gap-3">
                    {isOpen && (
                      <img
                        src={AddFriendIcon}
                        alt="Add member"
                        className="w-[24px] h-[24px] cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddModal(group);
                        }}
                      />
                    )}

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
                      {group.members.map((member) => {
                        const canDelete =
                          member.id === currentUserId || group.members.length > 3;
                        return (
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
                            <img
                              src={DeleteFriend}
                              alt="Remove member"
                              className={`ml-auto w-[24px] h-[24px] ${
                                canDelete
                                  ? "cursor-pointer"
                                  : "opacity-50 cursor-not-allowed"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (canDelete) onDeleteMember(member, group);
                              }}
                            />
                          </div>
                        );
                      })}
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

      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseAddModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-[#021024] text-center font-inter">
              Додати учасника до
              <br />
              <span className="font-medium">"{groupForAdding?.name}"</span>
            </h3>
            <div className="w-[382px] h-[300px] bg-[#B6CDFF] overflow-y-auto rounded-lg p-4 space-y-2">
              {availableFriendsToAdd.length > 0 ? (
                availableFriendsToAdd.map((friend) => (
                  <div
                    key={friend.id}
                    className="w-full h-[64px] bg-[#EBF1FF] rounded-lg flex items-center px-4"
                  >
                    <img
                      src={iconProfile}
                      alt="avatar"
                      className="w-[36px] h-[36px] rounded-full"
                    />
                    <span className="ml-4 text-[14px] font-semibold text-[#021024]">
                      {friend.name}
                    </span>
                    <button
                      onClick={() => toggleStagedMember(friend)}
                      className="ml-auto px-4 py-1 bg-[#466FB7] text-white rounded-lg text-sm font-semibold hover:bg-[#355896]"
                    >
                      Додати
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-[#021024]">
                  Всі друзі вже в групі.
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleCloseAddModal}
                className="px-6 py-2 bg-[#EBF1FF] text-black rounded-lg font-semibold"
              >
                Скасувати
              </button>
              <button
                onClick={handleSaveMembers}
                className="px-6 py-2 bg-[#466FB7] text-white rounded-lg font-semibold hover:bg-[#355896]"
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyGroup;