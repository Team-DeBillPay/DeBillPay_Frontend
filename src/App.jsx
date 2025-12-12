import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import LayoutPR from "./components/layout/LayoutPR";
import MainPage from "./pages/MainPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ChecksPage from "./pages/ChecksPage.jsx";
import CheckDetailPage from "./pages/CheckDetailPage.jsx";
import CheckHistoryPage from "./pages/CheckHistoryPage.jsx";
import MyNotifications from "./pages/MyNotifications.jsx";
import CheckCommentsPage from "./pages/CheckCommentsPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import MyFriends from "./pages/MyFriends.jsx";

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
      {/* Головний layout (з хедером і футером) */}
      <Route path="/" element={<Layout />}>
        <Route index element={<MainPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Окремий layout */}
      <Route element={<LayoutPR />}>
        <Route path="profile" element={<ProfilePage />} />
        <Route path="friends" element={<MyFriends />} />
        <Route path="messages" element={<MyNotifications />} />
        <Route path="activities" element={<AnalyticsPage />} />

        {/* додаткові роути з e-bills */}
        <Route path="checks">
          <Route index element={<ChecksPage />} />
          <Route path=":ebillId" element={<CheckDetailPage />} />
          <Route path=":ebillId/history" element={<CheckHistoryPage />} />
          <Route path=":ebillId/comments" element={<CheckCommentsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
