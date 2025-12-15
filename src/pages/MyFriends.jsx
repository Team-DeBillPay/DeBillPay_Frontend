import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { contactsAPI } from "../api/contacts";
import { groupsAPI } from "../api/groups";
import { getIdFromJWT } from "../utils/jwt";
import MyGroup from "./MyGroup";

import iconProfile from "../assets/icons/iconProfile.png";
import AddFriendIcon from "../assets/icons/add.png";
import Search from "../assets/icons/search.png";
import DeleteFriend from "../assets/icons/trash.png";
import ListClosed from "../assets/icons/closedlist.png";
import ListOpened from "../assets/icons/openedlist.png";
import ReturnBack from "../assets/icons/returnback.png";
import CheckIcon from "../assets/icons/checkIcon.png";

const MY_USER_ID = getIdFromJWT();

const MyFriends = () => {
  const location = useLocation();

  const [friends, setFriends] = useState([]);
  const [invites, setInvites] = useState([]);
  const [groups, setGroups] = useState([]);

  const [currentView, setCurrentView] = useState("friends");
  const [viewMode, setViewMode] = useState("main");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [groupSearchQuery, setGroupSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const showDeleteModal = !!deleteTarget;

  const [newGroupName, setNewGroupName] = useState("");
  const [selectedForGroup, setSelectedForGroup] = useState([]);
  const [createError, setCreateError] = useState("");

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const normalizeFriends = (contacts) => {
    return (contacts || []).map((contact) => {
      const friendData = contact.friend || contact;

      const id = friendData.userId || friendData.id || contact.contactId;
      const firstName = friendData.firstName || "";
      const lastName = friendData.lastName || "";
      const email = friendData.email || contact.email || "";

      const name =
        `${firstName} ${lastName}`.trim() ||
        friendData.name ||
        contact.name ||
        "Користувач";

      return { id, name, email };
    });
  };

  const normalizeInvites = (invitations) => {
    return (invitations || []).map((invite) => {
      const sender = invite.sender || {};

      const firstName =
        sender.firstName ??
        invite.firstName ??
        invite.senderFirstName ??
        "";
      const lastName =
        sender.lastName ??
        invite.lastName ??
        invite.senderLastName ??
        "";

      const name = `${firstName} ${lastName}`.trim() || "Користувач";

      return {
        id: invite.invitationId || invite.id,
        senderId: sender.userId || invite.senderId || invite.senderUserId,
        name,
      };
    });
  };

  const normalizeGroups = (apiGroups) => {
    return (apiGroups || []).map((g) => ({
      id: g.groupId,
      name: g.name,
      members: (g.members || []).map((m) => ({
        id: m.userId,
        name: `${m.firstName || ""} ${m.lastName || ""}`.trim(),
        email: m.email,
        phoneNumber: m.phoneNumber,
      })),
    }));
  };

  const reloadFriends = async () => {
    const contacts = await contactsAPI.getContacts();
    setFriends(normalizeFriends(contacts));
  };

  const reloadInvites = async () => {
    const invitations = await contactsAPI.getInvitations();
    setInvites(normalizeInvites(invitations));
  };

  const reloadGroups = async () => {
    const apiGroups = await groupsAPI.getGroups();
    setGroups(normalizeGroups(apiGroups));
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([reloadFriends(), reloadInvites(), reloadGroups()]);
      } catch (e) {
        console.error(e);
        setFriends([]);
        setInvites([]);
        setGroups([]);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (location.state?.openGroups) {
      setCurrentView("groups");
      setIsDropdownOpen(false);
    }
  }, [location.state]);

  const handleSearchNewFriends = async () => {
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const results = await contactsAPI.searchNewContact(q);

      const list = Array.isArray(results) ? results : results ? [results] : [];

      const normalized = list.map((u) => ({
        userId: u.userId ?? u.id,
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
        email: u.email ?? "",
        phoneNumber: u.phoneNumber ?? "",
      }));

      setSearchResults(normalized);
    } catch (error) {
      console.error("Помилка пошуку:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendInvite = async (userId) => {
    try {
      await contactsAPI.sendInvite(userId);
      setSearchResults((prev) => prev.filter((u) => u.userId !== userId));
      await reloadInvites();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      await contactsAPI.acceptInvite(inviteId);
      await Promise.all([reloadFriends(), reloadInvites()]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      await contactsAPI.rejectInvite(inviteId);
      await reloadInvites();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartCreateGroup = () => {
    setViewMode("createGroup");
    setNewGroupName("");
    setSelectedForGroup([]);
    setCreateError("");
    setIsCreatingGroup(false);
  };

  const handleCancelCreateGroup = () => {
    setViewMode("main");
    setNewGroupName("");
    setSelectedForGroup([]);
    setCreateError("");
    setIsCreatingGroup(false);
  };

  const toggleGroupMemberSelection = (friend) => {
    if (createError) setCreateError("");

    if (selectedForGroup.some((f) => f.id === friend.id)) {
      setSelectedForGroup((prev) => prev.filter((f) => f.id !== friend.id));
    } else {
      setSelectedForGroup((prev) => [...prev, friend]);
    }
  };

  const handleCreateGroup = async () => {
    if (isCreatingGroup) return;

    setCreateError("");

    if (!newGroupName.trim()) {
      setCreateError("Будь ласка, введіть назву групи");
      return;
    }
    if (selectedForGroup.length < 2) {
      setCreateError("Група має складатися мінімум з 2 учасників (окрім Вас)");
      return;
    }

    setIsCreatingGroup(true);
    try {
      const friendIds = selectedForGroup
        .map((f) => Number(f.id))
        .filter((x) => Number.isFinite(x) && x > 0);

      await groupsAPI.createGroup(newGroupName.trim(), friendIds);
      await reloadGroups();

      handleCancelCreateGroup();
      setCurrentView("groups");
    } catch (e) {
      console.error(e);
      setCreateError(e.message || "Помилка створення групи");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleDeleteClick = (friend) =>
    setDeleteTarget({ type: "friend", data: friend });

  const handleGroupDeleteClick = (group) =>
    setDeleteTarget({ type: "group", data: group });

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const { type, data } = deleteTarget;

    try {
      if (type === "friend") {
        await contactsAPI.deleteContact(data.id);
        await reloadFriends();
      } else if (type === "group") {
        await groupsAPI.deleteGroup(data.id);
        setGroups((prev) => prev.filter((g) => g.id !== data.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => setDeleteTarget(null);

  const getModalText = () => {
    if (!deleteTarget) return null;

    const { name } = deleteTarget.data;

    switch (deleteTarget.type) {
      case "friend":
        return (
          <>
            Ви впевнені, що хочете видалити <strong>{name}</strong> з друзів?
          </>
        );
      case "group":
        return (
          <>
            Ви впевнені, що хочете видалити групу <strong>{name}</strong>?
          </>
        );
      default:
        return null;
    }
  };

  const filteredFriends = friends.filter((friend) => {
    const query = searchQuery.toLowerCase();
    return !query || friend.name.toLowerCase().includes(query);
  });

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  const selectView = (view) => {
    setCurrentView(view);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="bg-[#B6CDFF] w-[992px] h-[904px] mt-[20px] mb-[20px] mx-auto rounded-[32px] flex flex-row justify-center gap-[28px] p-[28px]">
        <div className="bg-white w-[454px] h-[848px] rounded-2xl relative flex flex-col">
          {viewMode === "createGroup" ? (
            <>
              <h2 className="text-[32px] text-[#021024] font-semibold text-center mt-[28px] leading-tight mx-auto w-[382px]">
                Список друзів,
                <br />
                яких Ви можете
                <br />
                додати до групи
              </h2>

              <div className="mt-[32px] w-full flex-1 overflow-y-auto space-y-[12px] flex flex-col items-center">
                {friends.map((friend) => {
                  const isSelected = selectedForGroup.some(
                    (f) => f.id === friend.id
                  );

                  return (
                    <div
                      key={friend.id}
                      className="w-[382px] h-[68px] bg-[#B6CDFF] rounded-lg flex items-center px-5 shrink-0 cursor-pointer transition-colors hover:bg-[#A3C0FC]"
                      onClick={() => toggleGroupMemberSelection(friend)}
                    >
                      <img
                        src={iconProfile}
                        alt="avatar"
                        className="w-[36px] h-[36px] rounded-full"
                      />
                      <span className="ml-[20px] text-[14px] font-semibold text-[#021024]">
                        {friend.name}
                      </span>

                      {isSelected ? (
                        <img
                          src={CheckIcon}
                          alt="Selected"
                          className="ml-auto w-[20px] h-[20px]"
                        />
                      ) : (
                        <img
                          src={AddFriendIcon}
                          alt="Add"
                          className="ml-auto w-[20px] h-[20px]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : viewMode === "main" ? (
            <>
              <div className="pt-[28px] flex flex-col items-center">
                <div className="w-[382px] relative z-20 flex justify-center">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <h2 className="text-[32px] text-[#021024] font-semibold">
                      {currentView === "friends" ? "Мої друзі" : "Мої групи"}
                    </h2>
                    <img
                      src={isDropdownOpen ? ListOpened : ListClosed}
                      alt="dropdown"
                      className="w-[24px] h-[16px]"
                    />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => selectView("friends")}
                        className="block w-full text-left px-4 py-2 text-sm text-[#021024] hover:bg-gray-100 rounded-t-lg"
                      >
                        Мої друзі
                      </button>
                      <button
                        onClick={() => selectView("groups")}
                        className="block w-full text-left px-4 py-2 text-sm text-[#021024] hover:bg-gray-100 rounded-b-lg"
                      >
                        Мої групи
                      </button>
                    </div>
                  )}
                </div>

                <img
                  src={AddFriendIcon}
                  alt="Додати"
                  className="absolute top-[34px] right-[36px] w-[28px] h-[28px] cursor-pointer z-50"
                  onClick={() => {
                    if (currentView === "friends") {
                      setViewMode("add");
                      setSearchResults([]);
                      setIsSearching(false);
                    } else {
                      handleStartCreateGroup();
                    }
                  }}
                />

                <div className="relative mt-[24px] z-10">
                  <input
                    type="text"
                    placeholder={
                      currentView === "friends" ? "Знайти друга" : "Знайти групу"
                    }
                    className="w-[382px] h-[38px] border border-[#7B9CCA] rounded-lg pl-4 pr-10 placeholder-gray-500 text-sm text-[#1C304B]"
                    value={
                      currentView === "friends" ? searchQuery : groupSearchQuery
                    }
                    onChange={(e) => {
                      if (currentView === "friends") setSearchQuery(e.target.value);
                      else setGroupSearchQuery(e.target.value);
                    }}
                  />
                  <img
                    src={Search}
                    alt="Пошук"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-[20px] h-[20px] cursor-pointer"
                  />
                </div>
              </div>

              {currentView === "friends" ? (
                <div className="mt-[36px] w-full flex-1 overflow-y-auto space-y-[12px] flex flex-col items-center">
                  {filteredFriends.length > 0 ? (
                    filteredFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="w-[382px] h-[68px] bg-[#B6CDFF] rounded-lg flex items-center px-5 shrink-0"
                      >
                        <img
                          src={iconProfile}
                          alt="avatar"
                          className="w-[36px] h-[36px] rounded-full"
                        />
                        <span className="ml-[20px] text-[14px] font-semibold text-[#021024]">
                          {friend.name}
                        </span>
                        <img
                          src={DeleteFriend}
                          alt="Видалити"
                          className="ml-auto w-[24px] h-[24px] cursor-pointer"
                          onClick={() => handleDeleteClick(friend)}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="mt-[60px] flex-1 flex flex-col justify-start items-center text-center px-4">
                      <p className="text-[#4B6C9A]">
                        Поки що у Вас немає жодного друга...
                      </p>
                      <button
                        onClick={() => {
                          setViewMode("add");
                          setSearchResults([]);
                          setSearchQuery("");
                        }}
                        className="text-[#4B6C9A] underline hover:text-[#456DB4]"
                      >
                        Додати друга
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <MyGroup groups={filteredGroups} onDeleteGroup={handleGroupDeleteClick} />
              )}
            </>
          ) : (
            <>
              <div className="flex items-center pl-[55px] pt-[29px]">
                <img
                  src={ReturnBack}
                  alt="Back"
                  className="w-[32px] h-[32px] cursor-pointer"
                  onClick={() => {
                    setViewMode("main");
                    setSearchResults([]);
                    setSearchQuery("");
                  }}
                />
                <h2 className="text-[28px] text-[#021024] font-semibold ml-[16px]">
                  Додати нового друга
                </h2>
              </div>
              <p className="text-[#4B6C9A] text-sm text-center mt-[28px]">
                Шукайте нових друзів
                <br />
                за номером телефону або електронною поштою
              </p>
              <div className="relative mt-[16px] self-center">
                <input
                  type="text"
                  placeholder="Знайти нового друга"
                  className="w-[382px] h-[38px] border border-[#7B6CCA] rounded-lg pl-4 pr-10 placeholder-gray-500 text-sm text-[#1C304B]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSearchNewFriends();
                  }}
                />
                <img
                  src={Search}
                  alt="Пошук"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-[20px] h-[20px] cursor-pointer"
                  onClick={handleSearchNewFriends}
                />
              </div>

              <div className="mt-[36px] w-full flex-1 overflow-y-auto space-y-[12px] flex flex-col items-center">
                {isSearching ? (
                  <div className="text-[#4B6C9A]">Пошук...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user.userId}
                      className="w-[382px] h-[68px] bg-[#B6CDFF] rounded-lg flex items-center px-5 shrink-0"
                    >
                      <img
                        src={iconProfile}
                        alt="avatar"
                        className="w-[36px] h-[36px] rounded-full"
                      />
                      <div className="ml-[20px] flex flex-col">
                        <span className="text-[14px] font-semibold text-[#021024]">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-[12px] text-[#4B6C9A]">
                          {user.email || user.phoneNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSendInvite(user.userId)}
                        className="ml-auto px-4 py-1 bg-[#466FB7] text-white rounded-lg text-sm font-semibold"
                      >
                        Додати
                      </button>
                    </div>
                  ))
                ) : searchQuery ? (
                  <div className="text-[#4B6C9A] mt-4">
                    Користувачів не знайдено
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>

        <div className="bg-white w-[454px] h-[848px] rounded-2xl flex flex-col items-center relative">
          {viewMode === "createGroup" ? (
            <>
              <h2 className="w-[382px] text-[32px] text-[#021024] font-semibold text-center mt-[28px]">
                Створення групи
              </h2>

              <div className="w-[382px] mt-[32px] flex flex-col">
                <label className="text-left text-[16px] text-[#021024] mb-[4px] font-normal pl-1">
                  Введіть назву групи
                </label>
                <input
                  type="text"
                  placeholder="Назва групи"
                  className="w-[382px] h-[38px] border border-[#7B9CCA] rounded-lg px-4 text-sm text-[#1C304B]"
                  value={newGroupName}
                  onChange={(e) => {
                    setNewGroupName(e.target.value);
                    if (createError) setCreateError("");
                  }}
                />
              </div>

              <div className="w-[382px] mt-[32px] flex flex-col flex-1">
                <span className="text-left text-[16px] text-[#021024] mb-[8px] pl-1">
                  Оберіть учасників групи зі списку
                </span>

                <div className="w-full flex-1 overflow-y-auto space-y-[12px] pb-4">
                  {selectedForGroup.length > 0 ? (
                    selectedForGroup.map((friend) => (
                      <div
                        key={friend.id}
                        className="w-[382px] h-[68px] bg-[#B6CDFF] rounded-lg flex items-center px-5 shrink-0"
                      >
                        <img
                          src={iconProfile}
                          alt="avatar"
                          className="w-[36px] h-[36px] rounded-full"
                        />
                        <span className="ml-[20px] text-[14px] font-semibold text-[#021024]">
                          {friend.name}
                        </span>

                        <img
                          src={AddFriendIcon}
                          alt="Remove"
                          className="ml-auto w-[20px] h-[20px] cursor-pointer transform rotate-45"
                          onClick={() => toggleGroupMemberSelection(friend)}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-[382px] h-[101px] bg-[#B6CDFF] rounded-[4px] mt-[32px] flex items-center justify-center text-center px-4 shrink-0 mx-auto">
                      <span className="text-[16px] text-[#4B6C9A] font-normal leading-tight">
                        Оберіть щонайменше двох учасників для створення групи
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {createError && (
                <div className="text-[#FF4B4B] text-sm mb-2 font-medium">
                  {createError}
                </div>
              )}

              <div className="flex gap-[24px] mb-[44px] mt-2">
                <button
                  onClick={handleCreateGroup}
                  disabled={isCreatingGroup}
                  className={`w-[180px] h-[62px] bg-[#456DB4] text-white text-[18px] font-semibold rounded-[16px] transition
                    ${
                      isCreatingGroup
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-[#365995]"
                    }`}
                >
                  {isCreatingGroup ? "Створення..." : "Створити"}
                </button>

                <button
                  onClick={handleCancelCreateGroup}
                  className="w-[180px] h-[62px] bg-[#456DB4] text-white text-[18px] rounded-[16px] font-semibold hover:bg-[#365995] transition"
                >
                  Скасувати
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="w-[382px] text-[32px] text-[#021024] font-semibold text-center mt-[28px]">
                Мої запрошення
              </h2>

              {invites.length > 0 ? (
                <div className="mt-[24px] space-y-[20px]">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="w-[382px] h-[138px] bg-[#456DB4] rounded-lg p-[20px] relative"
                    >
                      <div className="flex items-start">
                        <img
                          src={iconProfile}
                          alt="avatar"
                          className="w-[40px] h-[40px] rounded-full"
                        />
                        <div className="flex flex-col ml-[20px] text-left">
                          <span className="text-[16px] text-white font-semibold">
                            {invite.name}
                          </span>
                          <span className="text-[14px] text-[#D7E7FF] font-normal mt-[1px]">
                            хоче бути вашим другом
                          </span>
                        </div>
                      </div>

                      <div className="absolute bottom-[20px] right-[20px] flex gap-[12px]">
                        <button
                          onClick={() => handleAcceptInvite(invite.id)}
                          className="w-[116px] h-[38px] bg-[#B6CDFF] text-[#042860] rounded-lg font-semibold text-sm"
                        >
                          Прийняти
                        </button>
                        <button
                          onClick={() => handleRejectInvite(invite.id)}
                          className="w-[116px] h-[38px] bg-[#B6CDFF] text-[#042860] rounded-lg font-semibold text-sm"
                        >
                          Відхилити
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-[122px] flex flex-col items-center text-center">
                  <p className="text-[#4B6C9A] text-lg">
                    Поки що у Вас
                    <br />
                    немає запрошень...
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-4 text-[#021024]">
              Підтвердити видалення
            </h3>

            <p className="text-[#021024] min-w-[300px] mb-6">{getModalText()}</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDelete}
                className="px-6 py-2 bg-[#466FB7] text-white rounded-lg font-semibold"
              >
                Скасувати
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-[#466FB7] text-white rounded-lg font-semibold"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyFriends;
