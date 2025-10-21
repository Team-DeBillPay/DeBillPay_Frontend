import React from "react";
import { Link } from "react-router-dom";
import downloadToSmartphone from "../assets/DownloadToSmartphone.png";
import timeIcon from "../assets/icons/time.png";
import monitorIcon from "../assets/icons/desktop.png";
import analyticsIcon from "../assets/icons/analytics.png";
import cardIcon from "../assets/icons/card.png";
import paymentScenarios from "../assets/PaymentScenarios.png";
import friends from "../assets/Friends.png";
import statuses from "../assets/Statuses.png";
import analyticsIllustration from "../assets/AnalyticsIllustration.png";
import platformImage from "../assets/PlatformImage.png";
import boxIcon from "../assets/icons/box.png";
import bookIcon from "../assets/icons/book.png";
import detailsIcon from "../assets/icons/details.png";
import diagramIcon from "../assets/icons/diagram.png";

const advantagesList = [
  { icon: timeIcon, text: "Швидке створення чеків для оплати" },
  { icon: monitorIcon, text: "Сума та оплата вираховується автоматично" },
  { icon: analyticsIcon, text: "Доступна аналітика" },
  { icon: cardIcon, text: "Оплата одразу всередині платформи" },
];

const scenariosData = [
  {
    title: "Спільний рахунок, оплата порівну",
    text: "Ви вечеряли з друзями, і одна людина заплатила за всіх? Просто створіть чек, додайте учасників, і система автоматично розділить суму порівну. Жодних складних розрахунків.",
  },
  {
    title: "Кожен платить за себе",
    text: "Інша ситуація: у ресторані кожен замовляв різні страви. У чеку ви можете вказати точну суму, яку винна кожна людина. Все чесно і прозоро.",
  },
  {
    title: "Спільний кошик витрат",
    text: "Збираєтесь на пікнік або у подорож, і кожен щось купує? Додавайте свої витрати до спільного чека. Платформа сама проаналізує внесок кожного і розрахує, хто кому має повернути гроші, щоб у підсумку всі витратили однакову суму.",
  },
];

const possibilitiesList = [
  { icon: boxIcon, text: "Усі чеки в одному місці" },
  { icon: bookIcon, text: "Історія розрахунків" },
  { icon: detailsIcon, text: "Деталізація кожного чека" },
  { icon: diagramIcon, text: "Візуальні підсумки" },
];

const steps = [
  { num: 1, text: "Створіть акаунт та додайте друзів" },
  { num: 2, text: "Створіть чек, обравши сценарій" },
  { num: 3, text: "Контролюйте статус чеку" },
  { num: 4, text: "Погашайте борги прямо в системі" },
  { num: 5, text: "Отримуйте сповіщення та нагадування" },
];

const leftSteps = steps.filter((_, index) => index % 2 === 0);
const rightSteps = steps.filter((_, index) => index % 2 !== 0);

const ScenarioCard = ({ title, text, className = "" }) => (
  <div
    className={`bg-[#C2E8FF] py-[24px] px-[40px] rounded-[24px] max-w-md ${className}`}
  >
    <h3 className="text-[20px] font-bold text-[#021024] mb-2">{title}</h3>
    <p className="text-[#021024] text-[18px]">{text}</p>
  </div>
);

const StepItem = ({ num, text }) => (
  <div className="flex items-center gap-x-5">
    <div className="flex-shrink-0 w-[75px] h-[75px] border-4 border-[#C2E8FF] rounded-full flex items-center justify-center">
      <span className="text-[#C2E8FF] text-[64px] font-serif mt-[-16px]">
        {num}
      </span>
    </div>
    <p className="text-white text-2xl">{text}</p>
  </div>
);

// 1) Головний вступ
const HeroSection = ({ isAuthenticated }) => {
  // Логіка для кнопки
  const buttonText = isAuthenticated ? "Продовжити роботу" : "Розпочати зараз";
  const buttonLink = isAuthenticated ? "/dashboard" : "/login";
  return (
    <>
      <div className="flex flex-row items-center justify-center text-[36px] text-white py-6">
        <p className="font-semibold mr-2">
          <span className="text-white">DeBill</span>
          <span className="text-[#259EEF]">Pay</span>
        </p>
        <p className="text-white">— це просто. Працюйте де вам зручно.</p>
      </div>
      <div className="flex justify-center items-center pb-[120px]">
        <div className="flex justify-center gap-40 px-[120px]">
          <div className="flex-col justify-start">
            <p className="text-[34px] text-left mt-[17px]">
              <span className="text-white">Більше ніяких </span>
              <span className="text-[#259EEF] italic font-bold">
                "ти мені скільки винен?"
              </span>
            </p>
            <p className="text-[22px] text-white text-left mt-4">
              DeBillPay допоможе швидко й зручно розраховуватись після спільних
              покупок чи поїздок.
            </p>
            <Link to={buttonLink}>
              <button className="mt-40 bg-[#C2E8FF] text-[#375783] text-[24px] font-bold rounded-[10px] py-5 w-full text-center cursor-pointer hover:text-[#259EEF]">
                {buttonText}
              </button>
            </Link>
          </div>
          <img
            src={downloadToSmartphone}
            alt="Завантажуйте DeBillPay на свій смартфон"
            className="w-[520px] h-[518.14px]"
          />
        </div>
      </div>
    </>
  );
};

// 2) Переваги платформи
const AdvantagesSection = () => (
  <div className="flex flex-col items-center w-full">
    <h1 className="text-[#259EEF] text-[48px] font-semibold text-center">
      Наші переваги
    </h1>
    <div className="flex flex-col sm:flex-row gap-16 sm:gap-[120px] justify-center mt-16 pb-[120px]">
      {advantagesList.map((item, index) => (
        <div key={index} className="flex flex-col items-center max-w-[215px]">
          <img
            src={item.icon}
            alt={item.text.substring(0, 20)}
            className="w-[70px] h-[70px] mb-[36px]"
          />
          <p className="text-[24px] text-white text-center">{item.text}</p>
        </div>
      ))}
    </div>
  </div>
);

// 3) Різні сценарії створення чеків
const ScenariosSection = () => (
  <div className="w-full">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">
        Один застосунок — безліч сценаріїв
      </h1>
      <p className="text-[24px] max-w-6xl mx-auto">
        Життя непередбачуване, і ваші спільні витрати також. Наша платформа
        адаптується до будь-якої ситуації, пропонуючи гнучкі способи розподілу
        коштів. Забудьте про калькулятор — ми все порахуємо за вас!
      </p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-items-center items-center">
      <ScenarioCard
        title={scenariosData[0].title}
        text={scenariosData[0].text}
        className="lg:col-start-1 lg:row-start-1"
      />
      <img
        src={paymentScenarios}
        alt="Сценарії оплати"
        className="lg:col-start-2 lg:row-start-1"
      />
      <ScenarioCard
        title={scenariosData[1].title}
        text={scenariosData[1].text}
        className="lg:col-start-3 lg:row-start-1"
      />
      <ScenarioCard
        title={scenariosData[2].title}
        text={scenariosData[2].text}
        className="lg:col-start-2 lg:row-start-2"
      />
    </div>
  </div>
);

// 4) Інформація про друзів
const FriendsInfoSection = () => (
  <div className="px-[60px] pt-[108px] flex justify-center">
    <div className="w-full bg-[#0088FE] rounded-[24px] text-center text-white">
      <h1 className="pt-[36px] text-[36px] font-bold">
        Ваші компанії друзів — тепер в одному місці
      </h1>
      <div className="mt-0">
        <img src={friends} alt="Company of friends" className="mx-auto" />
      </div>
      <p className="mt-4 pb-[36px] px-[60px] text-[28px]">
        Часто витрачаєте гроші з одними й тими ж людьми? Об'єднуйте їх у групи,
        щоб додавати до чеків в один клік та економити свій час.
      </p>
    </div>
  </div>
);

// 5) Статуси чеків
const StatusesInfoSection = () => (
  <div className="px-[20px] sm:px-[60px] pt-[108px] flex justify-center">
    <div className="w-full bg-[#C2E8FF] rounded-[24px] text-left px-[20px] sm:px-[60px] py-[36px] text-[#021024] flex flex-col sm:flex-row items-center justify-center">
      <div className="flex flex-col justify-center sm:h-[520px] mb-[24px] sm:mb-0 sm:mr-[24px]">
        <h1 className="text-[28px] sm:text-[36px] font-bold">
          Завжди знайте, на якому ви етапі
        </h1>
        <p className="mt-[32px] sm:mt-[40px] text-[24px] sm:text-[28px]">
          Ми створили просту та зрозумілу систему статусів, щоб ви ніколи не
          губилися у своїх розрахунках. Відстежуйте як загальний прогрес по
          чеку, так і стан ваших особистих боргів.
        </p>
      </div>
      <img
        src={statuses}
        alt="Statuses of debts"
        className="w-full sm:w-[520px] h-auto max-w-[520px]"
      />
    </div>
  </div>
);

// 6) Інформація про аналітику фінансів
const AnalyticsInfoSection = () => (
  <div className="px-[20px] sm:px-[60px] pt-[108px] flex justify-center">
    <div className="w-full bg-white rounded-[24px] text-left px-[20px] sm:px-[60px] py-[36px] text-[#021024] flex flex-col sm:flex-row items-center justify-center">
      <img
        src={analyticsIllustration}
        alt="Analytics illustration"
        className="w-full sm:w-[520px] h-auto max-w-[520px] mb-[20px] sm:mb-0"
      />
      <div className="flex flex-col justify-center text-center ml-[24px]">
        <h1 className="text-[28px] sm:text-[36px] font-bold">
          Аналізуйте витрати та тримайте баланс під контролем
        </h1>
        <p className="mt-[24px] sm:mt-[36px] mb-[24px] sm:mb-[36px] text-[18px] sm:text-[20px]">
          Наша платформа не просто фіксує борги, а й допомагає вам бачити повну
          картину ваших спільних фінансів. Уся важлива інформація зібрана на
          зручній інформаційній панелі.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[60px] gap-y-[36px] justify-center max-w-[560px] mx-auto">
          {possibilitiesList.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center max-w-[260px]"
            >
              <img
                src={item.icon}
                alt={item.text.substring(0, 20)}
                className="w-[52px] h-[52px] mb-[16px]"
              />
              <p className="text-[18px] sm:text-[20px] text-[#021024] text-center">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// 7) Як працює платформа
const HowItWorksSection = () => (
  <div className="w-full text-white py-[108px]">
    <h1 className="text-center text-[40px] font-bold mb-[60px]">
      Як працює наша платформа:
    </h1>
    <div className="px-6 lg:px-[120px]">
      <div className="hidden lg:flex justify-center items-center">
        <div className="flex flex-col gap-y-[155px]">
          {leftSteps.map((step) => (
            <StepItem key={step.num} num={step.num} text={step.text} />
          ))}
        </div>
        <img
          src={platformImage}
          alt="Як працює платформа"
          className="flex-shrink-0 mx-auto"
        />
        <div className="flex flex-col gap-y-[164px]">
          {rightSteps.map((step) => (
            <StepItem key={step.num} num={step.num} text={step.text} />
          ))}
        </div>
      </div>
      <div className="lg:hidden flex flex-col items-center gap-y-12">
        <img
          src={platformImage}
          alt="Як працює платформа"
          className="w-full max-w-xs"
        />
        <div className="flex flex-col gap-y-10">
          {steps.map((step) => (
            <StepItem key={step.num} num={step.num} text={step.text} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function MainPage({ isAuthenticated }) {
  return (
    <div>
      <HeroSection isAuthenticated={isAuthenticated} />
      <AdvantagesSection />
      <ScenariosSection />
      <FriendsInfoSection />
      <StatusesInfoSection />
      <AnalyticsInfoSection />
      <HowItWorksSection />
    </div>
  );
}
