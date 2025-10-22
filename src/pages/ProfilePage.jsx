import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import iconProfile from "../assets/icons/iconProfile.png";
import iconClosed from "../assets/icons/closed.png";
import iconActive from "../assets/icons/active.png";


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    firstName: "Паяльникович",
    lastName: "Михайло",
    phone: "+380607765488",
    email: "umalso@gmail.com",
    password: "ПРГр357", 
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const handleEditClick = () => {
    setFormData({
      ...userData,
      currentPassword: "", 
      newPassword: "",
    });
    setErrors({ currentPassword: "", newPassword: "" }); 
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setErrors({ currentPassword: "", newPassword: "" }); 
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    setErrors({ currentPassword: "", newPassword: "" });

    let validationFailed = false;
    let newPasswordErrorMessages = [];
    const newPassword = formData.newPassword;
    const currentPassword = formData.currentPassword;
    if (newPassword) {
      //Перевірка поточного (старого) пароля
      if (currentPassword !== userData.password) {
        setErrors((prev) => ({
          ...prev,
          currentPassword: "Неправильний поточний пароль",
        }));
        validationFailed = true;
      }

      //  правила нового пароля
      // Довжина )
      if (newPassword.length <= 6) {
        newPasswordErrorMessages.push("довше 6 символів");
      }
      // Наявність великої літери 
      if (!/[A-ZА-Я]/.test(newPassword)) {
        newPasswordErrorMessages.push("додайте букву з великої літери");
      }
      if (newPasswordErrorMessages.length > 0) {
        setErrors((prev) => ({
          ...prev,
          newPassword: `Новий пароль: ${newPasswordErrorMessages.join(", ")}`,
        }));
        validationFailed = true;
      }
    }
    if (validationFailed) {
      return;
    }
    setUserData({
      ...userData,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      // Логіка: якщо newPassword був наданий (і пройшов валідацію),
      // беремо його. Інакше — залишаємо старий.
      password: newPassword || userData.password,
    });
    setIsEditing(false); 
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
  };

  const handleLogoutClick = () => {
    navigate("/"); 
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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[992px] h-[674px] bg-[#B6CDFF] rounded-[24px] flex px-[36px] py-[32px]">
        {isEditing ? (
          //  Рредагування
          <div className="w-full flex flex-col">
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
              // Поля для імені та прізвища 
              <div className="flex gap-[24px]">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  className="w-[340px] h-[48px] border border-gray-300 rounded-[12px] text-[20px] px-4 text-[#021024]"
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  className="w-[340px] h-[48px] border border-gray-300 rounded-[12px] text-[20px] px-4 text-[#021024]"
                />
              </div>
            </div>

            // Нижній блок 
            <div className="w-full h-[230px] bg-white rounded-[24px] mt-[24px] pt-[32px] pl-[36px]">
              <div className="flex gap-[184px]">
                <div className="flex flex-col">
                  <div className="mb-[36px]">
                    <label className="text-[#021024] text-[16px] mb-[12px] block">
                      Номер телефону
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-[340px] h-[33px] border border-gray-400 rounded-[8px] px-[12px] text-[#021024]"
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
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  // Поточний Пароль
                  <div className="mb-[36px]">
                    <label className="text-[#021024] text-[16px] mb-[12px] block">
                      Пароль
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
                    //ЗМІНА: Відображення помилки
                    {errors.currentPassword && (
                      <label className="text-red-500 text-xs mt-1 block">
                        {errors.currentPassword}
                      </label>
                    )}
                  </div>
                  // Новий пароль
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
                className="w-[226px] h-[62px] text-white bg-[#456DB4] rounded-[12px] shadow font-semibold hover:bg-[#3a5a9a] transition"
              >
                Зберегти зміни
              </button>
              <button
                onClick={handleCancelClick}
                className="w-[226px] h-[62px] text-white bg-[#456DB4] rounded-[12px] shadow font-semibold hover:bg-[#3a5a9a] transition"
              >
                Скасувати
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Ліва частина */}
            <div className="flex flex-col">
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
                  <span>{userData.phone}</span>
                </div>
                <div className="flex justify-between text-[#021024] text-[20px]">
                  <span>Пошта</span>
                  <span>{userData.email}</span>
                </div>
                <div className="flex justify-between text-[#021024] text-[20px]">
                  <span>Пароль</span>
                  <span>{userData.password.replace(/./g, "*")}</span>
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
                  onClick={handleLogoutClick}
                  className="w-[226px] h-[62px] text-[#021024] bg-white rounded-[12px] shadow font-semibold hover:bg-gray-50 transition"
                >
                  Вийти з системи
                </button>
              </div>
            </div>

            {/* Права частина */}
            <div className="ml-[36px] w-[434px] h-[611px] bg-white rounded-[24px] flex flex-col pt-[20px] px-[24px] overflow-hidden">
              <h3 className="text-[24px] text-[#021024] font-semibold mb-[24px]">
                Створені мною чеки
              </h3>

              {/*слайдер */}
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

                      {/* Блок Назва + Кнопка */}
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