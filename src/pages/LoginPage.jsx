import React, { useState } from "react";
import { Link } from "react-router-dom";
import googleLogo from "../assets/icons/googleLogo.png";
import logoArrow from "../assets/icons/logoArrow.png";
import LogFon from "../assets/LogFon.png";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Дані для входу:", formData);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="fixed inset-0 bg-[#0B162A]"></div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl px-6 md:px-10 z-10">
        <div className="hidden lg:flex justify-center items-center mr-12">
          <img
            src={LogFon}
            alt="Login illustration"
            className="max-w-2xl w-full"
          />
        </div>

        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 md:p-10">
          <div className="flex items-center space-x-1 mb-6">
            <img src={logoArrow} alt="logo" className="w-9 h-9" />
            <h2 className="text-xl font-bold">
              <span className="text-[#1E3A8A]">DeBill</span>
              <span className="text-[#60A5FA]">Pay</span>
            </h2>
          </div>

          <h3 className="text-3xl font-bold text-gray-800 mb-6">Вхід</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="emailOrPhone"
              placeholder="Номер телефона / Адреса електронної пошти"
              value={formData.emailOrPhone}
              onChange={handleChange}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <div>
              <input
                type="password"
                name="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
              className="w-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-semibold py-3 rounded-lg transition duration-200"
            >
              Увійти
            </button>

            <button
              type="button"
              className="w-full border border-gray-300 flex items-center justify-center space-x-3 py-1 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <img src={googleLogo} alt="Google" className="w-9 h-9" />
              <span className="text-gray-700 font-medium">
                Продовжити з Google
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
