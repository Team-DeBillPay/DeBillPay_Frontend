import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import iconProfile from "../assets/icons/iconProfile.png";
import returnBackIcon from "../assets/icons/returnback.png";
import commentsIcon from "../assets/icons/commentsIcon.png";
import historyIcon from "../assets/icons/historyIcon.png";
import settingsIcon from "../assets/icons/settingsIcon.png";
import { checksAPI } from "../api/checks";
import { usersAPI } from "../api/users";
import { getIdFromJWT } from "../utils/jwt";

const calculateCheckStatus = (check) => {
  const { scenario, participants } = check;
  

  let participantsToCheck = participants;
  
  if (scenario === "рівний розподіл" || scenario === "індивідуальні суми") {
    participantsToCheck = participants.filter(p => !p.isAdminRights);
  }
  
  let hasAnyPayment = false;
  let allFullyPaid = true;
  
  participantsToCheck.forEach(participant => {
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

const CheckHeader = ({ title, isUserOrganizer }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/checks");
  };

  return (
    <div className="relative flex items-center">
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

      {/* Заголовок */}
      <h1 className="w-full text-center text-[32px] text-[#021024] font-semibold">
        Деталі чеку: “{title}”
      </h1>

      {/* Блок з іконками */}
      <div className="absolute right-0 flex items-center gap-4">
        <button title="Коментарі">
          <img
            src={commentsIcon}
            alt="Коментарі"
            className="w-[28px] h-[28px]"
          />
        </button>
        <button title="Історія змін чеку">
          <img src={historyIcon} alt="Історія" className="w-[28px] h-[28px]" />
        </button>
        {isUserOrganizer && (
          <button title="Налаштування чеку">
            <img
              src={settingsIcon}
              alt="Налаштування"
              className="w-[28px] h-[28px]"
            />
          </button>
        )}
      </div>
    </div>
  );
};

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

const CheckInfoBlocks = ({ check, currentUserId, isUserOrganizer, organizerUser }) => {
  const { description, status } = check;

  const getOrganizerName = () => {
    if (!organizerUser) return "Завантаження...";
    
    const firstName = organizerUser.firstName || '';
    const lastName = organizerUser.lastName || '';
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
          <p className="bg-white rounded-lg py-2 px-7 font-semibold text-[18px] text-[#042860] inline-block mt-1">
            {check.amountOfDept || "---"} {check.currency}
          </p>
        </div>
      </div>

      {/* Блок Опису */}
      <div className="bg-[#EBF1FF] p-5 rounded-[16px] flex-1">
        <h3 className="text-[20px] text-[#021024] font-semibold mb-4">Опис</h3>
        <p
          className={`text-[18px] ${
            description ? "text-[#042860]" : "text-[#979AB7] italic"
          }`}
        >
          {description || "Чек не має опису."}
        </p>
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

const ParticipantsTable = ({
  scenario,
  participants,
  currentUserId,
  organizerId,
  scenarioMarginBottom,
  amountOfDept,
  currency
}) => {
  const formatName = (userId, name, isCurrentUser) => {
    return isCurrentUser ? `${name} (Я)` : name;
  };

  const filteredParticipants = participants.filter(p => 
    scenario === "спільні витрати" ? true : !p.isAdminRights
  );

  const getScenarioDisplayName = (scenario) => {
    switch (scenario) {
      case "рівний розподіл": return "Рівний розподіл";
      case "індивідуальні суми": return "Індивідуальні суми";
      case "спільні витрати": return "Спільні витрати";
      default: return scenario;
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

  if (scenario === "спільні витрати") {
    return (
      <>
        {scenarioInfo}
        <table className="w-full border-collapse border border-[#8A9CCB] table-fixed">
          <thead className="bg-[#B6CDFF] text-center text-[14px] text-[#021024] font-semibold">
            <tr>
              <th className="p-3 border border-[#8A9CCB]">Учасники чеку</th>
              <th className="p-3 border border-[#8A9CCB]">
                Сума, яку витратив
              </th>
              <th className="p-3 border border-[#8A9CCB]">
                Сума, яку має сплатити
              </th>
              <th className="p-3 border border-[#8A9CCB]">Вже сплатив</th>
              <th className="p-3 border border-[#8A9CCB]">Різниця</th>
            </tr>
          </thead>
          <tbody className="text-left text-[18px] text-[#042860]">
            {filteredParticipants.map((p) => {
              const difference = (p.paidAmount || 0) - (p.assignedAmount || 0);
              const isOverpaid = difference > 0;
              const isUnderpaid = difference < 0;
              
              return (
                <tr key={p.userId}>
                  <td className="p-3 border border-[#8A9CCB] font-semibold">
                    {formatName(p.userId, p.userName, p.userId.toString() === currentUserId)}
                  </td>
                  <td className="p-3 border border-[#8A9CCB]">{p.paidAmount || 0} {currency}</td>
                  <td className="p-3 border border-[#8A9CCB]">{p.assignedAmount || 0} {currency}</td>
                  <td className="p-3 border border-[#8A9CCB]">{p.balance || 0} {currency}</td>
                  <td
                    className={`p-3 font-semibold text-[18px] border border-[#8A9CCB] ${
                      isUnderpaid 
                        ? "text-[#E5566C]"
                        : isOverpaid 
                        ? "text-[#7BE495]"
                        : "text-[#042860]"
                    }`}
                  >
                    {difference > 0 ? `+${difference}` : difference} {currency}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  }

  return (
    <>
      {scenarioInfo}
      <table className="w-full border-collapse border border-[#8A9CCB] table-fixed">
        <thead className="bg-[#B6CDFF] text-center text-[14px] text-[#021024] font-semibold">
          <tr>
            <th className="p-3 border border-[#8A9CCB]">Учасники чеку</th>
            <th className="p-3 border border-[#8A9CCB]">
              Сума, яку має сплатити
            </th>
            <th className="p-3 border border-[#8A9CCB]">Сплачено</th>
            <th className="p-3 border border-[#8A9CCB]">Залишок боргу</th>
          </tr>
        </thead>
        <tbody className="text-left text-[18px] text-[#042860]">
          {filteredParticipants.map((p) => {
            const debt = (p.assignedAmount || 0) - (p.balance || 0);
            return (
              <tr key={p.userId}>
                <td className="p-3 border border-[#8A9CCB] font-semibold">
                  {formatName(p.userId, p.userName, p.userId.toString() === currentUserId)}
                </td>
                <td className="p-3 border border-[#8A9CCB]">{p.assignedAmount || 0} {currency}</td>
                <td className="p-3 border border-[#8A9CCB]">{p.balance || 0} {currency}</td>
                <td className="p-3 font-semibold border border-[#8A9CCB]">
                  {debt} {currency}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

const PaymentSection = ({ check, currentUserData, currency, isUserOrganizer }) => {
  const [paymentType, setPaymentType] = useState("full");
  const [partialAmount, setPartialAmount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const userDebt = useMemo(() => {
    if (!currentUserData) return 0;
    
    if (check.scenario === "спільні витрати") {
      const difference = (currentUserData.paidAmount || 0) - (currentUserData.assignedAmount || 0);
      return difference > 0 ? difference : 0;
    } else {
      const debt = (currentUserData.assignedAmount || 0) - (currentUserData.balance || 0);
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
    alert(`Функція оплати буде реалізована пізніше. Сума: ${paymentType === "full" ? userDebt : partialAmount} ${currency}`);
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

export default function CheckDetailPage() {
  const { ebillId } = useParams();
  const navigate = useNavigate();
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [organizerUser, setOrganizerUser] = useState(null);

  const currentUserId = getIdFromJWT();

  useEffect(() => {
    const loadCheckData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const checkData = await checksAPI.getCheckById(ebillId);

        const organizerParticipant = checkData.participants.find(p => p.isAdminRights);
        if (organizerParticipant) {
          const organizer = await usersAPI.getUserById(organizerParticipant.userId);
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
          participants: checkData.participants.map(participant => {
            const userData = usersData[participant.userId];
            const firstName = userData?.firstName || '';
            const lastName = userData?.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            
            return {
              ...participant,
              userName: fullName || `Користувач ${participant.userId}`
            };
          }),
          calculatedStatus: calculatedStatus,
          currentUserPaymentStatus: checkData.participants.find(
            p => p.userId.toString() === currentUserId?.toString()
          )?.paymentStatus || "непогашений"
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

  const currentUserParticipant = useMemo(() => {
    return check?.participants.find((p) => p.userId.toString() === currentUserId?.toString());
  }, [check, currentUserId]);

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
          <CheckHeader title={check.name} isUserOrganizer={isUserOrganizer} />
        </div>
        {/* Компонент 2: Інформаційні блоки */}
        <div className="mb-6">
          <CheckInfoBlocks
            check={check}
            currentUserId={currentUserId}
            isUserOrganizer={isUserOrganizer}
            organizerUser={organizerUser}
          />
        </div>
        {/* Компонент 3: Таблиця */}
        <ParticipantsTable
          scenario={check.scenario}
          participants={check.participants}
          currentUserId={currentUserId}
          organizerId={organizerUser?.userId}
          scenarioMarginBottom="mb-6"
          amountOfDept={check.amountOfDept}
          currency={check.currency}
        />
        {/* Компонент 4: Логіка оплати */}
        <PaymentSection
          check={check}
          currentUserData={currentUserParticipant}
          currency={check.currency}
          isUserOrganizer={isUserOrganizer}
        />
      </div>
    </div>
  );
}