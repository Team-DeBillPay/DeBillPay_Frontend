import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import MainPage from "./pages/MainPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

const NotFound = () => (
  <div className="flex justify-center items-center h-screen">
    <h2 className="text-4xl text-red-600 font-bold">
      404 | Сторінку не знайдено
    </h2>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MainPage />} />

        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route path="profile" element={<ProfilePage />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
