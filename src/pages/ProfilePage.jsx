import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usersAPI } from "../api/users";
import { getIdFromJWT, getJWT } from "../utils/jwt";
import iconProfile from "../assets/icons/iconProfile.png";
import iconClosed from "../assets/icons/closed.png";
import iconActive from "../assets/icons/active.png";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "********",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    general: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userId = getIdFromJWT();
      
      if (!userId) {
        throw new Error("Користувач не авторизований");
      }

      const userDataFromApi = await usersAPI.getUserById(userId);
      
      setUserData({
        firstName: userDataFromApi.firstName || "",
        lastName: userDataFromApi.lastName || "",
        phoneNumber: userDataFromApi.phoneNumber || "",
        email: userDataFromApi.email || "",
        password: "********",
      });
    } catch (error) {
      console.error("Помилка завантаження даних:", error);
      setErrors(prev => ({ ...prev, general: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setFormData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      currentPassword: "",
      newPassword: "",
    });
    setErrors({ currentPassword: "", newPassword: "", general: "" });
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setErrors({ currentPassword: "", newPassword: "", general: "" });
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    try {
      setErrors({ currentPassword: "", newPassword: "", general: "" });
      setIsLoading(true);

      const userId = getIdFromJWT();
      if (!userId) {
        throw new Error("Користувач не авторизований");
      }

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
      };

      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const updatedUser = await usersAPI.updateUser(userId, updateData);
      
      setUserData({
        ...userData,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        email: updatedUser.email,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Помилка оновлення даних:", error);
      setErrors(prev => ({ ...prev, general: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "currentPassword" && errors.currentPassword) {
      setErrors((prev) => ({ ...prev, currentPassword: "" }));
    }
    if (name === "newPassword" && errors.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: "" }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt-token');
    navigate('/');
  };

  const checks = [
    {
      id: 1,
      date: "22.10.2025",
      title: "Вечеря с друзями на пікніку",
      status: "paid",
      privacy: "closed",
    },
    {
      id: 2,
      date: "12.10.2025",
      title: "Пікнік",
      status: "partial",
      privacy: "open",
    },
    {
      id: 3,
      date: "22.10.2025",
      title: "Вечеря с друзями на пікніку",
      status: "paid",
      privacy: "closed",
    },
    {
      id: 4,
      date: "15.10.2025",
      title: "Обід з колегами",
      status: "partial",
      privacy: "open",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-[#BAFAD0]";
      case "partial":
        return "bg-[#F9BFC9]";
      default:
        return "bg-gray-300";
    }
  };

  const getPrivacyIcon = (privacy) =>
    privacy === "open" ? iconActive : iconClosed;

  if (isLoading && !isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#021024] text-[24px]">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[992px] h-[674px] bg-[#B6CDFF] rounded-[24px] flex px-[36px] py-[32px]">
        {isEditing ? (
          <div className="w-full flex flex-col">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
                {errors.general}
              </div>
            )}
            
            <div className="w-full h-[292px] bg-white rounded-[24px] flex flex-col items-center pt-[20px]">
              <h2 className="text-[32px] text-[#021024] font-semibold mb-[16px] flex items-center gap-2">
                Особистий профіль
                <span className="text-gray-400 text-[24px] font-normal">✎</span>
              </h2>
              <img
                src={iconProfile}
                alt="profile"
                className="w-[120px] h-[120px] mb-[12px]"
              />
              <div className="flex gap-[24px]">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  className="w-[340px] h-[48px] border border-gray-300 rounded-[12px] text-[20px] px-4 text-[#021024]"
                  placeholder="Ім'я"
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  className="w-[340px] h-[48px] border border-gray-300 rounded-[12px] text-[20px] px-4 text-[#021024]"
                  placeholder="Прізвище"
                />
              </div>
            </div>

            <div className="w-full h-[230px] bg-white rounded-[24px] mt-[24px] pt-[32px] pl-[36px]">
              <div className="flex gap-[184px]">
                <div className="flex flex-col">
                  <div className="mb-[36px]">
                    <label className="text-[#021024] text-[16px] mb-[12px] block">
                      Номер телефону
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleFormChange}
                      className="w-[340px] h-[33px] border border-gray-400 rounded-[8px] px-[12px] text-[#021024]"
                      placeholder="+380XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="text-[#021024] text-[16px] mb-[12px] block">
                      Пошта
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-[340px] h-[33px] border border-gray-400 rounded-[8px] px-[12px] text-[#021024]"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="mb-[36px]">
                    <label className="text-[#021024] text-[16px] mb-[12px] block">
                      Поточний пароль
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Введіть поточний пароль"
                      value={formData.currentPassword}
                      onChange={handleFormChange}
                      className={`w-[340px] h-[33px] border ${
                        errors.currentPassword
                          ? "border-red-500" 
                          : "border-gray-400"
                      } rounded-[8px] px-[12px] text-[#021024]`}
                    />
                    {errors.currentPassword && (
                      <label className="text-red-500 text-xs mt-1 block">
                        {errors.currentPassword}
                      </label>
                    )}
                  </div>
                  <div>
                    <label className="text-[#021024] text-[16px] mb-[12px] block">
                      Новий пароль
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Введіть новий пароль"
                      value={formData.newPassword}
                      onChange={handleFormChange}
                      className={`w-[340px] h-[33px] border ${
                        errors.newPassword
                          ? "border-red-500" 
                          : "border-gray-400"
                      } rounded-[8px] px-[12px] text-[#021024]`}
                    />
                    {errors.newPassword && (
                      <label className="text-red-500 text-xs mt-1 block">
                        {errors.newPassword}
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex mt-[24px] gap-[16px] justify-center">
              <button
                onClick={handleSaveClick}
                disabled={isLoading}
                className="w-[226px] h-[62px] text-white bg-[#456DB4] rounded-[12px] shadow font-semibold hover:bg-[#3a5a9a] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Збереження..." : "Зберегти зміни"}
              </button>
              <button
                onClick={handleCancelClick}
                disabled={isLoading}
                className="w-[226px] h-[62px] text-white bg-[#456DB4] rounded-[12px] shadow font-semibold hover:bg-[#3a5a9a] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Скасувати
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              {errors.general && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
                  {errors.general}
                </div>
              )}
              
              <div className="w-[468px] h-[292px] bg-white rounded-[24px] flex flex-col items-center pt-[20px]">
                <h2 className="text-[32px] text-[#021024] font-semibold mb-[16px]">
                  Особистий профіль
                </h2>
                <img
                  src={iconProfile}
                  alt="profile"
                  className="w-[120px] h-[120px] mb-[12px]"
                />
                <p className="text-[24px] text-[#021024] font-medium">
                  {userData.firstName} {userData.lastName}
                </p>
              </div>
              <div className="w-[468px] h-[225px] bg-white rounded-[24px] mt-[24px] flex flex-col justify-between px-[44px] py-[44px]">
                <div className="flex justify-between text-[#021024] text-[20px]">
                  <span>Номер телефону</span>
                  <span>{userData.phoneNumber}</span>
                </div>
                <div className="flex justify-between text-[#021024] text-[20px]">
                  <span>Пошта</span>
                  <span>{userData.email}</span>
                </div>
                <div className="flex justify-between text-[#021024] text-[20px]">
                  <span>Пароль</span>
                  <span>{userData.password}</span>
                </div>
              </div>
              <div className="flex mt-[24px] gap-[16px]">
                <button
                  onClick={handleEditClick}
                  className="w-[226px] h-[62px] text-[#021024] bg-white rounded-[12px] shadow font-semibold hover:bg-gray-50 transition"
                >
                  Редагувати
                </button>
                <button
                  onClick={handleLogout}
                  className="w-[226px] h-[62px] text-[#021024] bg-white rounded-[12px] shadow font-semibold hover:bg-gray-50 transition flex items-center justify-center"
                >
                  Вийти з системи
                </button>
              </div>
            </div>

            <div className="ml-[36px] w-[434px] h-[611px] bg-white rounded-[24px] flex flex-col pt-[20px] px-[24px] overflow-hidden">
              <h3 className="text-[24px] text-[#021024] font-semibold mb-[24px]">
                Створені мною чеки
              </h3>

              <div className="h-full overflow-y-auto pr-[12px] scrollbar-thin scrollbar-thumb-[#456DB4]/60 scrollbar-track-transparent hover:scrollbar-thumb-[#2B2A3D]">
                <div className="flex flex-col gap-[16px]">
                  {checks.map((check) => (
                    <div
                      key={check.id}
                      className="w-[338px] h-[140px] bg-[#456DB4] text-white rounded-[16px] flex flex-col justify-between py-[20px]"
                    >
                      <div className="flex items-center justify-between px-[24px]">
                        <p className="text-[12px]">{check.date}</p>
                        <div className="flex items-center gap-[8px]">
                          <div
                            className={`w-[24px] h-[24px] rounded-full ${getStatusColor(
                              check.status
                            )}`}
                          />
                          <img
                            src={getPrivacyIcon(check.privacy)}
                            alt="privacy"
                            className="w-[24px] h-[24px]"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="px-[24px] mb-[8px] text-left">
                          <p className="text-[22px] font-medium leading-[26px]">
                            {check.title}
                          </p>
                        </div>
                        <div className="flex justify-end items-center pr-[24px]">
                          <button className="w-[155px] h-[38px] bg-[#B6CDFF] text-black font-semibold rounded-[8px] hover:bg-[#A4C2F5] transition">
                            Детальніше
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}