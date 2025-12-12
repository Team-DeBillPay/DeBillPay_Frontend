import React, { useState, useMemo, useEffect } from "react";
import searchIcon from "../assets/icons/searchIcon.png";
import filterIcon from "../assets/icons/filterIcon.png";
import CheckCard from "../components/CheckCards/CheckCard";
import { checksAPI } from "../api/checks";
import { getIdFromJWT } from "../utils/jwt";
import Loader from "../components/Reuse/Loader";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const pageNumbers = [];

  pageNumbers.push(1);

  let startPage = Math.max(2, currentPage - 1);
  let endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) {
    pageNumbers.push("...");
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (endPage < totalPages - 1) {
    pageNumbers.push("...");
  }

  if (totalPages > 1) {
    pageNumbers.push(totalPages);
  }

  return (
    <div className="flex justify-center items-center gap-2">
      {pageNumbers.map((page, index) => {
        const isActive = page === currentPage;
        if (page === "...") {
          return (
            <span
              key={index}
              className="w-10 h-10 flex items-center justify-center text-[#6178C8]"
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
  const [checks, setChecks] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChecks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const checksData = await checksAPI.getAllChecks();
        setChecks(checksData);
      } catch (err) {
        console.error("Помилка завантаження чеків:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadChecks();
  }, []);

  const checksPerPage = isFilterOpen ? 8 : 12;

  const totalPages = Math.ceil(checks.length / checksPerPage);

  const currentChecks = useMemo(() => {
    const start = (currentPage - 1) * checksPerPage;
    const end = start + checksPerPage;
    return checks.slice(start, end);
  }, [checks, currentPage, checksPerPage]);

  const handleFilterToggle = () => {
    setIsFilterOpen((prev) => !prev);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
        <div className="bg-white rounded-[24px] pb-10 min-h-[600px] flex items-center justify-center">
          <Loader text="Завантаження сторінки..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
        <div className="bg-white rounded-[24px] pb-10 min-h-[600px] flex items-center justify-center">
          <p className="text-xl text-red-600">Помилка: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
      <div className="bg-white rounded-[24px] pb-10">
        <h1 className="pt-7 text-center text-[32px] font-semibold text-gray-800">
          Мої чеки
        </h1>

        <div className="flex justify-between items-center mt-7 px-7">
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

        {checks.length === 0 ? (
          <div className="w-[936px] h-[571px] flex items-center justify-center mx-auto">
            <p className="text-xl text-[#4B6C9A]">
              Поки що у Вас немає чеків...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mt-6 px-7 transition-all duration-300 ease-in-out">
              <div
                className={`grid ${
                  isFilterOpen
                    ? "grid-cols-2 col-span-2"
                    : "grid-cols-3 col-span-3"
                } gap-2 transition-all duration-300 ease-in-out`}
              >
                {currentChecks.map((check) => (
                  <CheckCard key={check.ebillId} check={check} />
                ))}
              </div>

              {isFilterOpen && (
                <div className="col-span-1 border-2 border-[#456DB4] rounded-lg p-4 text-[#6178C8]">
                  <h3 className="text-lg font-semibold mb-4">Фільтри</h3>
                  <p>Тут будуть опції фільтрації...</p>
                </div>
              )}
            </div>

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
