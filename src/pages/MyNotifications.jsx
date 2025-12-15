import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { notificationsAPI } from "../api/notifications";
import Loader from "../components/Reuse/Loader.jsx";


const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const pageNumbers = [];
  
  if (totalPages === 0) return null;
  
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
            className={`w-10 h-10 rounded-lg border font-semibold ${
              isActive
                ? "bg-[#B6CDFF] text-white border-[#B6CDFF]"
                : "bg-white text-[#6178C8] border-[#B6CDFF] hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${hours}:${minutes} ${day}.${month}.${year}`;
  } catch (error) {
    return dateString;
  }
};

const getNotificationTitle = (type, message) => {
  const typeTitles = {
    friend_invitation: "Запрошення в друзі",
    full_payment: "Повне погашення",
    partial_payment: "Часткове погашення",
    added_to_ebill: "Додано до чеку",
    added_to_group: "Додано до групи",
    welcome: "Вітаємо!",
  };

  return message || typeTitles[type] || "Нове повідомлення";
};

const requiresAction = (type) => {
  return ["friend_invitation", "added_to_ebill", "added_to_group"].includes(type);
};

const NotificationBlock = ({ notification }) => {
  const { type, message, status, createdAt } = notification;
  const navigate = useNavigate();

  const isRead = status === "read";
  const title = getNotificationTitle(type, message);
  const formattedDate = formatDate(createdAt);

  const titleColor = isRead ? "text-[#495266]" : "text-black";
  const dateColor = isRead ? "text-[#4B6AA0]" : "text-[#042860]";

  const handleGoToClick = () => {
    if (type === "friend_invitation") {
      navigate("/friends");
    } else if (type === "added_to_ebill") {
      navigate("/checks");
    } else if (type === "added_to_group") {
      navigate("/friends", { state: { openGroups: true } });
    }
  };

  const renderBottomContent = () => {
    if (requiresAction(type)) {
      return (
        <button
          className="w-[116px] h-[38px] bg-[#042860] text-white text-[14px] font-semibold rounded-[12px] flex items-center justify-center"
          onClick={handleGoToClick}
        >
          Перейти
        </button>
      );
    } else {
      return (
        <span
          className={`text-[18px] font-semibold mr-[28px] ${
            isRead ? "text-[#495266]" : "text-[#042860]"
          }`}
        >
          {isRead ? "Прочитано" : "Нове повідомлення"}
        </span>
      );
    }
  };

  return (
    <div className="w-[424px] h-[134px] bg-[#B6CDFF] rounded-[16px] flex flex-col justify-between p-0 m-0 shrink-0">
      <div className="flex justify-between mt-[20px] ml-[28px] mr-[28px]">
        <p
          className={`text-[18px] text-left font-semibold ${titleColor} line-clamp-2 leading-tight flex-grow mr-4`}
        >
          {title}
        </p>
        <span className={`text-[14px] font-normal ${dateColor} flex-shrink-0`}>
          {formattedDate}
        </span>
      </div>
      <div className="flex justify-end items-center mb-[20px] mr-[20px]">
        {renderBottomContent()}
      </div>
    </div>
  );
};

export default function MyNotifications() {
  const { updateUnreadCount } = useOutletContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const latestNotificationsRef = useRef([]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsAPI.getAllNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Помилка завантаження повідомлень:", err);
      setError(err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    latestNotificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    const unreadCount = notifications.filter(
      (n) => n.status === "unread"
    ).length;
    updateUnreadCount(unreadCount);
  }, [notifications, updateUnreadCount]);

  useEffect(() => {
    return () => {
      const allNotifications = latestNotificationsRef.current || [];
      const unreadIds = allNotifications
        .filter((n) => n.status === "unread")
        .map((n) => n.id);

      if (unreadIds.length === 0) {
        updateUnreadCount(0);
        return;
      }

      notificationsAPI
        .markMultipleAsRead(unreadIds)
        .catch((err) => {
          console.error(
            "Помилка при збереженні прочитаних повідомлень:",
            err
          );
        })
        .finally(() => {
          updateUnreadCount(0);
        });
    };
  }, [updateUnreadCount]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [notifications]);

  const currentNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedNotifications.slice(start, end);
  }, [sortedNotifications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedNotifications.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const column1 = currentNotifications.filter((_, index) => index % 2 === 0);
  const column2 = currentNotifications.filter((_, index) => index % 2 !== 0);

  return (
    <div
      className="
        bg-[#B6CDFF] rounded-[32px] mx-auto flex justify-center items-start
        w-[992px] h-[842px] mt-[20px] mb-[44px]
      "
    >
      <div
        className="
          bg-white rounded-[16px] flex flex-col items-center relative
          w-[936px] h-[779px] pt-[28px] pb-[28px] mt-[28px]
        "
      >
        <h1 className="text-[32px] font-semibold text-[#021024] text-center mb-[28px]">
          Мої повідомлення
        </h1>

        <div className="flex-grow flex justify-center gap-[8px] w-full">
          {loading ? (
            <Loader text="Завантаження сторінки..." />
          ) : error ? (
            <div className="mt-[60px] flex-1 flex flex-col justify-center items-center text-center px-4">
              <p className="text-red-600 text-[18px] mb-4">{error}</p>
              <button
                onClick={loadNotifications}
                className="w-[200px] h-[40px] bg-[#042860] text-white text-[16px] font-semibold rounded-[12px]"
              >
                Спробувати ще раз
              </button>
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className="mt-[60px] flex-1 flex flex-col justify-center items-center text-center px-4">
              <p className="text-[#4B6C9A] text-[18px]">
                Поки що у Вас немає жодного повідомлення...
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-[8px]">
                {column1.map((notification) => (
                  <NotificationBlock
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-[8px]">
                {column2.map((notification) => (
                  <NotificationBlock
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
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
