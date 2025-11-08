import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { usersAPI } from "../api/users"; // Ваші API
// import { getIdFromJWT, getJWT } from "../utils/jwt"; // Ваші утиліти
import iconProfile from "../assets/icons/iconProfile.png";
import AddFriendIcon from "../assets/icons/add.png";
import Search from "../assets/icons/search.png";
import DeleteFriend from "../assets/icons/trash.png";
import ListClosed from "../assets/icons/closedlist.png";
import ListOpened from "../assets/icons/openedlist.png";
import ReturnBack from "../assets/icons/returnback.png";
import GroupClosed from "../assets/icons/ListGroupOff.png";
import GroupOpened from "../assets/icons/ListGroupOn.png";

// ID поточного користувача 
const MY_USER_ID = 101;
const MY_USER_NAME = "Я";

// Фіктивні дані 
const dummyFriendsData = [
  { id: 1, name: "Владислав Якубенць" },
  { id: 2, name: "Олена Коваль" },
  { id: 3, name: "Іван Петренко" },
  { id: 4, name: "Марія Якубенць" },
  { id: 5, name: "Сергій Мельник" },
  { id: 6, name: "Толя Боржник" },
];

const dummyInvitesData = [
  { id: 1, name: "Ірина Матвєєва" },
  { id: 2, name: "Ірина Датвєєва" },
];

const dummyGroupsData = [
  { 
    id: 1, 
    name: "Група Кіно", 
    members: [
      { id: MY_USER_ID, name: MY_USER_NAME },
      { id: 2, name: "Олена Коваль" }, 
      { id: 6, name: "Толя Боржник" },
    ] 
  },
  {
    id: 2,
    name: "Група Пікнік",
    members: [
      { id: MY_USER_ID, name: MY_USER_NAME },
      { id: 1, name: "Владислав Якубенць" },
      { id: 102, name: "Джонiс золото" },
      { id: 103, name: "Яся Аналітік" },
    ],
  },
  { 
    id: 3, 
    name: "Група Аквапарк", 
    members: [
      { id: MY_USER_ID, name: MY_USER_NAME },
      { id: 3, name: "Іван Петренко" },
      { id: 4, name: "Марія Якубенць" },
    ] 
  },
];


const FriendsPage = () => {
  const [friends, setFriends] = useState(dummyFriendsData);
  const [invites, setInvites] = useState(dummyInvitesData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentView, setCurrentView] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("main");
  const [groups, setGroups] = useState(dummyGroupsData);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState([]);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const showDeleteModal = !!deleteTarget;
  
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [currentGroupForAdding, setCurrentGroupForAdding] = useState(null);
  const [stagedMembers, setStagedMembers] = useState([]);
  const filteredFriends = friends.filter((friend) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    const nameLower = friend.name.toLowerCase();
    const parts = nameLower.split(' ');
    if (nameLower.startsWith(query)) return true;
    if (parts.length > 1 && parts[1].startsWith(query)) return true;
    return false;
  });

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );
  
  const friendsToAdd = useMemo(() => {
    if (!currentGroupForAdding) return [];
    return friends.filter(friend => 
      !stagedMembers.some(member => member.id === friend.id)
    );
  }, [friends, stagedMembers, currentGroupForAdding]);

  const handleDeleteClick = (friend) => {
    setDeleteTarget({ type: 'friend', data: friend });
  };
  
  const handleGroupDeleteClick = (group) => {
    setDeleteTarget({ type: 'group', data: group });
  };
  
  const handleMemberDeleteClick = (member, group) => {
    const isLeaving = member.id === MY_USER_ID;
    if (!isLeaving && group.members.length <= 3) return; 
    setDeleteTarget({ type: 'member', data: { ...member, groupId: group.id, groupName: group.name } });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    switch (deleteTarget.type) {
      case 'friend':
        setFriends(friends.filter(f => f.id !== deleteTarget.data.id));
        break;
      case 'group':
        setGroups(groups.filter(g => g.id !== deleteTarget.data.id));
        break;
      case 'member':
        if (deleteTarget.data.id === MY_USER_ID) {
          setGroups(prevGroups => prevGroups.filter(g => g.id !== deleteTarget.data.groupId));
        } else {
          setGroups(prevGroups => prevGroups.map(group => {
            if (group.id === deleteTarget.data.groupId) {
              return { ...group, members: group.members.filter(m => m.id !== deleteTarget.data.id) };
            }
            return group;
          }));
        }
        break;
      default:
        break;
    }
    setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };
  
  const getModalText = () => {
    if (!deleteTarget) return null;
    const { name, id, groupName } = deleteTarget.data;
    switch (deleteTarget.type) {
      case 'friend':
        return <>Ви впевнені, що хочете видалити <strong>{name}</strong> з друзів?</>;
      case 'group':
        return <>Ви впевнені, що хочете видалити групу <strong>{name}</strong>?</>;
      case 'member':
        if (id === MY_USER_ID) {
          return <>Ви впевнені, що хочете вийти з групи <strong>{groupName}</strong>?</>;
        }
        return <>Ви впевнені, що хочете видалити <strong>{name}</strong> з групи <strong>{groupName}</strong>?</>;
      default:
        return null;
    }
  };
  const handleAddMemberClick = (group) => {
    setCurrentGroupForAdding(group);
    setStagedMembers(group.members);
    setShowAddMemberModal(true);
  };

  const stageAddMember = (friend) => {
    setStagedMembers(prev => [...prev, friend]);
  };

  const cancelAddMember = () => {
    setShowAddMemberModal(false);
    setCurrentGroupForAdding(null);
    setStagedMembers([]);
  };
  
  const saveAddMember = () => {
    setGroups(prevGroups => prevGroups.map(group => 
      group.id === currentGroupForAdding.id 
        ? { ...group, members: stagedMembers } 
        : group
    ));
    cancelAddMember();
  };
  const handleInvite = (inviteId) => {
    setInvites(invites.filter((invite) => invite.id !== inviteId));
  };
  const selectView = (view) => {
    setCurrentView(view);
    setIsDropdownOpen(false);
  };
  const toggleGroup = (groupId) => {
    setOpenGroups(prevOpenGroups => 
      prevOpenGroups.includes(groupId)
        ? prevOpenGroups.filter(id => id !== groupId)
        : [...prevOpenGroups, groupId]
    );
  };

  return (
    <>
      <div className="bg-[#B6CDFF] w-[992px] h-[904px] mt-[44px] mr-[84px] ml-auto mb-[76px] rounded-3xl flex flex-row justify-center gap-[28px] p-[28px]">
        
        <div className="bg-white w-[454px] h-[848px] rounded-2xl relative flex flex-col">
          
          {viewMode === "main" ? (
            <>
              <div className="pt-[28px] flex flex-col items-center">
                <div className="w-[382px] relative z-20 flex justify-center">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <h2 className="text-[32px] text-[#021024] font-semibold">
                      {currentView === "friends" ? "Мої друзі" : "Мої групи"}
                    </h2>
                    <img src={isDropdownOpen ? ListOpened : ListClosed} alt="dropdown" className="w-[24px] h-[16px]"/>
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                      <button onClick={() => selectView("friends")} className="block w-full text-left px-4 py-2 text-sm text-[#021024] hover:bg-gray-100 rounded-t-lg">
                        Мої друзі
                      </button>
                      <button onClick={() => selectView("groups")} className="block w-full text-left px-4 py-2 text-sm text-[#021024] hover:bg-gray-100 rounded-b-lg">
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
                    if (currentView === 'friends') {
                      setViewMode("add");
                    } else {
                      // TODO: Логіка "Створити групу"
                    }
                  }} 
                />
                
                <div className="relative mt-[24px] z-10">
                  <input
                    type="text"
                    placeholder={currentView === 'friends' ? 'Знайти друга' : 'Знайти групу'}
                    className="w-[382px] h-[38px] border border-[#7B9CCA] rounded-lg pl-4 pr-10 placeholder-gray-500 text-sm text-[#1C304B]"
                    value={currentView === 'friends' ? searchQuery : groupSearchQuery}
                    onChange={(e) => {
                      if (currentView === 'friends') {
                        setSearchQuery(e.target.value);
                      } else {
                        setGroupSearchQuery(e.target.value);
                      }
                    }}
                  />
                  <img src={Search} alt="Пошук" className="absolute right-3 top-1/2 -translate-y-1/2 w-[20px] h-[20px] cursor-pointer"/>
                </div>
              </div>

              {currentView === "friends" ? (
                <div className="mt-[36px] w-full flex-1 overflow-y-auto space-y-[12px] flex flex-col items-center">
                  {filteredFriends.length > 0 ? (
                    filteredFriends.map((friend) => (
                      <div key={friend.id} className="w-[382px] h-[68px] bg-[#B6CDFF] rounded-lg flex items-center px-5 shrink-0">
                        <img src={iconProfile} alt="avatar" className="w-[36px] h-[36px] rounded-full"/>
                        <span className="ml-[20px] text-[14px] font-semibold text-[#021024]">{friend.name}</span>
                        <img src={DeleteFriend} alt="Видалити" className="ml-auto w-[24px] h-[24px] cursor-pointer" onClick={() => handleDeleteClick(friend)}/>
                      </div>
                    ))
                  ) : (
                    <div className="mt-[60px] flex-1 flex flex-col justify-start items-center text-center px-4">
                      <p className="text-[#4B6C9A]">Поки що у Вас немає жодного друга...</p>
                      <button onClick={() => setViewMode("add")} className="text-[#4B6C9A] underline hover:text-[#456DB4]">
                        Додати друга
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-[36px] w-full flex-1 overflow-y-auto space-y-[12px] flex flex-col items-center">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => {
                      const isOpen = openGroups.includes(group.id);
                      return (
                        <div key={group.id} className="flex flex-col items-center">
                          <div 
                            className={`w-[382px] h-[68px] bg-[#B6CDFF] flex items-center px-5 shrink-0 cursor-pointer ${isOpen ? 'rounded-t-lg' : 'rounded-lg'}`} 
                            onClick={() => toggleGroup(group.id)}
                          >
                            <img
                                  src={isOpen ? GroupOpened : GroupClosed}
                                  alt={isOpen ? "Opened" : "Closed"}
                                  className={`${isOpen ? "w-[20px] h-[16px]" : "w-[16px] h-[20px]"}`}
                            />
                            <span className="ml-[20px] text-[14px] font-semibold text-[#021024]">{group.name}</span>
                            <div className="ml-auto flex items-center gap-3">                           
                              {isOpen && (
                                <img 
                                  src={AddFriendIcon} 
                                  alt="Add member" 
                                  className="w-[24px] h-[24px] cursor-pointer" 
                                  onClick={(e) => { e.stopPropagation(); handleAddMemberClick(group); }}
                                />
                              )}

                              <img 
                                src={DeleteFriend} 
                                alt="Delete group" 
                                className="w-[24px] h-[24px] cursor-pointer" 
                                onClick={(e) => { e.stopPropagation(); handleGroupDeleteClick(group); }}
                              />
                            </div>
                          </div>
                          
                          {isOpen && (
                            <div className="w-[382px] bg-[#B6CDFF] rounded-b-lg flex flex-col items-center pt-2 pb-4">
                              <div className="space-y-2">
                                {group.members.map((member) => {
                                  const canDelete = member.id === MY_USER_ID || group.members.length > 3;
                                  return (
                                    <div key={member.id} className="w-[338px] h-[64px] bg-[#EBF1FF] rounded-lg flex items-center px-5">
                                      <img src={iconProfile} alt="avatar" className="w-[32px] h-[32px] rounded-full"/>
                                      <span className="ml-[20px] text-[14px] font-normal text-[#021024]">{member.name}</span>
                                      <img
                                        src={DeleteFriend}
                                        alt="Remove member"
                                        className={`ml-auto w-[24px] h-[24px] ${canDelete ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                        onClick={(e) => { e.stopPropagation(); if (canDelete) handleMemberDeleteClick(member, group); }}
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
                      <p className="text-[#4B6C9A]">Створити групу</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center pl-[55px] pt-[29px]">
                <img src={ReturnBack} alt="Back" className="w-[32px] h-[32px] cursor-pointer" onClick={() => setViewMode("main")}/>
                <h2 className="text-[28px] text-[#021024] font-semibold ml-[16px]">Додати нового друга</h2>
              </div>
              <p className="text-[#4B6C9A] text-sm text-center mt-[28px]">Шукайте нових друзів<br />за номером телефону або електронною поштою</p>
              <div className="relative mt-[16px] self-center">
                <input type="text" placeholder="Знайти нового друга" className="w-[382px] h-[38px] border border-[#7B6CCA] rounded-lg pl-4 pr-10 placeholder-gray-500 text-sm text-[#1C304B]"/>
                <img src={Search} alt="Пошук" className="absolute right-3 top-1/2 -translate-y-1/2 w-[20px] h-[20px] cursor-pointer"/>
              </div>
            </>
          )}
        </div>
        <div className="bg-white w-[454px] h-[848px] rounded-2xl pt-[28px] flex flex-col items-center">
          <h2 className="w-[382px] text-[32px] text-[#021024] font-semibold">Мої запрошення</h2>
          {invites.length > 0 ? (
            <div className="mt-[24px] space-y-[20px]">
              {invites.map((invite) => (
                <div key={invite.id} className="w-[382px] h-[138px] bg-[#456DB4] rounded-lg p-[20px] relative">
                  <div className="flex items-start">
                    <img src={iconProfile} alt="avatar" className="w-[40px] h-[40px] rounded-full"/>
                    <div className="flex flex-col ml-[20px] text-left">
                      <span className="text-[16px] text-white font-semibold">{invite.name}</span>
                      <span className="text-[14px] text-[#D7E7FF] font-normal mt-[1px]">хоче бути вашим другом</span>
                    </div>
                  </div>
                  <div className="absolute bottom-[20px] right-[20px] flex gap-[12px]">
                    <button onClick={() => handleInvite(invite.id)} className="w-[116px] h-[38px] bg-[#B6CDFF] text-[#042860] rounded-lg font-semibold text-sm">Прийняти</button>
                    <button onClick={() => handleInvite(invite.id)} className="w-[116px] h-[38px] bg-[#B6CDFF] text-[#042860] rounded-lg font-semibold text-sm">Відхилити</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-[122px] flex flex-col items-center text-center">
              <p className="text-[#4B6C9A] text-lg">Поки що у Вас<br />немає запрошень...</p>
            </div>
          )}
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-4 text-[#021024]">Підтвердити видалення</h3>
            <p className="text-[#021024] min-w-[300px]">{getModalText()}</p>
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={cancelDelete} className="px-6 py-2 bg-[#466FB7] text-white rounded-lg font-semibold">Скасувати</button>
              <button onClick={confirmDelete} className="px-6 py-2 bg-[#466FB7] text-white rounded-lg font-semibold">Видалити</button>
            </div>
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelAddMember}>
          <div className="bg-white p-6 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4 text-[#021024] text-center font-inter">
                Додати учасника до
                <br />
                <span className="font-medium">"{currentGroupForAdding?.name}"</span>
              </h3>  
            <div className="w-[382px] h-[300px] bg-[#B6CDFF] overflow-y-auto rounded-lg p-4 space-y-2">
              {friendsToAdd.length > 0 ? (
                friendsToAdd.map(friend => (
                  <div key={friend.id} className="w-full h-[64px] bg-[#EBF1FF] rounded-lg flex items-center px-4">
                    <img src={iconProfile} alt="avatar" className="w-[36px] h-[36px] rounded-full"/>
                    <span className="ml-4 text-[14px] font-semibold text-[#021024]">{friend.name}</span>
                    <button 
                      onClick={() => stageAddMember(friend)}
                      className="ml-auto px-4 py-1 bg-[#466FB7] text-white rounded-lg text-sm font-semibold"
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
                onClick={cancelAddMember}
                className="px-6 py-2 bg-[#EBF1FF] text-black rounded-lg font-semibold"
              >
                Скасувати
              </button>
              <button
                onClick={saveAddMember}
                className="px-6 py-2 bg-[#466FB7] text-white rounded-lg font-semibold"
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

export default FriendsPage;