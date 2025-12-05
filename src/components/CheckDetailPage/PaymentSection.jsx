import React, { useState, useEffect, useMemo } from "react";

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
        (currentUserData.assignedAmount || 0) -
        (currentUserData.paidAmount || 0);
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
    if (check.status === "закритий") {
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

export default PaymentSection;