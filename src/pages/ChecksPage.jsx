import React, { useState, useMemo } from "react";
import searchIcon from "../assets/icons/searchIcon.png";
import filterIcon from "../assets/icons/filterIcon.png";
import CheckCard from "../components/CheckCard";

const CURRENT_USER_ID = "user-123";

const mockChecks = [
  ...Array(20)
    .fill(0)
    .map((_, i) => ({
      id: `check-${i + 1}`,
      title: `Пікнік ${i + 1}`,
      date: `12.10.2025`,
      organizerId: i % 3 === 0 ? "user-123" : `user-${456 + i}`,
      paymentStatus: ["paid", "partial", "unpaid"][i % 3],
      lockStatus: i % 2 === 0 ? "closed" : "open",
    })),
];

/**
 * Компонент Пагінації
 */
const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const pageNumbers = [];

  if (totalPages <= 3) {
    // Якщо сторінок 3 або менше, показуємо всі
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Логіка для "1, 2, ... 5"
    pageNumbers.push(1);
    if (currentPage > 2) {
      pageNumbers.push("...");
    }
    if (currentPage > 1 && currentPage < totalPages) {
      pageNumbers.push(currentPage);
    } else if (currentPage === 1) {
      pageNumbers.push(2);
    } else if (currentPage === totalPages && totalPages > 2) {
      pageNumbers.push(totalPages - 1);
    }
    if (currentPage < totalPages - 1) {
      pageNumbers.push("...");
    }
    pageNumbers.push(totalPages);
  }

  // Видаляємо дублікати "...", якщо вони поруч
  const finalPages = pageNumbers.filter((page, index) => {
    return page !== "..." || pageNumbers[index - 1] !== "...";
  });

  return (
    <div className="flex justify-center items-center gap-2">
      {finalPages.map((page, index) => {
        const isActive = page === currentPage;
        if (page === "...") {
          return (
            <span
              key={index}
              className="w-10 h-10 flex items-center justify-center"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`
              w-10 h-10 rounded-lg border font-semibold
              ${
                isActive
                  ? "bg-[#B6CDFF] text-white border-[#B6CDFF]"
                  : "bg-white text-[#6178C8] border-[#B6CDFF] hover:bg-gray-50"
              }
            `}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
};

export default function MyChecksPage() {
  // --- Стан (State) ---
  const [checks, setChecks] = useState(mockChecks);
  //   const [checks, setChecks] = useState([]); // <-- Для тесту "Поки що немає"
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Обчислювана Логіка ---
  // Визначаємо, скільки чеків на сторінці, залежно від фільтра
  const checksPerPage = isFilterOpen ? 8 : 12;

  // Загальна кількість сторінок
  const totalPages = Math.ceil(checks.length / checksPerPage);

  // Обчислюємо, які чеки показати на поточній сторінці
  const currentChecks = useMemo(() => {
    const start = (currentPage - 1) * checksPerPage;
    const end = start + checksPerPage;
    return checks.slice(start, end);
  }, [checks, currentPage, checksPerPage]);

  // --- Обробники Подій ---
  const handleFilterToggle = () => {
    setIsFilterOpen((prev) => !prev);
    // При зміні фільтра, повертаємось на 1-шу сторінку
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  return (
    <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
      <div className="bg-white rounded-[24px] pb-10">
        {/* Заголовок */}
        <h1 className="pt-7 text-center text-[32px] font-semibold text-gray-800">
          Мої чеки
        </h1>

        {/* Блок Пошуку та Фільтра */}
        <div className="flex justify-between items-center mt-7 px-7">
          {/* Блок пошуку з фіксованими розмірами */}
          <div className="flex items-center w-[440px] h-[38px] border border-gray-300 rounded-lg px-4 bg-white text-[#5F6E99]">
            <input
              type="text"
              placeholder="Знайти за назвою чека або за іменем друга"
              className="flex-grow border-none outline-none bg-transparent placeholder-gray-500"
            />
            <button type="button" className="ml-8 flex-shrink-0">
              <img src={searchIcon} alt="Пошук" className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleFilterToggle}
            className="flex items-center gap-3 text-[#5F6E99] text-base font-semibold underline"
          >
            <span>Фільтрувати</span>
            <img src={filterIcon} alt="Фільтр" className="w-[24px] h-[24px]" />
          </button>
        </div>

        {/* --- Основний Контент --- */}

        {checks.length === 0 ? (
          // ----- Стан 1: Чеків Немає -----
          <div className="w-[936px] h-[571px] flex items-center justify-center mx-auto">
            <p className="text-xl text-[#4B6C9A]">
              Поки що у Вас немає чеків...
            </p>
          </div>
        ) : (
          // ----- Стан 2: Чеки Є -----
          <>
            {/* Контейнер для сітки та фільтра */}
            <div className="grid grid-cols-3 gap-2 mt-6 px-7 transition-all duration-300 ease-in-out">
              {/* Сітка чеків */}
              {/* Займає 2 або 3 колонки, залежно від фільтра */}
              <div
                className={`grid ${
                  isFilterOpen
                    ? "grid-cols-2 col-span-2"
                    : "grid-cols-3 col-span-3"
                } gap-2 transition-all duration-300 ease-in-out`}
              >
                {currentChecks.map((check) => (
                  <CheckCard key={check.id} check={check} />
                ))}
              </div>

              {/* Блок Фільтра */}
              {/* З'являється і займає 1 колонку */}
              {isFilterOpen && (
                <div className="col-span-1 border-2 border-[#456DB4] rounded-lg p-4 text-[#6178C8]">
                  <h3 className="text-lg font-semibold mb-4">Фільтри</h3>
                  <p>Тут будуть опції фільтрації...</p>
                </div>
              )}
            </div>

            {/* Блок Пагінації */}
            {/* З'являється, тільки якщо сторінок більше однієї */}
            {totalPages > 1 && (
              <div className="mt-9">
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
