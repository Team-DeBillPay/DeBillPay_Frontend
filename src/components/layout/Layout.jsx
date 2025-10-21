import React from "react";
import { Link, Outlet, useLocation, matchPath } from "react-router-dom";
import logo from "../../assets/icons/logo.png";
import telephoneIcon from "../../assets/icons/telephone.png";
import locationIcon from "../../assets/icons/location.png";
import timeIcon from "../../assets/icons/time.png";

const contacts = [
  {
    label: "Телефон",
    value: "+380 95 111 111 11",
    icon: telephoneIcon,
  },
  {
    label: "Адреса",
    value: "м. Дніпро, бул. Кучеревського, 1",
    icon: locationIcon,
  },
  {
    label: "Графік роботи",
    value: "Пн-Сб: 8:00 – 20:00, Нд: 8:00 – 16:00",
    icon: timeIcon,
  },
];

function Header({ isLoggedIn = false }) {
  return (
    <header className="bg-[#052659] shadow-md sticky top-0 z-10">
      <div className="flex justify-between items-center w-full mx-auto px-[40px] py-6">
        <Link
          to="/"
          className="flex items-center hover:text-indigo-700 transition"
        >
          <img src={logo} alt="Логотип" className="w-[38px] h-[44px]" />
          <p className="text-[22px] font-semibold">
            <span className="text-white">DeBill</span>
            <span className="text-[#259EEF]">Pay</span>
          </p>
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
                className="text-white underline hover:text-[#259EEF] font-medium hidden sm:inline"
              >
                Реєстрація
              </Link>
              <p className="text-white">/</p>
              <Link
                to="/login"
                className="text-white underline hover:text-[#259EEF] font-medium hidden sm:inline"
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
    <footer className="bg-[#052659] text-white pt-12 pb-3 px-[88px]">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <Link
              to="/"
              onClick={() => window.scrollTo(0, 0)}
              className="flex items-center hover:text-indigo-700 transition"
            >
              <img src={logo} alt="Логотип" className="w-[104px] h-[120px]" />
              <p className="text-[40px] font-semibold">
                <span className="text-white">DeBill</span>
                <span className="text-[#259EEF]">Pay</span>
              </p>
            </Link>
          </div>
          <div>
            <h3 className="text-xl text-gray-200 font-semibold mb-3 flex items-start">
              Контакти
            </h3>
            <div className="flex flex-col space-y-4">
              {contacts.map((item, index) => (
                <div key={index} className="flex items-start">
                  <img src={item.icon} alt={item.label} className="w-7 h-7" />
                  <div className="ml-5 sm:text-left">
                    <p className="text-sm text-gray-400 hover:text-gray-200">
                      {item.label}
                    </p>
                    <span className="text-sm text-gray-400 hover:text-gray-200">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center mt-[46px]">
          <p className="text-sm text-gray-400">
            2025 &copy; Всі права захищені.
          </p>
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
      <div className="bg-[linear-gradient(to_bottom,#062147_3%,#082751_5.5%,#0E2F5C_7.5%,#13386A_9.5%,#163C71_11.5%,#163D72_86%)]">
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {!hideFooter && <Footer />}
    </div>
  );
}
