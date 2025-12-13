import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import CheckCard from "../components/CheckCards/CheckCard";
import { analyticsAPI } from "../api/analytics";
import { checksAPI } from "../api/checks"; 
import { getIdFromJWT } from "../utils/jwt";
import Loader from "../components/Reuse/Loader";
import MonitoringCheckCard from "../components/CheckCards/MonitoringCheckCard";
import { usersAPI } from "../api/users";

const COLORS = {
  active: "#7BE495", 
  closed: "#E5566C", 
  paid: "#A4FFC4", 
  partial: "#FEEBBB", 
  unpaid: "#FFACAE", 
  primaryBlue: "#456DB4",
  textDark: "#021024",
  textLight: "#042860",
};

const debtPaymentStatusData = [
  { name: "Погашені", value: 12, color: COLORS.paid },
  { name: "Частково погашені", value: 5, color: COLORS.partial },
  { name: "Непогашені", value: 3, color: COLORS.unpaid },
];

const myChecksStatusData = [
  { name: "Активні", value: 8, color: COLORS.active },
  { name: "Закриті", value: 15, color: COLORS.closed },
];

const debtsFlowMockData = [
  { month: "2025-07", whatILent: 4000, whatIOwe: 2400 },
  { month: "2025-08", whatILent: 3000, whatIOwe: 1398 },
  { month: "2025-09", whatILent: 2000, whatIOwe: 9800 },
  { month: "2025-10", whatILent: 2780, whatIOwe: 3908 },
  { month: "2025-11", whatILent: 1890, whatIOwe: 4800 },
  { month: "2025-12", whatILent: 5430, whatIOwe: 0 },
];

const CustomLegend = ({ payload }) => {
  return (
    <ul className="flex flex-col gap-2 ml-4">
      {payload.map((entry, index) => (
        <li
          key={`item-${index}`}
          className="flex items-center text-[16px] text-[#042860]"
        >
          <span
            className="block w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          {entry.payload.name}:{" "}
          <span className="font-bold ml-1">{entry.payload.value}</span>
        </li>
      ))}
    </ul>
  );
};

export default function AnalyticsPage() {
  const [debtsFlow, setDebtsFlow] = useState(debtsFlowMockData);
  const [allChecks, setAllChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState(6);

  const [usersCache, setUsersCache] = useState({});

  const currentUserId = getIdFromJWT();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const checksData = await checksAPI.getAllChecks();
        setAllChecks(checksData);

        try {
          const flowData = await analyticsAPI.getDebtsFlow(period);
          setDebtsFlow(flowData);
        } catch (e) {
          console.error("Не вдалося отримати графік боргів:", e);
          setDebtsFlow([
            { month: "2025-07", whatILent: 0, whatIOwe: 0 },
            { month: "2025-12", whatILent: 0, whatIOwe: 0 },
          ]);
        }
      } catch (error) {
        console.error("Помилка завантаження даних:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchData();
    }
  }, [currentUserId, period]);

  const myActiveChecksList = useMemo(() => {
    if (!currentUserId) return [];

    return allChecks.filter((check) => {
      const me = check.participants.find(
        (p) => p.userId.toString() === currentUserId.toString()
      );
      return (
        me?.isAdminRights === true && check.status?.toLowerCase() === "активний"
      );
    });
    //   .map((c) => ({
    //     id: c.ebillId,
    //     title: c.name,
    //     date: new Date(c.createdAt).toLocaleDateString(),
    //     organizerId: currentUserId,
    //     paymentStatus:
    //       c.participants.find(
    //         (p) => p.userId.toString() === currentUserId.toString()
    //       )?.paymentStatus || "непогашений",
    //     lockStatus: c.status?.toLowerCase() === "закритий" ? "closed" : "open",
    //   }));
  }, [allChecks, currentUserId]);

  useEffect(() => {
    const fetchMissingUsers = async () => {
      if (myActiveChecksList.length === 0) return;

      const idsToFetch = new Set();

      myActiveChecksList.forEach((check) => {
        check.participants.forEach((p) => {
          if (!usersCache[p.userId]) {
            idsToFetch.add(p.userId);
          }
        });
      });

      if (idsToFetch.size === 0) return;

      const newUsers = {};
      await Promise.all(
        Array.from(idsToFetch).map(async (id) => {
          try {
            const userData = await usersAPI.getUserById(id);
            newUsers[id] = userData;
          } catch (e) {
            console.error(`Failed to fetch user ${id}`, e);
            newUsers[id] = { firstName: "Unknown", lastName: "User" };
          }
        })
      );

      setUsersCache((prev) => ({ ...prev, ...newUsers }));
    };

    fetchMissingUsers();
  }, [myActiveChecksList, usersCache]);

  const myDebtsStatusData = useMemo(() => {
    if (!currentUserId) return [];

    let paid = 0;
    let partial = 0;
    let unpaid = 0;

    allChecks.forEach((check) => {
      const me = check.participants.find(
        (p) => p.userId.toString() === currentUserId.toString()
      );
      if (me) {
        const status = me.paymentStatus?.toLowerCase();
        if (status === "погашений") paid++;
        else if (status === "частково погашений") partial++;
        else unpaid++;
      }
    });

    if (paid === 0 && partial === 0 && unpaid === 0) return [];

    return [
      { name: "Погашені", value: paid, color: COLORS.paid },
      { name: "Частково погашені", value: partial, color: COLORS.partial },
      { name: "Непогашені", value: unpaid, color: COLORS.unpaid },
    ];
  }, [allChecks, currentUserId]);

  const myCreatedChecksStatusData = useMemo(() => {
    if (!currentUserId) return [];

    let active = 0;
    let closed = 0;

    allChecks.forEach((check) => {
      const me = check.participants.find(
        (p) => p.userId.toString() === currentUserId.toString()
      );
      if (me?.isAdminRights === true) {
        const status = check.status?.toLowerCase();
        if (status === "активний") active++;
        if (status === "закритий") closed++;
      }
    });

    if (active === 0 && closed === 0) return [];

    return [
      { name: "Активні", value: active, color: COLORS.active },
      { name: "Закриті", value: closed, color: COLORS.closed },
    ];
  }, [allChecks, currentUserId]);

  if (loading) {
    return (
      <div className="p-7 bg-[#B6CDFF] rounded-[32px] min-h-screen flex items-center justify-center">
        <Loader text="Завантаження аналітики..." />
      </div>
    );
  }

  return (
    <div className="p-7 bg-[#B6CDFF] rounded-[32px] min-h-screen">
      <div className="flex flex-row justify-between mb-4">
        <div className="bg-white rounded-[24px] w-[49%] h-[320px] p-8 relative">
          <h2 className="text-[20px] text-[#021024] font-semibold absolute top-[28px] left-[36px]">
            Стан оплати моїх боргів
          </h2>
          <div className="w-full h-full flex items-center justify-center pt-8">
            {myDebtsStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={myDebtsStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {myDebtsStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    content={<CustomLegend />}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[#979AB7]">Немає даних про борги</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[24px] w-[49%] h-[320px] p-8 relative">
          <h2 className="text-[20px] text-[#021024] font-semibold absolute top-[28px] left-[36px]">
            Статус створених мною чеків
          </h2>
          <div className="w-full h-full flex items-center justify-center pt-8">
            {myCreatedChecksStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={myCreatedChecksStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {myCreatedChecksStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    content={<CustomLegend />}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[#979AB7]">Ви ще не створювали чеків</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] w-full h-[400px] p-6 mb-4 relative">
        <div className="flex justify-between items-center mb-6 pl-[12px] pr-[12px]">
          <h2 className="text-[20px] text-[#021024] font-semibold mt-[4px]">
            Динаміка боргів
          </h2>
          <div className="flex bg-[#EBF1FF] rounded-lg p-1">
            <button
              onClick={() => setPeriod(6)}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                period === 6 ? "bg-[#456DB4] text-white" : "text-[#456DB4]"
              }`}
            >
              6 міс.
            </button>
            <button
              onClick={() => setPeriod(12)}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                period === 12 ? "bg-[#456DB4] text-white" : "text-[#456DB4]"
              }`}
            >
              12 міс.
            </button>
          </div>
        </div>

        <div className="w-full h-[300px]">
          {debtsFlow.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={debtsFlow}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="Мені винні"
                  type="monotone"
                  dataKey="whatILent"
                  stroke={COLORS.active}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: COLORS.active,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  name="Я винен"
                  type="monotone"
                  dataKey="whatIOwe"
                  stroke={COLORS.closed}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: COLORS.closed,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[#979AB7]">
              Немає даних для відображення графіка.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[24px] w-full p-6 relative text-left">
        <h2 className="text-[20px] text-[#021024] font-semibold mt-[4px] ml-[12px] mb-[28px]">
          Моніторинг оплат моїх власних чеків
        </h2>

        <div className="h-[694px] overflow-y-auto custom-scrollbar pr-2">
          {myActiveChecksList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[28px] justify-items-center">
              {myActiveChecksList.map((check) => (
                <div key={check.ebillId} className="h-full min-h-[150px]">
                  <MonitoringCheckCard
                    check={check}
                    usersCache={usersCache}
                    currentUserId={currentUserId}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-[#979AB7]">
              У вас немає активних власних чеків.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
