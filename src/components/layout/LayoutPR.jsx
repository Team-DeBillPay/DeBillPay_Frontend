import React from "react";
import { Link, Outlet, useLocation, matchPath } from "react-router-dom";
import logo from "../../assets/icons/logo.png";
import phoneIcon from "../../assets/icons/telephone.png";
import timeIcon from "../../assets/icons/time.png";
import locationIcon from "../../assets/icons/location.png";
import Myactivity from "../../assets/icons/myactivityIcon.png";
import MyactivityOn from "../../assets/icons/myactivityIconOn.png";
import MyBills from "../../assets/icons/mybillsIcon.png";
import MyBillsOn from "../../assets/icons/mybillsIconOn.png";
import MyFriends from "../../assets/icons/myfriendsIcon.png";
import MyFriendsOn from "../../assets/icons/myfriendsIconOn.png";
import MyProfile from "../../assets/icons/myprofile.png";
import MyProfileOn from "../../assets/icons/myprofileOn.png";
import MyNotifications from "../../assets/icons/mynotificationsIcon.png";
import MyNotificationsOn from "../../assets/icons/mynotificationsIconOn.png";

export default function LayoutPR() {
  const location = useLocation();
  const menuItems = [
    {
      label: "Мої активності",
      path: "/activities",
      icon: Myactivity,
      iconOn: MyactivityOn,
    },
    {
      label: "Особистий профіль",
      path: "/profile",
      icon: MyProfile,
      iconOn: MyProfileOn,
    },
    {
      label: "Мої чеки",
      path: "/checks",
      icon: MyBills,
      iconOn: MyBillsOn,
    },
    {
      label: "Мої друзі",
      path: "/friends",
      icon: MyFriends,
      iconOn: MyFriendsOn,
    },
    {
      label: "Повідомлення",
      path: "/messages",
      icon: MyNotifications,
      iconOn: MyNotificationsOn,
    },
  ];

  const contacts = [
    { icon: phoneIcon, label: "Телефон:", text: "+380 95 111 111 11" },
    {
      icon: timeIcon,
      label: "Графік роботи:",
      text: ["Пн–Сб: 8:00 – 20:00", "Нд: 8:00 – 16:00"],
    },
    {
      icon: locationIcon,
      label: "Адреса:",
      text: "м. Дніпро, бул. Кучеревського, 1",
    },
  ];

return (
  <div className="flex h-full min-h-screen text-white bg-[#2A283B]">
    <aside className="w-[360px] flex flex-col justify-between bg-[#021024]">
      <div
        className="bg-[#052659] flex items-center px-6"
        style={{ height: "90px", minHeight: "90px" }}
      >
        <img src={logo} alt="logo" className="w-8 h-8 mr-2" />
        <h1 className="text-xl font-semibold text-white leading-none">
          DeBill<span className="text-[#259EEF]">Pay</span>
        </h1>
      </div>
      <div
        className="flex flex-col items-start gap-4"
        style={{ paddingLeft: "44px", marginTop: "52px" }}
      >
        {menuItems.map((item) => {
          const isActive = matchPath(
            { path: item.path, end: true },
            location.pathname
          );
          const iconSrc = isActive ? item.iconOn : item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-[272px] h-[60px] flex items-center justify-start px-6 rounded-xl font-medium text-[16px] transition-all duration-200 gap-[18px] ${
                isActive
                  ? "bg-[#466FB7] text-white"
                  : "bg-[#021024] text-gray-300 hover:bg-[#0a2b66]"
              }`}
            >
              <img src={iconSrc} alt="" className="w-6 h-6 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="flex-grow flex flex-col justify-end pb-[12px]">
        <div className="pl-8 mt-[248px] text-[#D1D4E8]">
          <p className="text-[20px] font-medium mb-3">Контакти:</p>

          <div className="space-y-3">
            {contacts.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <img
                  src={item.icon}
                  alt="icon"
                  className="w-6 h-6 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm text-left">{item.label}</p>
                  {Array.isArray(item.text) ? (
                    item.text.map((line, i) => (
                      <p key={i} className="text-sm">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm">{item.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 text-xs text-[#D1D4E8]">
            2025 © DeBillPay | Всі права захищені
          </div>
        </div>
      </div>
    </aside>
    <main className="flex-grow h-full bg-gradient-to-b from-[#456EB5] to-[#2B2A3D] p-8 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);
}