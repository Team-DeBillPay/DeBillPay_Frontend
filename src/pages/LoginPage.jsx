import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleLogo from "../assets/icons/googleLogo.png";
import logoArrow from "../assets/icons/logoArrow.png";
import LogFon from "../assets/LogFon.png";
import { authAPI } from "../api/auth";
import { getJWT } from "../utils/jwt";
import { useGoogleAuth } from "../api/useGoogleAuth";
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loginMethod, setLoginMethod] = useState("email");
  const navigate = useNavigate();

  const googleButtonRef = useRef(null);
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
        renderGoogleButton(googleButtonRef.current, handleGoogleSuccess, "Увійти за допомогою Google");
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

      console.log("Google auth response:", response);

      const authResult = await authAPI.googleAuth(response.credential);

      if (authResult.isNewUser === true || authResult.userExists === false) {
        setGoogleError("Акаунт з цією Google поштою не зареєстрований. Будь ласка, зареєструйтесь спочатку.");
        return;
      }

      const token = authResult.token;
      localStorage.setItem('jwt-token', token);
      
      navigate("/profile");

    } catch (error) {
      console.error("Google auth error:", error);

      if (error.message.includes('not found') || 
          error.message.includes('не знайдено') || 
          error.message.includes('does not exist') ||
          error.message.includes('не існує')) {
        setGoogleError("Акаунт з цією Google поштою не зареєстрований. Будь ласка, зареєструйтесь спочатку.");
      } else if (error.message.includes('already exists') || error.message.includes('вже існує')) {
        setServerError("Акаунт з цією поштою вже існує. Будь ласка, увійдіть через звичайну форму.");
      } else {
        setGoogleError(error.message);
        setServerError(error.message);
      }
    } finally {
      setGoogleLoading(false);
    }
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

  const handleLoginMethodChange = (method) => {
    setLoginMethod(method);
    setFormData({
      email: "",
      phoneNumber: "",
      password: formData.password
    });
    setErrors({});
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (loginMethod === "email") {
      if (!formData.email.trim()) {
        newErrors.email = "Це поле обов'язкове для заповнення";
      } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
          newErrors.email = "Введіть коректну адресу електронної пошти у форматі текст@текст.текст (англійські символи)";
        }
      }
    } else {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Це поле обов'язкове для заповнення";
      } else {
        const phoneRegex = /^(?:\+380|380|0)\d{9}$/;
        const cleanPhone = formData.phoneNumber.replace(/\s+/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          newErrors.phoneNumber = "Введіть коректний український номер телефону (формати: +380XXXXXXXXX, 380XXXXXXXXX, 0XXXXXXXXX)";
        }
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
        let loginData = {
          password: formData.password
        };

        if (loginMethod === "email") {
          loginData.email = formData.email.trim();
          loginData.phoneNumber = "";
        } else {
          loginData.phoneNumber = formData.phoneNumber.replace(/\s+/g, '');
          loginData.email = "";
        }

        
        const response = await authAPI.login(loginData);

        if (response.token) {
          localStorage.setItem('jwt-token', response.token);
        }

        navigate("/profile");
      } catch (error) {
        setServerError(error.message || "Невірні дані для входу. Спробуйте ще раз.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="fixed inset-0 bg-[#0B162A]"></div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl px-6 md:px-10 z-0">
        <div className="hidden lg:flex justify-center items-center mr-12">
          <img
            src={LogFon}
            alt="Login illustration"
            className="max-w-2xl w-full"
          />
        </div>

        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 md:p-10">
          <div className="flex items-center mb-6">
            <img src={logoArrow} alt="logo" className="w-9 h-9" />
            <h2 className="text-xl font-bold">
              <span className="text-[#1E3A8A]">DeBill</span>
              <span className="text-[#60A5FA]">Pay</span>
            </h2>
          </div>

          <h3 className="text-3xl font-bold text-gray-800 mb-6">Вхід</h3>

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleLoginMethodChange("email")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === "email"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Пошта
            </button>
            <button
              type="button"
              onClick={() => handleLoginMethodChange("phone")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === "phone"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Телефон
            </button>
          </div>

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
              {loginMethod === "email" ? (
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
              ) : (
                <div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Номер телефону"
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
              )}

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
                <div className="text-right mt-1">
                  <Link
                    to="#"
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    Забули пароль?
                  </Link>
                </div>
              </div>

              <div className="text-sm text-gray-600 mt-2">
                Ще немає акаунта?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Зареєструватися
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-semibold py-3 rounded-lg transition duration-200 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Вхід...' : 'Увійти'}
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
      </div>
    </div>
  );
}