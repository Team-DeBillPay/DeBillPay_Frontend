import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleLogo from "../assets/icons/googleLogo.png";
import logoArrow from "../assets/icons/logoArrow.png";
import RegFon from "../assets/RegFon.png";
import { authAPI } from "../api/auth";
import { useGoogleAuth } from "../api/useGoogleAuth";
import PhoneModal from "../components/RegNumb/PhoneModal";
import { jwtDecode } from 'jwt-decode';
import { usersAPI } from "../api/users";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();
  
  const {
    isLoading: googleLoading,
    error: googleError,
    loadGoogleScript,
    renderGoogleButton,
    setIsLoading: setGoogleLoading,
    setError: setGoogleError,
  } = useGoogleAuth();

  useEffect(() => {
    loadGoogleScript().catch(error => {
      setGoogleError('Не вдалося завантажити сервіс Google');
    });
  }, [loadGoogleScript, setGoogleError]);

  useEffect(() => {
    if (googleButtonRef.current && window.google) {
      try {
        renderGoogleButton(googleButtonRef.current, handleGoogleSuccess, "Реєстрація за допомогою Google");
      } catch (error) {
        console.error('Error rendering Google button:', error);
      }
    }
  }, [renderGoogleButton]);

    const handleGoogleSuccess = async (response) => {
    try {
      setGoogleLoading(true);
      setGoogleError(null);
      setServerError("");


      const authResult = await authAPI.googleAuth(response.credential);

      const token = authResult.token;
      localStorage.setItem('jwt-token', token);

      try {
        const decoded = jwtDecode(token);

        const isNewUser = decoded.isNewUser === 'true' || 
                          authResult.isNewUser === true ||
                          !decoded.phoneNumber;
        
        const hasPhoneNumber = decoded.phoneNumber || 
                              decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone'] ||
                              authResult.user?.phoneNumber;
        

        if (isNewUser && !hasPhoneNumber) {
          setGoogleData({
            token: authResult.token,
            user: authResult.user,
            isNewUser: true
          });
          setShowPhoneModal(true);
        } else {
          navigate("/profile");
        }
      } catch (decodeError) {
        navigate("/profile");
      }
    } catch (error) {

      if (error.message.includes('already exists') || error.message.includes('вже існує')) {
        setServerError("Акаунт з цією поштою вже існує. Будь ласка, увійдіть або використайте іншу пошту.");
      } else {
        setGoogleError(error.message);
        setServerError(error.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePhoneSubmit = async (phoneNumber) => {
    try {
      setIsLoading(true);

      let userId;
      try {
        const decoded = jwtDecode(googleData.token);
        userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      } catch (e) {
        throw new Error("Не вдалося отримати ID користувача");
      }

      if (!userId) {
        throw new Error("Не вдалося отримати ID користувача");
      }

      const updateData = {
        phoneNumber: phoneNumber
      };

      
      const response = await usersAPI.updateUser(userId, updateData);

      if (response.token) {
        localStorage.setItem('jwt-token', response.token);
      }
      
      setShowPhoneModal(false);
      setGoogleData(null);
      navigate("/profile");
    } catch (error) {

      if (error.message.includes('already exists') || error.message.includes('вже існує')) {
        setServerError("Цей номер телефону вже використовується іншим акаунтом.");
      } else {
        setServerError(error.message || "Помилка при додаванні номера телефону. Спробуйте ще раз.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowPhoneModal(false);
    setGoogleData(null);
    localStorage.removeItem('jwt-token');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    if (serverError) {
      setServerError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Це поле обов'язкове для заповнення";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Це поле обов'язкове для заповнення";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Це поле обов'язкове для заповнення";
    } else {
      const phoneRegex = /^(?:\+380|380|0)\d{9}$/;
      const cleanPhone = formData.phoneNumber.replace(/\s+/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phoneNumber = "Введіть коректний український номер телефону (формати: +380XXXXXXXXX, 380XXXXXXXXX, 0XXXXXXXXX)";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Це поле обов'язкове для заповнення";
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Введіть коректну адресу електронної пошти у форматі текст@текст.текст (англійські символи)";
      }
    }

    if (!formData.password) {
      newErrors.password = "Це поле обов'язкове для заповнення";
    } else {
      if (formData.password.length < 6) {
        newErrors.password = "Пароль повинен містити мінімум 6 символів";
      } else {
        const passwordRegex = /^[a-zA-Z0-9.!?@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;
        if (!passwordRegex.test(formData.password)) {
          newErrors.password = "Пароль може містити тільки англійські літери, цифри та спеціальні символи";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      setIsLoading(true);
      setServerError("");

      try {
        const registrationData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.replace(/\s+/g, ''),
          password: formData.password
        };

      
        const registerResponse = await authAPI.register(registrationData);
      
        const loginResponse = await authAPI.login({
          email: formData.email.trim(),
          password: formData.password
        });
      
      
        localStorage.setItem('jwt-token', loginResponse.token);
      
        navigate("/profile");
      } catch (error) {
        setServerError(error.message || "Сталася помилка під час реєстрації. Спробуйте ще раз.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="fixed inset-0 bg-[#0B162A]"></div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl px-6 md:px-10 z-0">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 md:p-10">
          <div className="flex items-center mb-6">
            <img src={logoArrow} alt="logo" className="w-9 h-9" />
            <h2 className="text-xl font-bold">
              <span className="text-[#1E3A8A]">DeBill</span>
              <span className="text-[#60A5FA]">Pay</span>
            </h2>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Реєстрація
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Створіть обліковий запис, щоб почати користуватися нашим сервісом
          </p>

          {serverError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {serverError}
            </div>
          )}

          {googleError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {googleError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Ім'я"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? "border-red-500" : "border-blue-300"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Прізвище"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? "border-red-500" : "border-blue-300"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Номер телефона"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phoneNumber ? "border-red-500" : "border-blue-300"
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Адреса електронної пошти"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : "border-blue-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? "border-red-500" : "border-blue-300"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="text-sm text-gray-600 mt-2">
                Вже є аккаунт?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Авторизуватися
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-semibold py-3 rounded-lg transition duration-200 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
              </button>

              <div ref={googleButtonRef} className="w-full">
              </div>
              {!window.google && (
                <button
                  type="button"
                  className="w-full border border-gray-300 flex items-center justify-center space-x-3 py-3 rounded-lg hover:bg-gray-50 transition duration-200"
                  onClick={() => setGoogleError('Google сервіс ще завантажується. Спробуйте через кілька секунд.')}
                >
                  <img src={googleLogo} alt="Google" className="w-5 h-5" />
                  <span className="text-gray-700 font-medium">
                    Продовжити з Google
                  </span>
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="hidden lg:flex justify-center items-center ml-12">
          <img
            src={RegFon}
            alt="Registration illustration"
            className="max-w-2xl w-full"
          />
        </div>
      </div>
      <PhoneModal
        isOpen={showPhoneModal}
        onClose={handleModalClose}
        onSubmit={handlePhoneSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}