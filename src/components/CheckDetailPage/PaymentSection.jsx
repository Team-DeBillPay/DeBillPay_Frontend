import React, { useEffect, useMemo, useState } from "react";
import { paymentsAPI } from "../../api/payments";

const LIQPAY_CHECKOUT_URL = "https://www.liqpay.ua/api/3/checkout";

const PaymentSection = ({
  check,
  ebillId,
  currentUserData,
  currency,
  isUserOrganizer,
  onRefresh,
}) => {
  const [paymentType, setPaymentType] = useState("full");
  const [partialAmount, setPartialAmount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const [payLoading, setPayLoading] = useState(false);

  const userDebt = useMemo(() => {
    if (!currentUserData) return 0;

    const assigned = Number(currentUserData.assignedAmount || 0);
    const alreadyPaid = Number(currentUserData.balance || 0);

    const debt = assigned - alreadyPaid;
    return debt > 0 ? debt : 0;
  }, [currentUserData]);

  useEffect(() => {
    setPartialAmount(userDebt);
    setInputValue("");
    setError("");
  }, [userDebt]);

  const shouldShowPaymentSection = useMemo(() => {
    if (check.status === "закритий") return false;

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

    if (Number.isNaN(numValue)) {
      setError("Будь ласка, введіть число.");
      return;
    }

    if (numValue > userDebt) {
      setError(`Сума не може перевищувати ваш борг: ${userDebt} ${currency}`);
    } else if (numValue <= 0) {
      setError("Сума має бути більшою за 0.");
    } else {
      setError("");
      setPartialAmount(numValue);
    }
  };

  const submitLiqPayForm = ({ data, signature }) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = LIQPAY_CHECKOUT_URL;
    form.acceptCharset = "utf-8";

    const dataInput = document.createElement("input");
    dataInput.type = "hidden";
    dataInput.name = "data";
    dataInput.value = data;

    const signInput = document.createElement("input");
    signInput.type = "hidden";
    signInput.name = "signature";
    signInput.value = signature;

    form.appendChild(dataInput);
    form.appendChild(signInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const handlePayment = async () => {
    if (!ebillId) return;

    const amountToPay =
      paymentType === "full" ? userDebt : Number(partialAmount || 0);

    if (amountToPay <= 0) {
      setError("Немає суми для оплати.");
      return;
    }

    if (amountToPay > userDebt) {
      setError(`Сума не може перевищувати ваш борг: ${userDebt} ${currency}`);
      return;
    }

    try {
      setPayLoading(true);
      setError("");

      sessionStorage.setItem(
        "liqpay_payment_pending",
        JSON.stringify({ ebillId: Number(ebillId), ts: Date.now() })
      );

      const res = await paymentsAPI.create({
        ebillId: Number(ebillId),
        amount: amountToPay,
      });

      const redirectUrl =
        res.checkoutUrl || res.redirectUrl || res.url || res.liqpayUrl;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      if (res.data && res.signature) {
        submitLiqPayForm({ data: res.data, signature: res.signature });
        return;
      }

      throw new Error(
        "Бекенд повернув невідомий формат відповіді для LiqPay (немає data/signature або url)."
      );
    } catch (e) {
      setError(e.message || "Помилка створення платежу");
      sessionStorage.removeItem("liqpay_payment_pending");
    } finally {
      setPayLoading(false);
    }
  };

  useEffect(() => {
    const tryRefreshAfterPayment = async () => {
      const raw = sessionStorage.getItem("liqpay_payment_pending");
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        if (Number(parsed.ebillId) !== Number(ebillId)) return;

        const ageMs = Date.now() - Number(parsed.ts || 0);
        if (ageMs > 15 * 60 * 1000) {
          sessionStorage.removeItem("liqpay_payment_pending");
          return;
        }

        if (typeof onRefresh === "function") {
          await onRefresh();
        }
      } finally {
        sessionStorage.removeItem("liqpay_payment_pending");
      }
    };

    const onFocus = () => tryRefreshAfterPayment();
    const onVisibility = () => {
      if (document.visibilityState === "visible") tryRefreshAfterPayment();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    tryRefreshAfterPayment();

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ebillId, onRefresh]);

  if (!shouldShowPaymentSection) return null;

  return (
    <div className="mt-6 flex flex-col items-start">
      <div className="flex rounded-lg p-[3px] bg-[#456DB4]">
        <button
          className={`px-4 py-2 rounded ${
            paymentType === "full"
              ? "bg-[#EBF1FF] border border-[#021024]"
              : "bg-[#456DB4]"
          } text-[#042860]`}
          onClick={() => {
            setPaymentType("full");
            setError("");
          }}
          disabled={payLoading}
        >
          Повна оплата
        </button>
        <button
          className={`px-4 py-2 rounded ${
            paymentType === "partial"
              ? "bg-[#EBF1FF] border border-[#021024]"
              : "bg-[#456DB4]"
          } text-[#042860]`}
          onClick={() => {
            setPaymentType("partial");
            setError("");
            setPartialAmount(userDebt);
          }}
          disabled={payLoading}
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
              disabled={payLoading}
            />
            <span className="text-[#042860]">{currency}</span>
          </div>
          {error && <p className="text-red-600 text-sm mt-2 ml-4">{error}</p>}
        </div>
      )}

      {paymentType === "full" && error && (
        <p className="text-red-600 text-sm mt-4 ml-1">{error}</p>
      )}

      <div className="w-full flex justify-center">
        <button
          onClick={handlePayment}
          disabled={payLoading || userDebt <= 0 || (paymentType === "partial" && !!error)}
          className="mt-10 bg-[#456DB4] text-white rounded-[20px] py-4 px-[60px] font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {payLoading ? "Створення платежу..." : "Сплатити борг"}
        </button>
      </div>
    </div>
  );
};

export default PaymentSection;
