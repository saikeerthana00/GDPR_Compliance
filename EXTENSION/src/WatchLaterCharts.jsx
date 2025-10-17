import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import WatchLaterExplanatoryCard from "./WatchLaterExplanatoryCard";
import {
  Hash,
  ExternalLink,
  Type,
  Users,
  TrendingUp,
  Eye,
  Play,
  Crown,
  Medal,
  Award,
  Info,
  Sliders,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";

const WL_COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"];

export default function WatchLaterCharts({ report, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("yearly");
  const [barChartRange, setBarChartRange] = useState(12);

  // ─────── Build watchMap ───────
  const watchMap = useMemo(() => {
    const map = {};
    report.watch.forEach((item) => {
      if (item.type !== "video" || !item.url) return;
      try {
        const urlObj = new URL(item.url);
        const vid = urlObj.searchParams.get("v");
        if (vid) {
          if (!map[vid] || map[vid] > item.time) {
            map[vid] = item.time;
          }
        }
      } catch {
        // ignore invalid URLs
      }
    });
    return map;
  }, [report.watch]);

  const totalAdded = report.watchLater.length;

  const watchedAfterCount = useMemo(
    () =>
      report.watchLater.filter(({ videoId, addedTime }) => {
        const watchedTime = watchMap[videoId];
        return watchedTime && watchedTime > addedTime;
      }).length,
    [report.watchLater, watchMap]
  );

  const unwatchedCount = totalAdded - watchedAfterCount;
  const percentWatched = totalAdded
    ? Math.round((watchedAfterCount / totalAdded) * 100)
    : 0;

  const pieData = [
    { name: "Watched", value: watchedAfterCount, color: "#10b981" },
    { name: "Unwatched", value: unwatchedCount, color: "#ef4444" },
  ];

  // ─────── Bar Chart Data ───────
  const barChartData = useMemo(() => {
    if (!report.watchLater.length) return [];

    const now = new Date();
    const groupedData = {};

    report.watchLater.forEach(({ videoId, addedTime }) => {
      const date = new Date(addedTime);
      let key;

      if (dateRange === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      } else {
        key = date.getFullYear().toString();
      }

      if (!groupedData[key]) {
        groupedData[key] = { period: key, added: 0, watched: 0 };
      }

      groupedData[key].added++;

      // Check if watched after adding
      const watchedTime = watchMap[videoId];
      if (watchedTime && watchedTime > addedTime) {
        groupedData[key].watched++;
      }
    });

    return Object.values(groupedData)
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-barChartRange);
  }, [report.watchLater, watchMap, dateRange, barChartRange]);

  const tableRows = useMemo(
    () =>
      report.watchLater.map(({ videoId, addedTime }) => {
        const watchedTime = watchMap[videoId] || null;
        const isWatched = watchedTime && watchedTime > addedTime;
        return {
          videoId,
          added: new Date(addedTime).toUTCString(),
          watched: watchedTime ? new Date(watchedTime).toUTCString() : "–",
          isWatched,
        };
      }),
    [report.watchLater, watchMap]
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-slate-800 mb-2">{data.name}</p>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            ></div>
            <span className="text-slate-600 font-medium">
              {data.value} videos (
              {((data.value / totalAdded) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-slate-700">
              {entry.payload.name}: {entry.payload.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-slate-800 mb-2">
            {dateRange === "monthly" ? `Month: ${label}` : `Year: ${label}`}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600 font-medium">
                {entry.dataKey}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          &larr; Back
        </button>

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold text-gray-800">Watch Later</h2>
        </motion.header>

        <div className="mb-6">
          <nav className="flex justify-center space-x-1 p-1 bg-white rounded-xl shadow-md max-w-3xl mx-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "rawdata", label: "Raw Data" },
              { id: "transparent", label: "Transparent" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex-1 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-transparent text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "overview" && (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Stats Cards */}
            <motion.section
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-indigo-100">
                        Total Added
                      </h5>
                      <p className="text-3xl font-bold mt-2">{totalAdded}</p>
                    </div>
                    <div className="bg-indigo-400 bg-opacity-30 p-2 rounded-lg">
                      <Play size={24} className="text-indigo-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-indigo-100">Videos in Watch Later</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-green-100">
                        Watched After Adding
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {watchedAfterCount}
                      </p>
                    </div>
                    <div className="bg-green-400 bg-opacity-30 p-2 rounded-lg">
                      <CheckCircle size={24} className="text-green-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-green-100">Videos completed</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-red-100">
                        Still Unwatched
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {unwatchedCount}
                      </p>
                    </div>
                    <div className="bg-red-400 bg-opacity-30 p-2 rounded-lg">
                      <XCircle size={24} className="text-red-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-red-100">Videos pending</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-purple-100">
                        Completion Rate
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {percentWatched}%
                      </p>
                    </div>
                    <div className="bg-purple-400 bg-opacity-30 p-2 rounded-lg">
                      <TrendingUp size={24} className="text-purple-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-purple-100">Watch completion rate</p>
                </div>
              </div>
            </motion.section>

            {/* Pie Chart */}
            <motion.section
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  },
                },
              }}
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-3xl shadow-2xl border border-slate-200/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-xl"></div>

                <div className="relative p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                        Watch Later Completion Status
                      </h4>
                      <p className="text-slate-500 font-medium">
                        Videos watched vs unwatched after adding
                      </p>
                    </div>
                  </div>

                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-inner border border-slate-100/50">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={140}
                          innerRadius={60}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div
                  className="mb-4 mx-8 p-4 bg-white shadow-lg rounded-lg"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    You have added <strong>{totalAdded}</strong> videos to your
                    Watch Later playlist.
                  </p>
                  <p>
                    Of these, <strong>{watchedAfterCount}</strong> videos (
                    {percentWatched}%) were actually watched after being added.
                  </p>
                  <p>
                    <strong>{unwatchedCount}</strong> videos (
                    {100 - percentWatched}%) remain unwatched in your queue.
                  </p>
                  {percentWatched >= 70 && (
                    <p className="text-green-600 font-medium">
                      Great job! You have a high completion rate for your Watch
                      Later videos.
                    </p>
                  )}
                  {percentWatched < 30 && (
                    <p className="text-orange-600 font-medium">
                      Consider reviewing your Watch Later list - many videos
                      remain unwatched.
                    </p>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Bar Chart */}
            <motion.section
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  },
                },
              }}
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-green-50/30 rounded-3xl shadow-2xl border border-slate-200/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-xl"></div>

                <div className="relative p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                        Watch Later Activity Over Time
                      </h4>
                      <p className="text-slate-500 font-medium">
                        Videos added and watched by{" "}
                        {dateRange === "monthly" ? "month" : "year"}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4">
                      {/* Date Range Toggle */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-slate-600" />
                          <div className="flex flex-col">
                            <label className="text-sm font-medium text-slate-700 mb-1">
                              Time Period
                            </label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDateRange("monthly")}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                                  dateRange === "monthly"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                Monthly
                              </button>
                              <button
                                onClick={() => setDateRange("yearly")}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                                  dateRange === "yearly"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                Yearly
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Range Slider */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200">
                        <div className="flex items-center space-x-3">
                          <Sliders className="w-5 h-5 text-slate-600" />
                          <div className="flex flex-col">
                            <label className="text-sm font-medium text-slate-700 mb-1">
                              Show Last: {barChartRange}{" "}
                              {dateRange === "monthly" ? "months" : "years"}
                            </label>
                            <input
                              type="range"
                              min="6"
                              max={dateRange === "monthly" ? "36" : "10"}
                              value={barChartRange}
                              onChange={(e) =>
                                setBarChartRange(parseInt(e.target.value))
                              }
                              className="w-32 h-2 bg-gradient-to-r from-blue-200 to-green-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-inner border border-slate-100/50">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={barChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="period"
                          stroke="#64748b"
                          fontSize={12}
                          tickFormatter={(value) =>
                            dateRange === "monthly"
                              ? value.split("-")[1] +
                                "/" +
                                value.split("-")[0].slice(-2)
                              : value
                          }
                        />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip content={<BarTooltip />} />
                        <Bar
                          dataKey="added"
                          fill="#3b82f6"
                          name="Added"
                          radius={[2, 2, 0, 0]}
                        />
                        <Bar
                          dataKey="watched"
                          fill="#10b981"
                          name="Watched"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div
                  className="mb-4 mx-8 p-4 bg-white shadow-lg rounded-lg"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  {barChartData.length > 0 && (
                    <>
                      <p>
                        Over the displayed time period, your most active{" "}
                        {dateRange === "monthly" ? "month" : "year"} for adding
                        videos was{" "}
                        <strong>
                          {
                            barChartData.reduce((max, curr) =>
                              curr.added > max.added ? curr : max
                            ).period
                          }
                        </strong>{" "}
                        with{" "}
                        <strong>
                          {
                            barChartData.reduce((max, curr) =>
                              curr.added > max.added ? curr : max
                            ).added
                          }
                        </strong>{" "}
                        videos added.
                      </p>
                      <p>
                        Your best completion{" "}
                        {dateRange === "monthly" ? "month" : "year"} was{" "}
                        <strong>
                          {
                            barChartData.reduce((max, curr) =>
                              curr.watched > max.watched ? curr : max
                            ).period
                          }
                        </strong>{" "}
                        where you watched{" "}
                        <strong>
                          {
                            barChartData.reduce((max, curr) =>
                              curr.watched > max.watched ? curr : max
                            ).watched
                          }
                        </strong>{" "}
                        videos after adding them.
                      </p>
                      <p>
                        Total activity in displayed period:{" "}
                        <strong>
                          {barChartData.reduce(
                            (sum, curr) => sum + curr.added,
                            0
                          )}
                        </strong>{" "}
                        added,{" "}
                        <strong>
                          {barChartData.reduce(
                            (sum, curr) => sum + curr.watched,
                            0
                          )}
                        </strong>{" "}
                        watched.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}

        {activeTab === "rawdata" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 mt-8"
          >
            {tableRows.length > 0 ? (
              tableRows.map((row, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.03 }}
                  className="rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                >
                  <div className="p-6 space-y-4">
                    {/* Entry Number Header */}
                    <div className="flex items-center p-4 rounded-xl shadow-lg border-2 bg-gradient-to-r from-gray-100/60 to-gray-200/60 border-gray-200/40 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/30 to-gray-200/30 backdrop-blur-sm"></div>
                      <div className="relative flex items-center space-x-3 pl-8 rounded-lg py-2 pr-4 bg-gradient-to-r from-gray-50/60 to-gray-100/60 backdrop-blur-sm">
                        <div className="p-2 rounded-lg border bg-gradient-to-r from-purple-100/60 to-blue-100/60 border-purple-200/40 backdrop-blur-sm">
                          <Hash className="w-6 h-6 text-purple-700" />
                        </div>
                        <h3 className="text-xl font-bold drop-shadow-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                          Video #{idx + 1}
                        </h3>
                      </div>
                    </div>

                    {/* Two columns layout for fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Video ID */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gradient-to-r from-purple-100/70 to-blue-100/70 backdrop-blur-sm rounded-lg border border-purple-200/40">
                            <Hash className="w-4 h-4 text-purple-700" />
                          </div>
                          <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                            Video ID
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50/60 to-blue-50/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                          <p className="font-semibold text-gray-800 text-sm break-all">
                            {row.videoId}
                          </p>
                        </div>
                      </div>

                      {/* Added Timestamp */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gradient-to-r from-green-100/70 to-emerald-100/70 backdrop-blur-sm rounded-lg border border-green-200/40">
                            <Calendar className="w-4 h-4 text-green-700" />
                          </div>
                          <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
                            Added Date
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-green-50/60 to-emerald-50/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/30">
                          <p className="font-semibold text-gray-800 text-sm">
                            {row.added}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
              >
                <p className="text-gray-500">No Watch Later data.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "transparent" && (
          <div className="space-y-6 pb-20">
            <WatchLaterExplanatoryCard tableRows={tableRows} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mt-8"
            >
              {tableRows.length > 0 ? (
                tableRows.map((row, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.03 }}
                      className={`rounded-xl shadow-lg border transition-all duration-300 ${
                        isFirst && "hidden"
                      } hover:shadow-xl hover:scale-[1.02] ${
                        row.isWatched
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300"
                          : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:border-red-300"
                      }`}
                    >
                      <div className="p-6 space-y-4">
                        {/* Entry Number Header */}
                        <div
                          className={`flex items-center p-4 rounded-xl shadow-lg border-2 relative overflow-hidden ${
                            row.isWatched
                              ? "border-green-200/50 bg-gradient-to-r from-green-50/80 via-emerald-50/60 to-teal-50/80"
                              : "border-red-200/50 bg-gradient-to-r from-red-50/80 via-pink-50/60 to-rose-50/80"
                          }`}
                        >
                          <div
                            className={`absolute inset-0 ${
                              row.isWatched
                                ? "bg-gradient-to-br from-green-100/30 via-emerald-100/20 to-teal-100/30"
                                : "bg-gradient-to-br from-red-100/30 via-pink-100/20 to-rose-100/30"
                            } backdrop-blur-sm`}
                          ></div>
                          <div
                            className={`relative flex items-center space-x-3 pl-8 rounded-lg py-2 pr-4 ${
                              row.isWatched
                                ? "bg-gradient-to-r from-green-50/60 via-emerald-50/40 to-teal-50/60"
                                : "bg-gradient-to-r from-red-50/60 via-pink-50/40 to-rose-50/60"
                            } backdrop-blur-sm`}
                          >
                            <div
                              className={`p-2 rounded-lg border shadow-sm ${
                                row.isWatched
                                  ? "bg-gradient-to-r from-green-100/60 to-emerald-100/60 border-green-200/40"
                                  : "bg-gradient-to-r from-red-100/60 to-pink-100/60 border-red-200/40"
                              } backdrop-blur-sm`}
                            >
                              {row.isWatched ? (
                                <CheckCircle className="w-6 h-6 text-green-700" />
                              ) : (
                                <Clock className="w-6 h-6 text-red-700" />
                              )}
                            </div>
                            <h3
                              className={`text-xl font-bold drop-shadow-lg ${
                                row.isWatched
                                  ? "bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent"
                                  : "bg-gradient-to-r from-red-800 to-pink-700 bg-clip-text text-transparent"
                              }`}
                            >
                              Video #{idx + 1} -{" "}
                              {row.isWatched ? "Watched" : "Pending"}
                            </h3>
                          </div>
                        </div>
                        {/* Three columns layout for fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Video ID */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-gradient-to-r from-purple-100/70 to-blue-100/70 backdrop-blur-sm rounded-lg border border-purple-200/40">
                                <Hash className="w-4 h-4 text-purple-700" />
                              </div>
                              <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                                Video ID
                              </p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50/60 to-blue-50/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                              <p className="font-semibold text-gray-800 text-sm break-all">
                                {row.videoId}
                              </p>
                            </div>
                          </div>
                          {/* Added Timestamp */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-gradient-to-r from-green-100/70 to-emerald-100/70 backdrop-blur-sm rounded-lg border border-green-200/40">
                                <Calendar className="w-4 h-4 text-green-700" />
                              </div>
                              <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
                                Added Date
                              </p>
                            </div>
                            <div className="bg-gradient-to-r from-green-50/60 to-emerald-50/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/30">
                              <p className="font-semibold text-gray-800 text-sm">
                                {row.added}
                              </p>
                            </div>
                          </div>
                          {/* Watched Timestamp */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`p-1.5 backdrop-blur-sm rounded-lg border ${
                                  row.isWatched
                                    ? "bg-gradient-to-r from-blue-100/70 to-indigo-100/70 border-blue-200/40"
                                    : "bg-gradient-to-r from-gray-100/70 to-slate-100/70 border-gray-200/40"
                                }`}
                              >
                                {row.isWatched ? (
                                  <Eye className="w-4 h-4 text-blue-700" />
                                ) : (
                                  <Clock className="w-4 h-4 text-gray-500" />
                                )}
                              </div>
                              <p
                                className={`text-xs font-bold uppercase tracking-wider ${
                                  row.isWatched
                                    ? "text-blue-700"
                                    : "text-gray-500"
                                }`}
                              >
                                Watch Status
                              </p>
                            </div>
                            <div
                              className={`backdrop-blur-sm rounded-lg p-3 border ${
                                row.isWatched
                                  ? "bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border-blue-200/30"
                                  : "bg-gradient-to-r from-gray-50/60 to-slate-50/60 border-gray-200/30"
                              }`}
                            >
                              <p className="font-semibold text-gray-800 text-sm">
                                {row.watched === "–"
                                  ? "Not watched yet"
                                  : row.watched}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
                >
                  <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No Watch Later data available.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
