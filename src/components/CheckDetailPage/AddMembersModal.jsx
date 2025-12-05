import React, { useState, useEffect } from "react";
import { contactsAPI } from "../../api/contacts";
import FriendItem from "./FriendItem";
import iconProfile from "../../assets/icons/iconProfile.png";

const AddMembersModal = ({ isOpen, onClose, currentParticipants, onAdd }) => {
  const [friends, setFriends] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadFriends = async () => {
        setLoading(true);
        try {
          const contacts = await contactsAPI.getContacts();

          const friendsList = contacts.map((contact) => {

            const friendData = contact.friend || contact;
            const userId = friendData.userId || friendData.id || contact.contactId;
            const firstName = friendData.firstName || friendData.name || "";
            const lastName = friendData.lastName || "";
            
            const friendInfo = {
              id: userId,
              name: `${firstName} ${lastName}`.trim() || `User ${userId}`,
              avatar: iconProfile,
              rawData: friendData
            };
            
            return friendInfo;
          });

          const currentIds = currentParticipants.map((p) => p.userId);
          
          const availableFriends = friendsList.filter(
            (f) => !currentIds.includes(f.id)
          );

          setFriends(availableFriends);
        } catch (error) {
          console.error("Помилка завантаження друзів:", error);
        } finally {
          setLoading(false);
        }
      };
      loadFriends();
      setSelectedIds([]);
    }
  }, [isOpen, currentParticipants]);

  const handleToggle = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAdd = async () => {
    if (selectedIds.length === 0) return;

    try {
      setAddLoading(true);

      await onAdd(selectedIds);
    } catch (error) {
      console.error("Помилка при додаванні:", error);
    } finally {
      setAddLoading(false);
    }
  };


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
          <h3 className="text-[20px] text-[#021024] font-bold w-[200px]">
            Оберіть друзів, яких хочете додати до чеку
          </h3>
        </div>

        <div className="w-full px-[32px] pt-[32px] pb-[40px] flex flex-col items-center">
          {loading ? (
            <p className="text-[#042860] my-10">Завантаження друзів...</p>
          ) : friends.length === 0 ? (
            <p className="text-[#979AB7] my-10 text-center">
              Усі ваші друзі вже додані до чеку або список порожній.
            </p>
          ) : (
            <>
              <div className="w-full max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {friends.map((friend) => (
                  <FriendItem
                    key={friend.id}
                    name={friend.name}
                    avatar={friend.avatar}
                    isSelected={selectedIds.includes(friend.id)}
                    variant="add"
                    onToggle={() => handleToggle(friend.id)}
                  />
                ))}
              </div>
            </>
          )}

          <button
            onClick={handleAdd}
            disabled={selectedIds.length === 0 || addLoading}
            className="mt-[32px] w-[206px] h-[54px] bg-[#456DB4] text-white text-[20px] font-semibold rounded-[16px] hover:bg-[#355a9e] flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {addLoading ? "Додавання..." : "Додати"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMembersModal;