import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import iconProfile from "../assets/icons/iconProfile.png";
import returnBackIcon from "../assets/icons/returnback.png";
import commentsIcon from "../assets/icons/commentsIcon.png";
import historyIcon from "../assets/icons/historyIcon.png";
import settingsIcon from "../assets/icons/settingsIcon.png";

const CURRENT_USER_ID = "user-123";

const mockChecks = [
  // --- Сценарій 1: Рівний розподіл ---
  {
    id: "check-1",
    title: "Пікнік",
    scenario: "equal",
    description:
      "Спільні витрати на продукти, напої та оренду мангалу під час пікніка. Витрати діляться порівну між усіма учасниками.",
    organizer: {
      id: "user-456",
      name: "Віталя П.",
      avatar: iconProfile,
      totalSpent: 1200,
    },
    status: { general: "Активний", userSpecific: "Погашений" },
    participants: [
      {
        id: "user-456",
        name: "Віталя П.",
        toPay: 0,
        paid: 0,
        debt: 0,
      },
      {
        id: "user-123", // Це "Я" (поточний користувач)
        name: "Владислав Якубець",
        toPay: 300,
        paid: 300,
        debt: 0,
      },
      {
        id: "user-789",
        name: "Джоніс Золото",
        toPay: 300,
        paid: 150,
        debt: 150,
      },
      {
        id: "user-101",
        name: "Яся Аналітік",
        toPay: 300,
        paid: 300,
        debt: 0,
      },
    ],
  },

  // --- Сценарій 2: Індивідуальні суми ---
  {
    id: "check-2",
    title: "Ресторан",
    scenario: "individual",
    description:
      "Влад їв Цезаря, Джоніс їв стейк, а Яся випила каву з десертом.",
    organizer: {
      id: "user-456",
      name: "Віталя П.",
      avatar: iconProfile,
      totalSpent: 1200,
    },
    status: { general: "Активний", userSpecific: "Погашений" },
    participants: [
      {
        id: "user-456",
        name: "Віталя П.",
        toPay: 0,
        paid: 0,
        debt: 0,
      },
      {
        id: "user-123", // Це "Я"
        name: "Владислав Якубець",
        toPay: 300,
        paid: 0,
        debt: 300,
      },
      {
        id: "user-789",
        name: "Джоніс Золото",
        toPay: 350,
        paid: 150,
        debt: 200,
      },
      {
        id: "user-101",
        name: "Яся Аналітік",
        toPay: 200,
        paid: 200,
        debt: 0,
      },
    ],
  },

  // --- Сценарій 3: Спільні витрати ---
  {
    id: "check-3",
    title: "Пікнік",
    scenario: "shared",
    description:
      "Кожен учасник купував окремі продукти для пікніка: хтось — м'ясо, хтось — напої, хтось — одноразовий посуд.",
    totalExpenses: 600,
    organizer: {
      id: "user-101", // Організатором є "Яся"
      name: "Яся А.",
      avatar: iconProfile,
    },
    status: { general: "Активний", userSpecific: "Частково погашений" },
    participants: [
      {
        id: "user-456",
        name: "Владислав Якубець",
        spent: 300,
        toPay: 200,
        paid: 300,
        difference: -100, // Переплатив
      },
      {
        id: "user-789",
        name: "Джоніс Золото",
        spent: 200,
        toPay: 200,
        paid: 200,
        difference: 0, // Баланс
      },
      {
        id: "user-123", // Це "Я" (поточний користувач)
        name: "Яся Аналітік",
        spent: 100,
        toPay: 200,
        paid: 100, // Сплатила лише 100 з 200
        difference: +100, // Має борг
      },
    ],
  },

  // --- Сценарій 4: Рівний розподіл (Я - ОРГАНІЗАТОР) + Немає опису ---
  {
    id: "check-4",
    title: "Вечеря",
    scenario: "equal",
    description: "",
    organizer: {
      id: "user-123", // "Я" - Організатор
      name: "Владислав Я.",
      avatar: iconProfile,
      totalSpent: 1350,
    },
    status: { general: "Закритий", userSpecific: "Погашений" },
    participants: [
      {
        id: "user-123", // "Я"
        name: "Владислав Якубець",
        toPay: 0,
        paid: 0,
        debt: 0,
      },
      {
        id: "user-789",
        name: "Джоніс Золото",
        toPay: 450,
        paid: 450,
        debt: 0,
      },
      {
        id: "user-101",
        name: "Яся Аналітік",
        toPay: 450,
        paid: 450,
        debt: 0,
      },
    ],
  },
];

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
  Активний: "bg-[#7BE495]",
  Закритий: "bg-[#E5566C]",
  Погашений: "bg-[#A4FFC4]",
  "Частково погашений": "bg-[#FEEBBB]",
  Непогашений: "bg-[#FFACAE]",
};

const StatusTag = ({ text }) => {
  const bgColor = statusStyles[text] || "bg-gray-300"; // Заглушка, якщо статус невідомий

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

const CheckInfoBlocks = ({ check, currentUserId, isUserOrganizer }) => {
  const { organizer, description, status, totalExpenses } = check;

  return (
    <div className="flex flex-row gap-4 items-start">
      {/* Блок Організатора */}
      <div className="bg-[#B6CDFF] p-5 rounded-[16px] flex-shrink-0">
        <h3 className="text-[20px] text-[#021024] font-semibold mb-4">
          Організатор
        </h3>
        <div className="flex items-center gap-3">
          <img
            src={organizer.avatar}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <span className="font-medium text-[18px] text-[#042860]">
            {organizer.name} {isUserOrganizer && "(Я)"}
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-[8px]">
          <span className="text-[18px] text-[#042860]">Витрати:</span>
          <p className="bg-white rounded-lg py-2 px-7 font-semibold text-[18px] text-[#042860] inline-block mt-1">
            {organizer.totalSpent || totalExpenses || "---"} грн
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
          <StatusTag text={status.general} />
          <StatusTag text={status.userSpecific} />
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
  totalExpenses,
}) => {
  const formatName = (id, name) => {
    return id === currentUserId ? `${name} (Я)` : name;
  };

  const filteredParticipants =
    scenario === "shared"
      ? participants
      : participants.filter((p) => p.id !== organizerId);

  const scenarioInfo = (
    <div
      className={`${
        scenarioMarginBottom || "mb-6"
      } flex justify-between items-center`}
    >
      {/* Заголовок і опис поруч */}
      <div className="flex items-center gap-4">
        <h3 className="text-[20px] text-[#021024] font-semibold">
          Сценарій розрахунку:
        </h3>
        <p className="text-[20px] text-[#042860]">
          {scenario === "shared"
            ? "Спільні витрати"
            : scenario === "equal"
            ? "Рівний розподіл"
            : "Індивідуальні суми"}
        </p>
      </div>

      {/* Блок "Загальні витрати" (тільки для 3 сценарію) */}
      {scenario === "shared" && (
        <div className="flex items-center gap-4">
          <h3 className="text-[20px] text-[#021024] font-semibold">
            Загальні витрати:
          </h3>
          <p className="text-[20px] text-[#042860] font-semibold">
            {totalExpenses} грн
          </p>
        </div>
      )}
    </div>
  );

  // --- Сценарій 3: Спільні витрати (5 колонок) ---
  if (scenario === "shared") {
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
            {filteredParticipants.map((p) => (
              <tr key={p.id}>
                <td className="p-3  border border-[#8A9CCB] font-semibold">
                  {formatName(p.id, p.name)}
                </td>
                <td className="p-3 border border-[#8A9CCB]">{p.spent} грн</td>
                <td className="p-3 border border-[#8A9CCB]">{p.toPay} грн</td>
                <td className="p-3 border border-[#8A9CCB]">{p.paid} грн</td>
                <td
                  className={`p-3 font-semibold text-[18px] border border-[#8A9CCB] ${
                    p.difference > 0 ? "text-[#E5566C]" : "text-[#7BE495]"
                  }`}
                >
                  {p.difference} грн
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  // --- Сценарії 1 та 2: Рівний / Індивідуальний (4 колонки) ---
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
          {filteredParticipants.map((p) => (
            <tr key={p.id}>
              <td className="p-3 border border-[#8A9CCB] font-semibold">
                {formatName(p.id, p.name)}
              </td>
              <td className="p-3 border border-[#8A9CCB]">{p.toPay} грн</td>
              <td className="p-3 border border-[#8A9CCB]">{p.paid} грн</td>
              <td className="p-3 font-semibold border border-[#8A9CCB]">
                {p.debt} грн
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const PaymentSection = ({ check, currentUserData }) => {
  const [paymentType, setPaymentType] = useState("full");

  let userDebt = 0;
  if (check.scenario === "shared") {
    userDebt = currentUserData?.difference > 0 ? currentUserData.difference : 0;
  } else {
    userDebt = currentUserData?.debt > 0 ? currentUserData.debt : 0;
  }

  const [partialAmount, setPartialAmount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPartialAmount(userDebt);
  }, [userDebt]);

  // Обробник, який валідує максимальну суму
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
      setError(`Сума не може перевищувати ваш борг: ${userDebt} грн`);
    } else if (numValue < 0) {
      setError("Сума не може бути негативною.");
    } else {
      setError("");
      setPartialAmount(numValue);
    }
  };

  if (userDebt <= 0) {
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
              placeholder={userDebt}
              onChange={handleAmountChange}
              className="block w-[128px] rounded-lg border border-[#7B9CCA] text-[#979AB7] py-2 px-8 shadow-sm placeholder:text-[#979AB7]"
            />
          </div>
          {/* Умовний рендеринг повідомлення про помилку */}
          {error && <p className="text-red-600 text-sm mt-2 ml-4">{error}</p>}
        </div>
      )}

      {/* Головна кнопка оплати */}
      <div className="w-full flex justify-center">
        <button className="mt-10 bg-[#456DB4] text-white rounded-[20px] py-4 px-[60px] font-semibold text-lg hover:bg-blue-700">
          Сплатити борг
        </button>
      </div>
    </div>
  );
};

export default function CheckDetailPage() {
  const { checkId } = useParams(); // ID чеку з URL
  const [check, setCheck] = useState(null); // Стан для даних чеку

  useEffect(() => {
    const foundCheck = mockChecks.find((c) => c.id === checkId);
    setCheck(foundCheck);
  }, [checkId]);

  // useMemo, щоб не перераховувати при кожному рендері
  const currentUserParticipant = useMemo(() => {
    return check?.participants.find((p) => p.id === CURRENT_USER_ID);
  }, [check]);

  const isUserOrganizer = check?.organizer.id === CURRENT_USER_ID;

  if (!check) {
    return <div>Завантаження...</div>;
  }

  return (
    <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
      <div className="bg-white rounded-[24px] px-10 pt-7 pb-9">
        {" "}
        {/* Компонент 1: Заголовок */}
        <div className="mb-5">
          <CheckHeader title={check.title} isUserOrganizer={isUserOrganizer} />
        </div>
        {/* Компонент 2: Інформаційні блоки */}
        <div className="mb-6">
          <CheckInfoBlocks
            check={check}
            currentUserId={CURRENT_USER_ID}
            isUserOrganizer={isUserOrganizer}
          />
        </div>
        {/* Компонент 3: Таблиця */}
        <ParticipantsTable
          scenario={check.scenario}
          participants={check.participants}
          currentUserId={CURRENT_USER_ID}
          organizerId={check.organizer.id}
          scenarioMarginBottom="mb-6"
          totalExpenses={check.totalExpenses}
        />
        {/* Компонент 4: Логіка оплати */}
        <PaymentSection
          check={check}
          currentUserData={currentUserParticipant}
        />
      </div>
    </div>
  );
}
