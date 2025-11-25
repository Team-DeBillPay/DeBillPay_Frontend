import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import iconProfile from "../assets/icons/iconProfile.png";
import returnBackIcon from "../assets/icons/returnback.png";
import commentsIcon from "../assets/icons/commentsIcon.png";
import historyIcon from "../assets/icons/historyIcon.png";
import settingsIcon from "../assets/icons/settingsIcon.png";
import addIcon from "../assets/icons/add.png";
import deleteIcon from "../assets/icons/trash.png";
import checkIcon from "../assets/icons/checkIcon.png";
import crossIcon from "../assets/icons/add.png";
import { checksAPI } from "../api/checks";
import { usersAPI } from "../api/users";
import { contactsAPI } from "../api/contacts";
import { getIdFromJWT } from "../utils/jwt";

// --- ДОПОМІЖНІ ФУНКЦІЇ ---

const calculateCheckStatus = (check) => {
  const { scenario, participants } = check;

  let participantsToCheck = participants;

  if (scenario === "рівний розподіл" || scenario === "індивідуальні суми") {
    participantsToCheck = participants.filter((p) => !p.isAdminRights);
  }

  let hasAnyPayment = false;
  let allFullyPaid = true;

  participantsToCheck.forEach((participant) => {
    const balance = participant.balance || 0;
    const assignedAmount = participant.assignedAmount || 0;

    if (balance > 0) {
      hasAnyPayment = true;
    }

    if (balance < assignedAmount) {
      allFullyPaid = false;
    }
  });

  let status;
  if (allFullyPaid && hasAnyPayment) {
    status = "погашений";
  } else if (hasAnyPayment) {
    status = "частково погашений";
  } else {
    status = "непогашений";
  }

  return status;
};

// --- КОМПОНЕНТ FRIEND ITEM ---

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
          // Варіант для прав: Перемикач (Хрестик | Галочка)
          <div className="w-[65px] h-[24px] bg-[#7EAEF4] border border-[#466FB7] rounded-[4px] flex overflow-hidden">
            {/* Хрестик — НЕ вибрано */}
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

            {/* Галочка — ВИБРАНО */}
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
          // Варіант для додавання: Плюсик або Галочка
          <div
            className={`w-[24px] h-[24px] flex items-center justify-center rounded-full border ${
              isSelected
                ? "border-[#466FB7] bg-[#EDF3FF]"
                : "border-[#466FB7] bg-white"
            }`}
            onClick={() => setIsSelected(!isSelected)}
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

// --- КОМПОНЕНТИ МОДАЛОК ---

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[4px] p-8 flex flex-col items-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[24px] text-[#021024] font-bold mb-8 text-center max-w-[300px]">
          Ви впевнені, що хочете видалити чек?
        </h3>
        <div className="flex gap-5">
          <button
            onClick={onConfirm}
            className="bg-[#456DB4] text-white text-[20px] font-semibold py-3 px-10 rounded-[16px] hover:bg-[#d63f56]"
          >
            Так
          </button>
          <button
            onClick={onClose}
            className="bg-[#B6CDFF] text-[#042860] text-[20px] font-semibold py-3 px-10 rounded-[16px] hover:bg-[#a4c0ff]"
          >
            Ні
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsMenu = ({ isOpen, onClose, onAction }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>

      <div className="absolute top-[110%] right-0 bg-white rounded-[8px] shadow-xl z-50 overflow-hidden w-max">
        {/* Заголовок меню */}
        <div className="bg-[#B6CDFF] py-[16px] px-[48px]">
          <p className="text-[20px] text-[#021024] font-bold whitespace-nowrap">
            Налаштування чеку
          </p>
        </div>

        {/* Опції */}
        <div className="flex flex-col">
          <button
            onClick={() => onAction("edit")}
            className="py-[20px] px-[20px] text-[18px] text-[#042860] font-medium hover:bg-gray-50 transition-colors"
          >
            Редагувати чек
          </button>

          {/* Лінія-розділювач */}
          <div className="h-[1px] bg-[#D1D4E8] mx-[20px]"></div>

          <button
            onClick={() => onAction("permissions")}
            className="py-[20px] px-[20px] text-[18px] text-[#042860] font-medium hover:bg-gray-50 transition-colors"
          >
            Надати права учасникам
          </button>

          {/* Лінія-розділювач */}
          <div className="h-[1px] bg-[#D1D4E8] mx-[20px]"></div>

          <button
            onClick={() => onAction("delete")}
            className="py-[20px] px-[20px] text-[18px] text-[#E5566C] font-medium hover:bg-gray-50 transition-colors"
          >
            Видалити чек
          </button>
        </div>
      </div>
    </>
  );
};

const GiveRightsModal = ({ isOpen, onClose, participants, onSave }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  // При відкритті можна встановити тих, хто вже має права
  useEffect(() => {
    if (isOpen) {
      const admins = participants
        .filter((p) => p.isAdminRights)
        .map((p) => p.userId);
      setSelectedIds(admins);
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
        {/* Header */}
        <div className="bg-[#B6CDFF] py-[16px] w-full text-center flex flex-col items-center">
          <h3 className="text-[20px] text-[#021024] font-bold w-[240px]">
            Оберіть учасників чеку, яким хочете надати права Організатора
          </h3>
        </div>

        {/* Content */}
        <div className="w-full px-[32px] pt-[32px] pb-[40px] flex flex-col items-center">
          {/* Select All Checkbox */}
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

          {/* List */}
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
                  avatar={iconProfile} // Тут можна підставити p.avatarUrl якщо є
                  isSelected={selectedIds.includes(p.userId)}
                  variant="rights"
                  onToggle={() => handleToggle(p.userId)}
                />
              ))
            )}
          </div>

          {/* Button */}
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

const AddMembersModal = ({ isOpen, onClose, currentParticipants, onAdd }) => {
  const [friends, setFriends] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadFriends = async () => {
        setLoading(true);
        try {
          const contacts = await contactsAPI.getContacts();
          // Формуємо список друзів
          const friendsList = contacts.map((contact) => ({
            id: contact.friend.userId,
            name: `${contact.friend.firstName} ${contact.friend.lastName}`,
            avatar: iconProfile, // Або URL з бекенду
          }));

          // Фільтруємо тих, хто вже в чеку
          const currentIds = currentParticipants.map((p) =>
            p.userId.toString()
          );
          const availableFriends = friendsList.filter(
            (f) => !currentIds.includes(f.id.toString())
          );

          setFriends(availableFriends);
        } catch (error) {
          console.error("Помилка завантаження друзів:", error);
        } finally {
          setLoading(false);
        }
      };
      loadFriends();
      setSelectedIds([]); // Скидаємо вибір при відкритті
    }
  }, [isOpen, currentParticipants]);

  const handleToggle = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
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
        {/* Header */}
        <div className="bg-[#B6CDFF] py-[16px] w-full text-center flex flex-col items-center">
          <h3 className="text-[20px] text-[#021024] font-bold w-[200px]">
            Оберіть друзів, яких хочете додати до чеку
          </h3>
        </div>

        {/* Content */}
        <div className="w-full px-[32px] pt-[32px] pb-[40px] flex flex-col items-center">
          {loading ? (
            <p className="text-[#042860] my-10">Завантаження...</p>
          ) : friends.length === 0 ? (
            <p className="text-[#979AB7] my-10 text-center">
              Усі ваші друзі вже додані до чеку або список порожній.
            </p>
          ) : (
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
          )}

          {/* Button */}
          <button
            onClick={() =>
              onAdd(friends.filter((f) => selectedIds.includes(f.id)))
            }
            className="mt-[32px] w-[206px] h-[54px] bg-[#456DB4] text-white text-[20px] font-semibold rounded-[16px] hover:bg-[#355a9e] flex items-center justify-center disabled:bg-gray-400"
            disabled={selectedIds.length === 0}
          >
            Додати
          </button>
        </div>
      </div>
    </div>
  );
};

// --- HEADER COMPONENT ---

const CheckHeader = ({
  title,
  isUserOrganizer,
  isEditMode,
  onTitleChange,
  onEditClick,
  onOpenPermissions,
  onHistoryClick,
}) => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    console.log("Чек видалено!");
    setIsDeleteModalOpen(false);
    navigate("/checks");
  };

  return (
    <div className="relative flex items-center gap-[16px] z-10">
      {/* Бейдж режиму редагування */}
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

      {/* Заголовок або Поле вводу */}
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

      {/* Блок з іконками */}
      {!isEditMode && (
        <div className="absolute right-0 flex items-center gap-4 ">
          <button title="Коментарі">
            <img
              src={commentsIcon}
              alt="Коментарі"
              className="w-[28px] h-[28px]"
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

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

// --- INFO BLOCKS COMPONENT ---

const statusStyles = {
  активний: "bg-[#7BE495]",
  закритий: "bg-[#E5566C]",
  архівний: "bg-[#E5566C]",
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
  const { description, status, amountOfDept, currency } = check;

  const getOrganizerName = () => {
    if (!organizerUser) return "Завантаження...";

    const firstName = organizerUser.firstName || "";
    const lastName = organizerUser.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || `Користувач ${organizerUser.userId || organizerUser.id}`;
  };

  return (
    <div className="flex flex-row gap-4 items-start">
      {/* Блок Організатора */}
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
        <div className="mt-4 flex flex-col gap-[8px]">
          <span className="text-[18px] text-[#042860]">Витрати:</span>
          {isEditMode ? (
            <div className="relative inline-block">
              <input
                type="number"
                value={amountOfDept}
                onChange={(e) => onOrganizerExpenseChange(e.target.value)}
                className="w-[100px] bg-white rounded-lg py-2 px-4 font-semibold text-[18px] text-[#042860] border-b-2 border-[#042860] focus:outline-none"
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
      </div>

      {/* Блок Опису */}
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

      {/* Блок Статусів */}
      <div className="bg-[#B6CDFF] p-5 rounded-[16px] flex-shrink-0">
        <h3 className="text-[20px] text-[#021024] font-semibold mb-4">
          Статуси
        </h3>
        <div className="flex flex-col items-start gap-2 ">
          <StatusTag text={status} />
          <StatusTag text={check.calculatedStatus} />
        </div>
      </div>
    </div>
  );
};

// --- TABLE COMPONENT ---

const ParticipantsTable = ({
  scenario,
  participants,
  currentUserId,
  organizerId,
  scenarioMarginBottom,
  amountOfDept,
  currency,
  isEditMode,
  onParticipantChange,
  onAddParticipant,
  onDeleteParticipant,
}) => {
  const formatName = (userId, name, isCurrentUser) => {
    return isCurrentUser ? `${name} (Я)` : name;
  };

  const filteredParticipants = participants.filter((p) =>
    scenario === "спільні витрати" ? true : !p.isAdminRights
  );

  const getScenarioDisplayName = (scenario) => {
    switch (scenario) {
      case "рівний розподіл":
        return "Рівний розподіл";
      case "індивідуальні суми":
        return "Індивідуальні суми";
      case "спільні витрати":
        return "Спільні витрати";
      default:
        return scenario;
    }
  };

  const scenarioInfo = (
    <div
      className={`${
        scenarioMarginBottom || "mb-6"
      } flex justify-between items-center`}
    >
      <div className="flex items-center gap-4">
        <h3 className="text-[20px] text-[#021024] font-semibold">
          Сценарій розрахунку:
        </h3>
        <p className="text-[20px] text-[#042860]">
          {getScenarioDisplayName(scenario)}
        </p>
      </div>

      {/* Блок "Загальні витрати" (тільки для 3 сценарію) */}
      {scenario === "спільні витрати" && (
        <div className="flex items-center gap-4">
          <h3 className="text-[20px] text-[#021024] font-semibold">
            Загальні витрати:
          </h3>
          <p className="text-[20px] text-[#042860] font-semibold">
            {amountOfDept} {currency}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {scenarioInfo}

      {/* Кнопка "Додати нового учасника" (Тільки в EditMode) */}
      {isEditMode && (
        <div className="mb-6">
          <button
            onClick={onAddParticipant}
            className="flex items-center bg-[#EBF1FF] border border-[#7B9CCA] rounded-[4px] py-[16px] px-[36px] hover:bg-[#dbe5ff]"
          >
            <img
              src={addIcon}
              alt="Add"
              className="w-[20px] h-[20px] mr-[20px]"
            />
            <span className="text-[#042860] text-[18px] font-medium">
              Додати нового учасника
            </span>
          </button>
        </div>
      )}

      <table className="w-full border-collapse border border-[#8A9CCB] table-fixed">
        <thead className="bg-[#B6CDFF] text-center text-[14px] text-[#021024] font-semibold">
          <tr>
            <th className="p-3 border border-[#8A9CCB]">Учасники чеку</th>
            {/* Колонки залежать від сценарію */}
            {scenario === "спільні витрати" ? (
              <>
                <th className="p-3 border border-[#8A9CCB]">
                  Сума, яку витратив
                </th>
                <th className="p-3 border border-[#8A9CCB]">
                  Сума, яку має сплатити
                </th>
                <th className="p-3 border border-[#8A9CCB]">Вже сплатив</th>
                <th className="p-3 border border-[#8A9CCB]">Різниця</th>
              </>
            ) : (
              <>
                <th className="p-3 border border-[#8A9CCB]">
                  Сума, яку має сплатити
                </th>
                <th className="p-3 border border-[#8A9CCB]">Сплачено</th>
                <th className="p-3 border border-[#8A9CCB]">Залишок боргу</th>
              </>
            )}
            {/* Колонка видалення (Тільки в EditMode) */}
            {isEditMode && (
              <th className="p-3 border border-[#8A9CCB] w-[60px]"></th>
            )}
          </tr>
        </thead>
        <tbody className="text-left text-[18px] text-[#042860]">
          {filteredParticipants.map((p) => {
            // Розрахунки для відображення
            const difference = (p.paidAmount || 0) - (p.assignedAmount || 0);
            const isOverpaid = difference > 0;
            const isUnderpaid = difference < 0;
            const debt = (p.assignedAmount || 0) - (p.balance || 0);

            const isCurrentUser =
              p.userId.toString() === currentUserId?.toString();

            return (
              <tr key={p.userId}>
                {/* Ім'я */}
                <td className="p-3 border border-[#8A9CCB] font-semibold">
                  {formatName(p.userId, p.userName, isCurrentUser)}
                </td>

                {scenario === "спільні витрати" ? (
                  <>
                    {/* Спільні витрати: Редагуємо 'paidAmount' (Сума, яку витратив) */}
                    <td className="p-3 border border-[#8A9CCB]">
                      {isEditMode ? (
                        <input
                          type="number"
                          value={p.paidAmount || 0}
                          onChange={(e) =>
                            onParticipantChange(
                              p.userId,
                              "paidAmount",
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent border-b border-[#042860] focus:outline-none"
                        />
                      ) : (
                        `${p.paidAmount || 0} ${currency}`
                      )}
                    </td>
                    <td className="p-3 border border-[#8A9CCB]">
                      {p.assignedAmount || 0} {currency}
                    </td>
                    <td className="p-3 border border-[#8A9CCB]">
                      {p.balance || 0} {currency}
                    </td>
                    <td
                      className={`p-3 font-semibold text-[18px] border border-[#8A9CCB] ${
                        isUnderpaid
                          ? "text-[#E5566C]"
                          : isOverpaid
                          ? "text-[#7BE495]"
                          : "text-[#042860]"
                      }`}
                    >
                      {difference > 0 ? `+${difference}` : difference}{" "}
                      {currency}
                    </td>
                  </>
                ) : (
                  <>
                    {/* Інші сценарії: Редагуємо 'assignedAmount' (Сума, яку має сплатити) */}
                    <td className="p-3 border border-[#8A9CCB]">
                      {isEditMode && scenario === "індивідуальні суми" ? (
                        <input
                          type="number"
                          value={p.assignedAmount || 0}
                          onChange={(e) =>
                            onParticipantChange(
                              p.userId,
                              "assignedAmount",
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent border-b border-[#042860] focus:outline-none"
                        />
                      ) : (
                        `${p.assignedAmount || 0} ${currency}`
                      )}
                    </td>
                    <td className="p-3 border border-[#8A9CCB]">
                      {p.balance || 0} {currency}
                    </td>
                    <td className="p-3 font-semibold border border-[#8A9CCB]">
                      {debt} {currency}
                    </td>
                  </>
                )}

                {/* Кнопка Видалення */}
                {isEditMode && (
                  <td className="p-3 border border-[#8A9CCB] text-center">
                    <button
                      onClick={() => onDeleteParticipant(p.userId)}
                      title="Видалити учасника"
                    >
                      <img
                        src={deleteIcon}
                        alt="Del"
                        className="w-[20px] h-[20px] mx-auto"
                      />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

// --- PAYMENT COMPONENT ---

const PaymentSection = ({
  check,
  currentUserData,
  currency,
  isUserOrganizer,
}) => {
  const [paymentType, setPaymentType] = useState("full");
  const [partialAmount, setPartialAmount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const userDebt = useMemo(() => {
    if (!currentUserData) return 0;

    if (check.scenario === "спільні витрати") {
      const difference =
        (currentUserData.paidAmount || 0) -
        (currentUserData.assignedAmount || 0);
      return difference > 0 ? difference : 0;
    } else {
      const debt =
        (currentUserData.assignedAmount || 0) - (currentUserData.balance || 0);
      return debt > 0 ? debt : 0;
    }
  }, [currentUserData, check.scenario]);

  useEffect(() => {
    setPartialAmount(userDebt);
  }, [userDebt]);

  const shouldShowPaymentSection = useMemo(() => {
    if (check.status === "закритий" || check.status === "архівний") {
      return false;
    }

    if (isUserOrganizer) {
      return check.scenario === "спільні витрати" && userDebt > 0;
    }

    return userDebt > 0;
  }, [check.status, check.scenario, isUserOrganizer, userDebt]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === "") {
      setError("");
      setPartialAmount(0);
      return;
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      setError("Будь ласка, введіть число.");
      return;
    }

    if (numValue > userDebt) {
      setError(`Сума не може перевищувати ваш борг: ${userDebt} ${currency}`);
    } else if (numValue < 0) {
      setError("Сума не може бути негативною.");
    } else {
      setError("");
      setPartialAmount(numValue);
    }
  };

  const handlePayment = () => {
    alert(
      `Функція оплати буде реалізована пізніше. Сума: ${
        paymentType === "full" ? userDebt : partialAmount
      } ${currency}`
    );
  };

  if (!shouldShowPaymentSection) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col items-start">
      {/* Перемикач типу оплати */}
      <div className="flex rounded-lg p-[3px] bg-[#456DB4]">
        <button
          className={`px-4 py-2 rounded ${
            paymentType === "full"
              ? "bg-[#EBF1FF] border border-[#021024]"
              : "bg-[#456DB4]"
          } text-[#042860]`}
          onClick={() => setPaymentType("full")}
        >
          Повна оплата
        </button>
        <button
          className={`px-4 py-2 rounded ${
            paymentType === "partial"
              ? "bg-[#EBF1FF] border border-[#021024]"
              : "bg-[#456DB4]"
          } text-[#042860]`}
          onClick={() => setPaymentType("partial")}
        >
          Часткова оплата
        </button>
      </div>

      {/* Поле вводу для часткової оплати */}
      {paymentType === "partial" && (
        <div className="mt-6">
          <div className="flex items-center gap-5">
            <label className="text-[20px] text-[#042860] whitespace-nowrap">
              Введіть суму, яку хочете сплатити:
            </label>
            <input
              type="number"
              value={inputValue}
              placeholder={userDebt.toString()}
              onChange={handleAmountChange}
              className="block w-[128px] rounded-lg border border-[#7B9CCA] text-[#979AB7] py-2 px-8 shadow-sm placeholder:text-[#979AB7]"
            />
            <span className="text-[#042860]">{currency}</span>
          </div>
          {error && <p className="text-red-600 text-sm mt-2 ml-4">{error}</p>}
        </div>
      )}

      {/* Головна кнопка оплати */}
      <div className="w-full flex justify-center">
        <button
          onClick={handlePayment}
          className="mt-10 bg-[#456DB4] text-white rounded-[20px] py-4 px-[60px] font-semibold text-lg hover:bg-blue-700"
        >
          Сплатити борг
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function CheckDetailPage() {
  const { ebillId } = useParams();
  const navigate = useNavigate();
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [organizerUser, setOrganizerUser] = useState(null);

  // Стан для редагування
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCheck, setEditedCheck] = useState(null);
  const [isRightsModalOpen, setIsRightsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const currentUserId = getIdFromJWT();

  useEffect(() => {
    const loadCheckData = async () => {
      try {
        setLoading(true);
        setError(null);

        const checkData = await checksAPI.getCheckById(ebillId);

        const organizerParticipant = checkData.participants.find(
          (p) => p.isAdminRights
        );
        if (organizerParticipant) {
          const organizer = await usersAPI.getUserById(
            organizerParticipant.userId
          );
          setOrganizerUser(organizer);
        }

        const usersData = {};
        for (const participant of checkData.participants) {
          if (!usersData[participant.userId]) {
            const user = await usersAPI.getUserById(participant.userId);
            usersData[participant.userId] = user;
          }
        }
        setUsers(usersData);

        const calculatedStatus = calculateCheckStatus(checkData);

        const enrichedCheck = {
          ...checkData,
          participants: checkData.participants.map((participant) => {
            const userData = usersData[participant.userId];
            const firstName = userData?.firstName || "";
            const lastName = userData?.lastName || "";
            const fullName = `${firstName} ${lastName}`.trim();

            return {
              ...participant,
              userName: fullName || `Користувач ${participant.userId}`,
            };
          }),
          calculatedStatus: calculatedStatus,
          currentUserPaymentStatus:
            checkData.participants.find(
              (p) => p.userId.toString() === currentUserId?.toString()
            )?.paymentStatus || "непогашений",
        };

        setCheck(enrichedCheck);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (ebillId && currentUserId) {
      loadCheckData();
    }
  }, [ebillId, currentUserId]);

  // --- Хендлери Редагування ---

  const handleEnableEditMode = () => {
    setIsEditMode(true);
    // Глибока копія чеку для редагування
    setEditedCheck(JSON.parse(JSON.stringify(check)));
  };

  const handleSave = () => {
    console.log("Імітація: Збереження змін...", editedCheck);
    // Тут буде запит до API (updateCheck)
    setCheck(editedCheck); // Оновлюємо локальний стан
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedCheck(null);
  };

  // Обробники змін полів
  const handleTitleChange = (val) =>
    setEditedCheck({ ...editedCheck, name: val });
  const handleDescriptionChange = (val) =>
    setEditedCheck({ ...editedCheck, description: val });
  const handleOrganizerExpenseChange = (val) =>
    setEditedCheck({ ...editedCheck, amountOfDept: val });

  const handleParticipantChange = (userId, field, val) => {
    const updatedParticipants = editedCheck.participants.map((p) =>
      p.userId === userId ? { ...p, [field]: val } : p
    );
    setEditedCheck({ ...editedCheck, participants: updatedParticipants });
  };

  const handleAddParticipant = () => {
    const newId = Date.now(); // Тимчасовий ID
    const newParticipant = {
      userId: newId,
      userName: "Новий учасник",
      isAdminRights: false,
      assignedAmount: 0,
      paidAmount: 0,
      balance: 0,
    };
    setEditedCheck({
      ...editedCheck,
      participants: [...editedCheck.participants, newParticipant],
    });
  };

  const handleDeleteParticipant = (userId) => {
    const updatedParticipants = editedCheck.participants.filter(
      (p) => p.userId !== userId
    );
    setEditedCheck({ ...editedCheck, participants: updatedParticipants });
  };

  const handleOpenPermissions = () => setIsRightsModalOpen(true);
  const handleSaveRights = (selectedIds) => {
    // Логіка оновлення прав
    console.log("Нові адміністратори:", selectedIds);
    // Тут мав би бути API запит. Імітуємо оновлення локального стану, якщо потрібно
    // const updated = { ...check, participants: check.participants.map(p => ({...p, isAdminRights: selectedIds.includes(p.userId)})) };
    // setCheck(updated);
    setIsRightsModalOpen(false);
  };

  const handleOpenAddMember = () => setIsAddModalOpen(true);
  const handleAddFriends = (newFriends) => {
    // Логіка додавання нових учасників
    console.log("Додано друзів:", newFriends);
    const newParticipants = newFriends.map((f) => ({
      userId: f.id,
      userName: f.name,
      isAdminRights: false,
      assignedAmount: 0,
      paidAmount: 0,
      balance: 0,
      // інші дефолтні поля
    }));

    if (isEditMode) {
      setEditedCheck({
        ...editedCheck,
        participants: [...editedCheck.participants, ...newParticipants],
      });
    } else {
      // Якщо це викликається не з режиму редагування (хоча кнопка тільки там)
      // Можна додати логіку прямого додавання
    }
    setIsAddModalOpen(false);
  };

  const handleHistoryClick = () => {
    navigate(`/checks/${ebillId}/history`);
  };

  // --- Рендер ---

  const checkToRender = isEditMode ? editedCheck : check;

  const currentUserParticipant = useMemo(() => {
    return check?.participants.find(
      (p) => p.userId.toString() === currentUserId?.toString()
    );
  }, [checkToRender, currentUserId]);

  const isUserOrganizer = currentUserParticipant?.isAdminRights || false;

  if (loading) {
    return (
      <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
        <div className="bg-white rounded-[24px] pb-10 min-h-[600px] flex items-center justify-center">
          <p className="text-xl text-[#4B6C9A]">Завантаження деталей чеку...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
        <div className="bg-white rounded-[24px] pb-10 min-h-[600px] flex items-center justify-center">
          <p className="text-xl text-red-600">Помилка: {error}</p>
          <button
            onClick={() => navigate("/checks")}
            className="ml-4 bg-[#456DB4] text-white px-4 py-2 rounded-lg"
          >
            Повернутися до чеків
          </button>
        </div>
      </div>
    );
  }

  if (!check) {
    return (
      <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
        <div className="bg-white rounded-[24px] pb-10 min-h-[600px] flex items-center justify-center">
          <p className="text-xl text-[#4B6C9A]">Чек не знайдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
      <div className="bg-white rounded-[24px] px-10 pt-7 pb-9">
        {/* Компонент 1: Заголовок */}
        <div className="mb-5">
          <CheckHeader
            title={checkToRender.name}
            isUserOrganizer={isUserOrganizer}
            isEditMode={isEditMode}
            onEditClick={handleEnableEditMode}
            onTitleChange={handleTitleChange}
            onOpenPermissions={handleOpenPermissions}
            onHistoryClick={handleHistoryClick}
          />
        </div>
        {/* Компонент 2: Інформаційні блоки */}
        <div className="mb-6">
          <CheckInfoBlocks
            check={checkToRender}
            currentUserId={currentUserId}
            isUserOrganizer={isUserOrganizer}
            organizerUser={organizerUser}
            isEditMode={isEditMode}
            onDescriptionChange={handleDescriptionChange}
            onOrganizerExpenseChange={handleOrganizerExpenseChange}
          />
        </div>
        {/* Компонент 3: Таблиця */}
        <ParticipantsTable
          scenario={checkToRender.scenario}
          participants={checkToRender.participants}
          currentUserId={currentUserId}
          organizerId={organizerUser?.userId}
          scenarioMarginBottom="mb-6"
          amountOfDept={checkToRender.amountOfDept}
          currency={checkToRender.currency}
          isEditMode={isEditMode}
          onParticipantChange={handleParticipantChange}
          onAddParticipant={handleOpenAddMember}
          onDeleteParticipant={handleDeleteParticipant}
        />
        {/* Компонент 4: Логіка оплати */}
        {isEditMode ? (
          <div className="flex justify-center gap-6 mt-10">
            <button
              onClick={handleSave}
              className="bg-[#456DB4] text-white text-[20px] font-semibold rounded-[16px] py-[20px] w-[226px] hover:bg-[#355a9e]"
            >
              Зберегти зміни
            </button>
            <button
              onClick={handleCancel}
              className="bg-[#456DB4] text-white text-[20px] font-semibold rounded-[16px] py-[20px] w-[226px] hover:bg-[#355a9e]"
            >
              Скасувати
            </button>
          </div>
        ) : (
          <PaymentSection
            check={checkToRender}
            currentUserData={currentUserParticipant}
            currency={checkToRender.currency}
            isUserOrganizer={isUserOrganizer}
          />
        )}
      </div>

      <GiveRightsModal
        isOpen={isRightsModalOpen}
        onClose={() => setIsRightsModalOpen(false)}
        participants={checkToRender.participants.filter(
          (p) => p.userId.toString() !== currentUserId?.toString()
        )}
        onSave={handleSaveRights}
      />
      <AddMembersModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentParticipants={checkToRender.participants}
        onAdd={handleAddFriends}
      />
    </div>
  );
}
