import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

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
            <span key={index} className="w-10 h-10 flex items-center justify-center text-[#6178C8]">
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
const parseDate = (dateStr) => {
  const [time, date] = dateStr.split(" ");
  const [hours, minutes] = time.split(":");
  const [day, month, year] = date.split(".");
  return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
};

const initialNotificationsData = [
  { id: 1, type: "comment_added", title: 'Новий коментар у чеку "Піца": "Я заплачу за напої"', date: "14:35 01.11.25", isRead: false },
  { id: 2, type: "check_invite", title: 'Вас додали до чеку: "Вечеря в суботу"', date: "16:00 30.10.25", isRead: false },
  { id: 3, type: "repayment_made", title: 'Білий переказав вам 200 грн за чек "Таксі"', date: "12:00 01.11.25", isRead: false },
  { id: 4, type: "expense_added", title: 'Марія додала витрату "Продукти" (500 грн) у групу "Карпати"', date: "10:15 01.11.25", isRead: false },
  { id: 5, type: "group_invite", title: 'Вас запросили до групи: "Подорож в гори"', date: "09:30 31.10.25", isRead: false },
  { id: 6, type: "friend_invite", title: "Вас запросили до друзів: Ірина Афанасьєва", date: "18:20 30.10.25", isRead: true },
  { id: 7, type: "account_created", title: "Вітаємо! Ваш акаунт успішно створено.", date: "09:00 01.01.25", isRead: true },
  { id: 8, type: "repayment_made", title: 'Ви погасили борг у чеку "Кавуся"', date: "14:00 29.10.25", isRead: true },
  { id: 9, type: "comment_added", title: 'Новий коментар від Чорного: "Дякую!"', date: "13:00 29.10.25", isRead: true },
  { id: 10, type: "expense_added", title: 'Додано витрату "Квитки" у групу "Кіно"', date: "12:00 28.10.25", isRead: true },
];
const NotificationBlock = ({ notification, onMarkAsRead, onAction }) => {
  const { id, type, title, date, isRead } = notification;
  const titleColor = isRead ? "text-[#495266]" : "text-black";
  const dateColor = isRead ? "text-[#4B6AA0]" : "text-[#042860]";
  const handleMarkReadClick = () => {
    if (!isRead) onMarkAsRead(id);
  };
  const handleActionClick = (action) => {
    onAction(id, action);
  };
  const isActionableInvite = ["friend_invite", "group_invite"].includes(type);
  const renderBottomContent = () => {
    if (isActionableInvite) {
      if (isRead) {
        return <span className="text-[18px] font-semibold text-[#495266]" style={{ marginRight: "28px" }}>Прочитано</span>;
      } else {
        return (
          <div className="flex" style={{ marginRight: "20px" }}>
            <button
              className="w-[116px] h-[38px] bg-[#042860] text-white text-[14px] font-semibold rounded-[12px] flex items-center justify-center"
              style={{ marginLeft: "160px" }}
              onClick={() => handleActionClick("accept")}
            >
              Прийняти
            </button>
            <button
              className="w-[116px] h-[38px] bg-[#042860] text-white text-[14px] font-semibold rounded-[12px] flex items-center justify-center"
              style={{ marginLeft: "12px", marginRight: "0px" }}
              onClick={() => handleActionClick("reject")}
            >
              Відхилити
            </button>
          </div>
        );
      }
    } else {
      if (!isRead) {
        return (
          <button
            className="w-[212px] h-[38px] bg-[#042860] text-white text-[16px] font-semibold rounded-[12px]"
            style={{ marginLeft: "192px", marginRight: "20px" }}
            onClick={handleMarkReadClick}
          >
            Позначити як прочитане
          </button>
        );
      } else {
        return <span className="text-[18px] font-semibold text-[#495266]" style={{ marginRight: "28px" }}>Прочитано</span>;
      }
    }
  };

  return (
    <div className="w-[424px] h-[134px] bg-[#B6CDFF] rounded-[16px] flex flex-col justify-between p-0 m-0 shrink-0">
      <div className="flex justify-between" style={{ marginTop: "20px", marginLeft: "28px", marginRight: "28px" }}>
        <p className={`text-[18px] text-left font-semibold ${titleColor} line-clamp-2 leading-tight`}>
          {title}
        </p>
        <span className={`text-[14px] font-normal ${dateColor} flex-shrink-0 ml-2`}>{date}</span>
      </div>
      <div className="flex justify-end items-center" style={{ marginBottom: "20px" }}>
        {renderBottomContent()}
      </div>
    </div>
  );
};

export default function MyNotifications() {
  const { updateUnreadCount } = useOutletContext();
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("myNotifications_v3");
    if (saved) {
        return JSON.parse(saved);
    }
    return initialNotificationsData;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  useEffect(() => {
    localStorage.setItem("myNotifications_v3", JSON.stringify(notifications));
    const currentUnreadCount = notifications.filter(n => !n.isRead).length;
    updateUnreadCount(currentUnreadCount);
  }, [notifications, updateUnreadCount]);
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      return parseDate(b.date) - parseDate(a.date);
    });
  }, [notifications]);
  const currentNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedNotifications.slice(start, end);
  }, [sortedNotifications, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(sortedNotifications.length / itemsPerPage);
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };
  const handleAction = (id, action) => {
    console.log(`Notification ID: ${id}, Action: ${action}`);
    const notificationToMark = notifications.find(n => n.id === id);
    if (notificationToMark && !notificationToMark.isRead) {
      markAsRead(id);
    }
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const column1 = currentNotifications.filter((_, index) => index % 2 === 0);
  const column2 = currentNotifications.filter((_, index) => index % 2 !== 0);
  const desiredMarginTop = 20;
  return (
    <div
      className="bg-[#B6CDFF] rounded-[32px] mx-auto flex justify-center items-start" 
      style={{ width: "992px", height: "842px", marginTop: `${desiredMarginTop}px`, marginBottom: "44px" }}
    >
      <div
        className="bg-white rounded-[16px] flex flex-col items-center relative"
        style={{ width: "936px", height: "779px", paddingTop: "28px", paddingBottom: "28px", marginTop: "28px" }}
      >
        <h1 className="text-[32px] font-semibold text-[#021024] text-center" style={{ marginBottom: "28px" }}>
          Мої повідомлення
        </h1>
        <div className="flex-grow flex justify-center gap-[8px] w-full">
           {sortedNotifications.length === 0 ? (
              <div className="mt-[60px] flex-1 flex flex-col justify-start items-center text-center px-4">
                <p className="text-[#4B6C9A] text-[18px]">
                  Поки що у Вас немає жодного повідомлення...
                </p>
              </div>
           ) : (
             <>
                <div className="flex flex-col gap-[8px]">
                  {column1.map((n) => (
                    <NotificationBlock key={n.id} notification={n} onMarkAsRead={markAsRead} onAction={handleAction} />
                  ))}
                </div>
                <div className="flex flex-col gap-[8px]">
                  {column2.map((n) => (
                    <NotificationBlock key={n.id} notification={n} onMarkAsRead={markAsRead} onAction={handleAction} />
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