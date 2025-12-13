import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import returnBackIcon from "../assets/icons/returnback.png";
import Loader from "../components/Reuse/Loader";
import { getIdFromJWT } from "../utils/jwt";
import { checksAPI } from "../api/checks";

const CURRENT_USER_ID = "user-123";

const mockComments = [
  {
    id: 1,
    userId: "user-789",
    userName: "Джоніс Золото",
    message: "Привіт! Я додав свої витрати за таксі.",
    createdAt: "14:30",
  },
  {
    id: 2,
    userId: "user-123",
    userName: "Владислав Якубець",
    message: "Чудово, дякую! Я перевірю.",
    createdAt: "14:32",
  },
  {
    id: 3,
    userId: "user-456",
    userName: "Віталя П.",
    message: "А хто купував воду? Я не бачу її в чеку.",
    createdAt: "14:45",
  },
  {
    id: 4,
    userId: "user-123",
    userName: "Владислав Якубець",
    message:
      "Здається, Яся купувала. Зараз додам. Влад, ти ще мені повинен кругленьку суму",
    createdAt: "14:50",
  },
  {
    id: 5,
    userId: "user-101",
    userName: "Яся Аналітік",
    message:
      "Так, це була я. Там 50 грн. Ще хотіла сказати, що я віддам свій борг найближчим часом. Скоро стипендія прийде і віддам",
    createdAt: "15:00",
  },
];

const formatTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "";
  }
};

const CommentItem = ({ comment, isCurrentUser }) => {
  return (
    <div
      className={`flex flex-col mb-4 w-full ${
        isCurrentUser ? "items-end" : "items-start"
      }`}
    >
      <span className="text-[#021024] text-[16px] mb-1 font-medium">
        {isCurrentUser ? "Ви" : comment.userName}
      </span>

      <div
        className={`
          max-w-[80%] rounded-[12px] p-[12px] text-[16px] leading-relaxed text-left
          ${
            isCurrentUser
              ? "bg-[#456DB4] text-white rounded-tr-none"
              : "bg-[#B6CDFF] text-[#042860] rounded-tl-none"
          }
        `}
      >
        {comment.message}
      </div>

      <span className="text-[#7B9CCA] text-[12px] mt-1">
        {formatTime(comment.createdAt)}
      </span>
    </div>
  );
};

const CommentInput = ({ onSend, isSending }) => {
  const [text, setText] = useState("");

  const handleSendClick = () => {
    if (text.trim().length > 0 && !isSending) {
      onSend(text);
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const isButtonActive = text.trim().length > 0 && !isSending;

  return (
    <div className="mt-[28px] w-[492px] h-[114px] border border-[#D1D4E8] rounded-[24px] p-[24px] relative bg-white flex flex-col flex-shrink-0">
      <textarea
        className="w-full h-full resize-none outline-none text-[#021024] placeholder-[#979AB7] text-[16px] bg-transparent"
        placeholder="Напишіть коментар..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSending}
      />

      <button
        onClick={handleSendClick}
        disabled={!isButtonActive}
        className="absolute bottom-[16px] right-[16px] transition-all duration-200"
        title="Надіслати"
      >
        <img
          src={returnBackIcon}
          alt="Надіслати"
          className={`w-[32px] h-[32px] transform rotate-180 ${
            isButtonActive ? "" : "grayscale opacity-50"
          }`}
        />
      </button>
    </div>
  );
};

export default function CheckCommentsPage() {
  const { ebillId } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [usersCache, setUsersCache] = useState({});
  const currentUserId = getIdFromJWT();

  const getUserName = async (userId) => {
    if (usersCache[userId]) return usersCache[userId];

    if (userId.toString() === currentUserId?.toString()) return "Ви";

    try {
      const user = await usersAPI.getUserById(userId);
      const userName =
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        `Користувач ${userId}`;

      setUsersCache((prev) => ({ ...prev, [userId]: userName }));
      return userName;
    } catch (err) {
      console.error(`Помилка отримання імені ${userId}:`, err);
      return `Користувач ${userId}`;
    }
  };

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        setError(null);

        const commentsData = await checksAPI.getComments(ebillId);

        const enrichedComments = await Promise.all(
          commentsData.map(async (comment) => {
            let userName;
            let userId = comment.userId || comment.user?.userId;

            if (comment.user && comment.user.firstName) {
              userName =
                `${comment.user.firstName} ${comment.user.lastName}`.trim();
            } else if (userId) {
              userName = await getUserName(userId);
            } else {
              userName = "Невідомий";
            }

            return {
              ...comment,
              id:
                comment.commentId ||
                comment.ebillCommentId ||
                comment.id ||
                Math.random(),
              userId: userId,
              userName,
              message: comment.text || comment.message,
            };
          })
        );

        enrichedComments.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        setComments(enrichedComments);
      } catch (err) {
        console.error("Помилка завантаження коментарів:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (ebillId) {
      loadComments();
    }

  }, [ebillId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleBack = () => {
    navigate(`/checks/${ebillId}`);
  };

  const handleSendComment = async (text) => {
    setIsSending(true);
    try {
      const newCommentData = await checksAPI.createComment(ebillId, text);

      const newComment = {
        id: newCommentData.commentId,
        userId: newCommentData.user.userId,
        userName:
          `${newCommentData.user.firstName} ${newCommentData.user.lastName}`.trim(),
        message: newCommentData.text,
        createdAt: newCommentData.createdAt,
      };

      setComments((prev) => [...prev, newComment]);
    } catch (err) {
      console.error("Помилка відправки:", err);
      alert("Не вдалося відправити коментар");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-7 bg-[#B6CDFF] rounded-[32px] h-full flex flex-col">
      <div className="bg-white rounded-[24px] px-10 pt-7 pb-9 h-full flex flex-col items-center">
        <div className="relative flex items-center justify-center mb-7 flex-shrink-0 w-full">
          <button
            onClick={handleBack}
            className="absolute left-0 text-3xl text-[#052659]"
            title="Повернутися до деталей чеку"
          >
            <img
              src={returnBackIcon}
              alt="Повернутися"
              className="w-[32px] h-[32px]"
            />
          </button>
          <h1 className="text-center text-[32px] text-[#021024] font-semibold">
            Коментарі до чеку
          </h1>
        </div>

        <div className="w-[492px] h-[476px] overflow-y-auto custom-scrollbar flex flex-col pr-2">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[#042860]">
              Завантаження...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-600">
              Помилка: {error}
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isCurrentUser={
                  comment.userId?.toString() === currentUserId?.toString()
                }
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-[#979AB7]">
              Поки немає коментарів.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <CommentInput onSend={handleSendComment} isSending={isSending} />
      </div>
    </div>
  );
}
