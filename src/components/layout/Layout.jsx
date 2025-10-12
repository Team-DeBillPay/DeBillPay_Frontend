import React from "react";
import { Link, Outlet, useLocation, matchPath } from "react-router-dom";

const contacts = [
  { label: "Телефон", value: "+380 95 111 111 11" },
  { label: "Адреса", value: "м. Дніпро, бул. Кучеревського, 1" },
  { label: "Графік роботи", value: "Пн-Сб: 8:00 – 20:00, Нд: 8:00 – 16:00" },
];

function Header({ isLoggedIn = false }) {
  return (
    <header className="bg-white shadow-md p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-extrabold text-indigo-600 hover:text-indigo-700 transition"
        >
          DeBillPay
        </Link>

        <div className="space-x-4 flex items-center">
          {isLoggedIn && (
            <Link
              to="/profile"
              className="text-gray-600 hover:text-indigo-600 font-medium hidden sm:inline"
            >
              Профіль
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={() => console.log("User logged out")}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-150 font-medium"
            >
              Вийти
            </button>
          ) : (
            <>
              <Link
                to="/register"
                className="text-gray-600 hover:text-indigo-600 font-medium hidden sm:inline"
              >
                Реєстрація
              </Link>

              <Link
                to="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-150 font-medium"
              >
                Увійти
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-6 mt-8">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-center">
        <div className="mb-4 sm:mb-0">
          <p className="text-xl font-semibold mb-2">DeBillPay</p>
          <p className="text-sm text-gray-400">
            2025 &copy; Всі права захищені.
          </p>
        </div>

        <div className="flex flex-col sm:text-left text-sm text-gray-400">
          {contacts.map((item, index) => (
            <span key={index} className="hover:text-gray-200">
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ isLoggedIn = false }) {
  const location = useLocation();

  const noFooterRoutes = ["/login", "/register"];

  const hideFooter = noFooterRoutes.some((pattern) =>
    matchPath({ path: pattern, end: true }, location.pathname)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={isLoggedIn} />

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}
