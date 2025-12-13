import React, { useState, useMemo, useEffect } from "react";
import searchIcon from "../assets/icons/searchIcon.png";
import filterIcon from "../assets/icons/filterIcon.png";
import CheckCard from "../components/CheckCards/CheckCard";
import { checksAPI } from "../api/checks";
import { usersAPI } from "../api/users";
import { getIdFromJWT } from "../utils/jwt"; 
import Loader from "../components/Reuse/Loader";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const pageNumbers = [];
  pageNumbers.push(1);
  let startPage = Math.max(2, currentPage - 1);
  let endPage = Math.min(totalPages - 1, currentPage + 1);
  if (startPage > 2) pageNumbers.push("...");
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
  if (endPage < totalPages - 1) pageNumbers.push("...");
  if (totalPages > 1) pageNumbers.push(totalPages);

  return (
    <div className="flex justify-center items-center gap-2">
      {pageNumbers.map((page, index) => {
        const isActive = page === currentPage;
        if (page === "...") return <span key={index} className="w-10 h-10 flex items-center justify-center text-[#6178C8]">...</span>;
        return (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg border font-semibold ${isActive ? "bg-[#B6CDFF] text-white border-[#B6CDFF]" : "bg-white text-[#6178C8] border-[#B6CDFF] hover:bg-gray-50"}`}
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
  const [usersMap, setUsersMap] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [tempFilters, setTempFilters] = useState({
    status: [],
    dateType: "",
    dateRange: { start: "", end: "" },
    currency: []
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: [],
    dateType: "",
    dateRange: { start: "", end: "" },
    currency: []
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);     
        const myId = getIdFromJWT();
        setCurrentUserId(myId);

        const [checksData, usersData] = await Promise.all([
          checksAPI.getAllChecks(),
          usersAPI.getAllUsers()
        ]);

        setChecks(checksData);
        const map = {};
        if (Array.isArray(usersData)) {
          usersData.forEach(user => {
            const userId = user.userId || user.id;
            const userName = user.userName || user.name || user.username || "Unknown";
            if (userId) {
                map[userId.toString()] = userName;
            }
          });
        }
        setUsersMap(map);

      } catch (err) {
        console.error("Помилка завантаження даних:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  const handleStatusChange = (status) => {
    setTempFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status) 
        ? prev.status.filter((s) => s !== status) 
        : [...prev.status, status]
    }));
  };

  const handleCurrencyChange = (currency) => {
    setTempFilters((prev) => ({
      ...prev,
      currency: prev.currency.includes(currency)
        ? prev.currency.filter((c) => c !== currency)
        : [...prev.currency, currency]
    }));
  };

  const handleDateTypeChange = (type) => {
    setTempFilters((prev) => ({ ...prev, dateType: type }));
  };

  const handleDateRangeChange = (field, value) => {
    setTempFilters((prev) => ({
      ...prev,
      dateRange: { ...prev.dateRange, [field]: value }
    }));
  };

  const resetFilters = () => {
    const emptyState = { status: [], dateType: "", dateRange: { start: "", end: "" }, currency: [] };
    setTempFilters(emptyState);
    setAppliedFilters(emptyState);
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setAppliedFilters(tempFilters);
    setCurrentPage(1);
  };


const filteredChecks = useMemo(() => {
    const hasStatusFilter = appliedFilters.status.length > 0;
    const hasCurrencyFilter = appliedFilters.currency.length > 0;
    const hasDateFilter = !!appliedFilters.dateType;
    const hasSearch = !!searchQuery.trim();

    if (!hasStatusFilter && !hasCurrencyFilter && !hasDateFilter && !hasSearch) {
      return checks;
    }

    return checks.filter((check) => {
      let matchesSearch = true;
      if (hasSearch) {
        const lowerQuery = searchQuery.toLowerCase();
        const checkName = (check.name || check.title || "").toLowerCase();
        matchesSearch = checkName.includes(lowerQuery);
      }
      let matchesStatus = true;
      if (hasStatusFilter) {
        const globalStatusOptions = ["активний", "закритий"];
        const myStatusOptions = ["непогашений", "частково погашений", "погашений"];

        const selectedGlobalFilters = appliedFilters.status
          .map((s) => s.toLowerCase())
          .filter((s) => globalStatusOptions.includes(s));

        const selectedPersonalFilters = appliedFilters.status
          .map((s) => s.toLowerCase())
          .filter((s) => myStatusOptions.includes(s));

        const checkGlobalStatus = (check.status || "").trim().toLowerCase();

        const myParticipantData = check.participants?.find(
          (p) => p.userId?.toString() === currentUserId?.toString()
        );
        const myPaymentStatus = (myParticipantData?.paymentStatus || "").trim().toLowerCase();

        const isGlobalMatch =
          selectedGlobalFilters.length === 0 ||
          selectedGlobalFilters.includes(checkGlobalStatus);

        const isPersonalMatch =
          selectedPersonalFilters.length === 0 ||
          selectedPersonalFilters.includes(myPaymentStatus);

        matchesStatus = isGlobalMatch && isPersonalMatch;
      }
      let matchesCurrency = true;
      if (hasCurrencyFilter) {
        matchesCurrency = appliedFilters.currency.includes(check.currency);
      }
      let matchesDate = true;
      if (hasDateFilter) {
        const checkDate = new Date(check.createdAt);
        const checkDateOnly = new Date(
          checkDate.getFullYear(),
          checkDate.getMonth(),
          checkDate.getDate()
        );
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (appliedFilters.dateType === "За цей тиждень") {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          matchesDate = checkDateOnly >= weekAgo && checkDateOnly <= today;
        } else if (appliedFilters.dateType === "За цей місяць") {
          matchesDate =
            checkDate.getMonth() === now.getMonth() &&
            checkDate.getFullYear() === now.getFullYear();
        } else if (appliedFilters.dateType === "За останні три місяці") {
          const threeMonthsAgo = new Date(today);
          threeMonthsAgo.setMonth(today.getMonth() - 3);
          matchesDate =
            checkDateOnly >= threeMonthsAgo && checkDateOnly <= today;
        } else if (appliedFilters.dateType === "За певний період") {
          const { start, end } = appliedFilters.dateRange;
          if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            matchesDate = checkDateOnly >= startDate && checkDateOnly <= endDate;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesCurrency && matchesDate;
    });
  }, [checks, usersMap, searchQuery, appliedFilters, currentUserId]);

  
  const checksPerPage = isFilterOpen ? 8 : 12;
  const totalPages = Math.ceil(filteredChecks.length / checksPerPage);

  const currentChecks = useMemo(() => {
    const start = (currentPage - 1) * checksPerPage;
    const end = start + checksPerPage;
    return filteredChecks.slice(start, end);
  }, [filteredChecks, currentPage, checksPerPage]);

  const handleFilterToggle = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const handlePageChange = (page) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="p-7 bg-[#B6CDFF] rounded-[32px]">
        <div className="bg-white rounded-[24px] pb-10 min-h-[600px] flex items-center justify-center">
          <Loader text="Завантаження даних..." />
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
      <div className="bg-white rounded-[24px] pb-10 min-h-[600px]">
        <h1 className="pt-7 text-center text-[32px] font-semibold text-gray-800">
          Мої чеки
        </h1>

        <div className="flex justify-between items-center mt-7 px-7">
          <div className="flex items-center w-[440px] h-[38px] border border-gray-300 rounded-lg px-4 bg-white text-[#5F6E99]">
            <input
              type="text"
              placeholder="Знайти за назвою чека або за іменем друга"
              className="flex-grow border-none outline-none bg-transparent placeholder-gray-500"
              value={searchQuery}
              onChange={handleSearchChange}
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

        <div className="grid grid-cols-3 gap-2 mt-6 px-7 items-start transition-all duration-300 ease-in-out">
            <div
                className={`grid ${
                  isFilterOpen
                    ? "grid-cols-2 col-span-2"
                    : "grid-cols-3 col-span-3"
                } gap-2 content-start transition-all duration-300 ease-in-out`}
            >
                {filteredChecks.length === 0 ? (
                    <div className="col-span-full h-[400px] flex items-center justify-center">
                        <p className="text-xl text-[#4B6C9A]">
                          {searchQuery || appliedFilters.status.length > 0 || appliedFilters.currency.length > 0 || appliedFilters.dateType
                            ? "Нічого не знайдено за вашими критеріями" 
                            : "Поки що у Вас немає чеків..."}
                        </p>
                    </div>
                ) : (
                    currentChecks.map((check) => (
                        <CheckCard key={check.ebillId} check={check} />
                    ))
                )}
            </div>

            {isFilterOpen && (
                <div className="col-span-1 border-2 border-[#456DB4] rounded-lg p-4 bg-white h-fit">
                  <h3 className="text-center text-[20px] font-bold text-[#456DB4]">
                    Фільтри
                  </h3>

                  {/* СТАТУСИ */}
                  <div className="flex flex-col">
                    <h4 className="text-[#042860] text-left  text-[16px] font-semibold mt-[24px] mb-[12px]">
                      За статусом
                    </h4>
                    <div className="flex flex-col gap-[8px]">
                      {[
                        "Активний",
                        "Закритий",
                        "Непогашений",
                        "Частково погашений",
                        "Погашений",
                      ].map((status) => (
                        <label key={status} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={tempFilters.status.includes(status)}
                            onChange={() => handleStatusChange(status)}
                            className="appearance-none w-[20px] h-[20px] rounded border border-[#456DB4] checked:bg-[#456DB4] bg-center bg-no-repeat cursor-pointer flex-shrink-0"
                            style={{
                              backgroundImage: tempFilters.status.includes(status) 
                                ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")` 
                                : 'none'
                            }}
                          />
                          <span className="ml-3 text-[#456DB4] text-[12px] font-medium">
                            {status}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ДАТИ */}
                  <div className="flex flex-col">
                    <h4 className="text-[#042860] text-left  text-[16px] font-semibold mt-[24px] mb-[12px]">
                      За датою
                    </h4>
                    <div className="flex flex-col gap-[8px]">
                      {[
                        "За цей тиждень",
                        "За цей місяць",
                        "За останні три місяці",
                        "За певний період",
                      ].map((dateType) => (
                        <div key={dateType}>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="dateFilter"
                              checked={tempFilters.dateType === dateType}
                              onChange={() => handleDateTypeChange(dateType)}
                              className="appearance-none w-[20px] h-[20px] rounded-full border border-[#456DB4] checked:bg-[#456DB4] checked:border-4 checked:border-white ring-1 ring-transparent checked:ring-[#456DB4] cursor-pointer flex-shrink-0"
                            />
                            <span className="ml-3 text-[#456DB4] text-[12px] font-medium">
                              {dateType}
                            </span>
                          </label>

                          {dateType === "За певний період" &&
                            tempFilters.dateType === "За певний період" && (
                              <div className="flex items-center mt-[8px] ml-[2px]">
                                <input
                                  type="date"
                                  value={tempFilters.dateRange.start}
                                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                                  className="w-[96px] h-[36px] border border-[#B6CDFF] rounded px-2 text-[10px] text-[#456DB4] outline-none font-medium"
                                />
                                <span className="mx-[4px] text-[#456DB4] text-[12px] font-medium">
                                  до
                                </span>
                                <input
                                  type="date"
                                  value={tempFilters.dateRange.end}
                                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                                  className="w-[96px] h-[36px] border border-[#B6CDFF] rounded px-2 text-[10px] text-[#456DB4] outline-none font-medium"
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-[#042860] text-left  text-[16px] font-semibold mt-[24px] mb-[12px]">
                      За валютою
                    </h4>
                    <div className="flex flex-row gap-[16px]">
                      {["UAH", "USD", "EUR"].map((currency) => (
                        <label key={currency} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tempFilters.currency.includes(currency)}
                            onChange={() => handleCurrencyChange(currency)}
                            className="appearance-none w-[20px] h-[20px] rounded border border-[#456DB4] checked:bg-[#456DB4] bg-center bg-no-repeat cursor-pointer flex-shrink-0"
                            style={{
                              backgroundImage: tempFilters.currency.includes(currency) 
                                ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")` 
                                : 'none'
                            }}
                          />
                          <span className="ml-2 text-[#456DB4] text-[12px] font-medium">
                            {currency}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex  mt-[28px] px-4 gap-16">
                    <button
                      onClick={applyFilters}
                      className="w-[120px] h-[44px] bg-[#456DB4] text-white rounded-lg text-[12px] font-semibold hover:bg-[#365691] transition-colors"
                    >
                      Застосувати
                    </button>
                    <button
                      onClick={resetFilters}
                      className="w-[120px] h-[44px] bg-[#456DB4] text-white rounded-lg text-[12px] font-semibold hover:bg-[#365691] transition-colors"
                    >
                      Скинути
                    </button>
                  </div>
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

      </div>
    </div>
  );
}