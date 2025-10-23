import React, { useState } from "react";
import { Link } from "react-router-dom";
import googleLogo from "../assets/icons/googleLogo.png";
import logoArrow from "../assets/icons/logoArrow.png";
import RegFon from "../assets/RegFon.png";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Дані форми:", formData);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="fixed inset-0 bg-[#0B162A]"></div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl px-6 md:px-10 z-10">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 md:p-10">
          <div className="flex items-center space-x-1 mb-6">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="firstName"
              placeholder="Ім'я"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Прізвище"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Номер телефона"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Адреса електронної пошти"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

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
              className="w-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-semibold py-3 rounded-lg transition duration-200"
            >
              Зареєструватися
            </button>

            <button
              type="button"
              className="w-full border border-gray-300 flex items-center justify-center space-x-3 py-1 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <img src={googleLogo} alt="Google" className="w-9 h-9" />
              <span className="text-gray-700 font-medium">
                Увійти за допомогою Google
              </span>
            </button>
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
    </div>
  );
}