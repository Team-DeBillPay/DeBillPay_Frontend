import React, { useState } from 'react';

export default function PhoneModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const phoneRegex = /^(?:\+380|380|0)\d{9}$/;
    const cleanPhone = phoneNumber.replace(/\s+/g, '');

    if (!cleanPhone) {
      setError("Це поле обов'язкове для заповнення");
      return;
    }

    if (!phoneRegex.test(cleanPhone)) {
      setError("Введіть коректний український номер телефону (формати: +380XXXXXXXXX, 380XXXXXXXXX, 0XXXXXXXXX)");
      return;
    }

    onSubmit(cleanPhone);
  };

  const handleCancel = () => {
    setPhoneNumber('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 pointer-events-none"></div>

      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md mx-4 p-8 border border-gray-200 z-10">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Додайте номер телефону
          </h3>
          <p className="text-gray-600 text-sm">
            Для завершення реєстрації через Google, будь ласка, введіть ваш номер телефону.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="tel"
              placeholder="+380XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
              disabled={isLoading}
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-blue-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Обробка...' : 'Продовжити'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
