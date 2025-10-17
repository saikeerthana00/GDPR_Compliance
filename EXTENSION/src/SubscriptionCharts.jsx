import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
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
} from "lucide-react";
import SubscriptionComponent from "./TransparentYoutubeSubscriptions";

export default function SubscriptionsCharts({ report, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [topChannelsCount, setTopChannelsCount] = useState(10);
  const { subscriptions = [], watch = [] } = report;

  // ─────── Build watchCountByChannel ───────
  const watchCountByChannel = useMemo(() => {
    const map = {};
    watch.forEach((item) => {
      if (item.type !== "video" || !item.channelUrl) return;
      try {
        const urlObj = new URL(item.channelUrl);
        const channelId = urlObj.pathname.split("/").pop();
        map[channelId] = (map[channelId] || 0) + 1;
      } catch {
        // ignore invalid URLs
      }
    });
    return map;
  }, [watch]);

  const chartData = useMemo(
    () =>
      subscriptions.map(({ channelId, channelTitle }) => ({
        channelTitle,
        channelId,
        count: watchCountByChannel[channelId] || 0,
      })),
    [subscriptions, watchCountByChannel]
  );

  const unwatched = chartData.filter((c) => c.count === 0);
  const watched = chartData.filter((c) => c.count > 0);
  const percentUnwatched = subscriptions.length
    ? Math.round((unwatched.length / subscriptions.length) * 100)
    : 0;

  // Pie chart colors
  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#84cc16",
    "#f97316",
    "#6366f1",
    "#14b8a6",
    "#eab308",
    "#dc2626",
    "#7c3aed",
    "#059669",
  ];

  const pieData = useMemo(() => {
    return watched
      .sort((a, b) => b.count - a.count)
      .slice(0, topChannelsCount)
      .map((channel, index) => ({
        ...channel,
        color: COLORS[index % COLORS.length],
      }));
  }, [watched, topChannelsCount]);

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-500" />;
    if (index === 2) return <Award className="w-5 h-5 text-orange-500" />;
    return (
      <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">
        #{index + 1}
      </span>
    );
  };

  const getRowBgColor = (index, count) => {
    if (count === 0)
      return "bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-l-red-400";
    if (index === 0)
      return "bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-yellow-400";
    if (index === 1)
      return "bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-l-gray-400";
    if (index === 2)
      return "bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-400";
    return "bg-white hover:bg-gray-50";
  };

  const getBadgeColor = (count) => {
    if (count === 0) return "bg-red-50 text-red-700 border border-red-200";
    if (count >= 50)
      return "bg-green-50 text-green-700 border border-green-200";
    if (count >= 20) return "bg-blue-50 text-blue-700 border border-blue-200";
    if (count >= 10)
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    return "bg-gray-50 text-gray-700 border border-gray-200";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-slate-800 mb-2">
            {data.channelTitle}
          </p>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            ></div>
            <span className="text-slate-600 font-medium">
              {data.count} videos (
              {(
                (data.count /
                  pieData.reduce((sum, item) => sum + item.count, 0)) *
                100
              ).toFixed(1)}
              %)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };
  const CustomLegend = ({ payload }) => {
    const [expanded, setExpanded] = useState(false);
    const limit = 6;
    const items = expanded ? payload : payload.slice(0, limit);

    return (
      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {items.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-slate-700 truncate max-w-24">
              {entry.payload.channelTitle}
            </span>
          </div>
        ))}

        {payload.length > limit && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:underline focus:outline-none"
          >
            {expanded ? "View Less" : `View More (${payload.length - limit})`}
          </button>
        )}
      </div>
    );
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
          <h2 className="text-3xl font-bold text-gray-800">Subscriptions</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-indigo-100">
                        Total Subscriptions
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {subscriptions.length}
                      </p>
                    </div>
                    <div className="bg-indigo-400 bg-opacity-30 p-2 rounded-lg">
                      <Users size={24} className="text-indigo-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-indigo-100">Total YouTube channels</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-yellow-100">
                        Unwatched Channels
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {unwatched.length}
                      </p>
                    </div>
                    <div className="bg-yellow-400 bg-opacity-30 p-2 rounded-lg">
                      <Eye size={24} className="text-yellow-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-yellow-100">
                    No videos watched in 1 year
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-red-100">
                        Unwatched %
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {percentUnwatched}%
                      </p>
                    </div>
                    <div className="bg-red-400 bg-opacity-30 p-2 rounded-lg">
                      <TrendingUp size={24} className="text-red-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-red-100">Percentage unwatched</p>
                </div>
              </div>
            </motion.section>

            {/* Enhanced Pie Chart */}
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
                        Top Watched Channels Distribution
                      </h4>
                      <p className="text-slate-500 font-medium">
                        Videos watched by channel
                      </p>
                    </div>

                    {/* Slider Control */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200">
                      <div className="flex items-center space-x-3">
                        <Sliders className="w-5 h-5 text-slate-600" />
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-slate-700 mb-1">
                            Top Channels: {topChannelsCount}
                          </label>
                          <input
                            type="range"
                            min="5"
                            max={Math.min(watched.length, 20)}
                            value={topChannelsCount}
                            onChange={(e) =>
                              setTopChannelsCount(parseInt(e.target.value))
                            }
                            className="w-32 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-inner border border-slate-100/50">
                    <div className="absolute inset-0 opacity-30 pointer-events-none">
                      <div className="w-full h-full bg-gradient-to-t from-slate-50/50 to-transparent rounded-2xl"></div>
                    </div>

                    <ResponsiveContainer width="100%" height={500}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={180}
                          innerRadius={60}
                          paddingAngle={2}
                          dataKey="count"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          content={<CustomLegend />}
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-b-2xl"></div>
                  </div>
                </div>
                <div
                  className="mb-4 mx-8 p-4 bg-white shadow-lg rounded-lg"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    You are subscribed to{" "}
                    <strong>{subscriptions.length}</strong> YouTube channels.
                  </p>
                  <p>
                    Your top <strong>{topChannelsCount}</strong> most watched
                    channels account for{" "}
                    <strong>
                      {pieData.reduce((sum, item) => sum + item.count, 0)}
                    </strong>{" "}
                    videos watched (
                    {(
                      (pieData.reduce((sum, item) => sum + item.count, 0) /
                        watched.reduce((sum, item) => sum + item.count, 0)) *
                      100
                    ).toFixed(1)}
                    % of all watched content).
                  </p>
                  <p>
                    Your most watched channel is{" "}
                    <strong>{pieData[0]?.channelTitle || "N/A"}</strong> with{" "}
                    <strong>{pieData[0]?.count || 0}</strong> videos watched.
                  </p>
                  {percentUnwatched > 50 && (
                    <p className="text-orange-800 font-medium">
                      Consider unsubscribing from channels you don't watch -{" "}
                      {percentUnwatched}% of your subscriptions haven't been
                      watched recently.
                    </p>
                  )}
                  {percentUnwatched < 20 && (
                    <p className="text-green-800 font-medium">
                      Great curation! You actively watch most of your subscribed
                      channels.
                    </p>
                  )}
                </div>
              </div>
            </motion.section>
            {/* Unwatched Channels Table */}
            <motion.section
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <div className="bg-gradient-to-br from-white to-red-50 rounded-3xl shadow-xl border border-red-200 overflow-hidden">
                <div className="px-8 py-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-3xl font-bold text-red-800">
                        Unwatched Channels (Last Year)
                      </h4>
                    </div>
                    <div className="bg-red-50 rounded-xl px-4 py-2 border border-red-200">
                      <span className="text-sm font-medium text-red-700">
                        {unwatched.length} channels with no activity
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {unwatched.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <Eye className="w-10 h-10 text-green-500" />
                      </div>
                      <p className="text-xl text-green-600 font-medium">
                        Great! All channels have been watched recently
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-red-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
                              <th className="px-6 py-4 text-left text-sm font-bold text-red-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <Hash className="w-4 h-4" />
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-red-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <Type className="w-4 h-4" />
                                  <span>Channel Name</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-red-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <ExternalLink className="w-4 h-4" />
                                  <span>Channel URL</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-red-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <Info className="w-4 h-4" />
                                  <span>Status</span>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-100">
                            {unwatched.map((channel, idx) => {
                              const truncateUrl = (url) => {
                                if (url.length > 35) {
                                  return url.substring(0, 35) + "...";
                                }
                                return url;
                              };

                              return (
                                <tr
                                  key={idx}
                                  className="bg-gradient-to-r from-red-50/30 to-pink-50/30 hover:from-red-50 hover:to-pink-50 transition-all duration-200 border-l-4 border-l-red-300"
                                >
                                  <td className="px-6 py-5">
                                    <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-red-600">
                                      {idx + 1}
                                    </span>
                                  </td>
                                  <td className="px-6 py-5">
                                    <div className="font-semibold text-gray-800">
                                      {channel.channelTitle}
                                    </div>
                                  </td>
                                  <td className="px-3 py-5">
                                    <a
                                      href={
                                        channel.channelUrl ||
                                        `https://www.youtube.com/channel/${channel.channelId}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 font-mono text-sm group"
                                      title={
                                        channel.channelUrl ||
                                        `https://www.youtube.com/channel/${channel.channelId}`
                                      }
                                    >
                                      <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                      <span>
                                        {truncateUrl(
                                          channel.channelUrl ||
                                            `https://www.youtube.com/channel/${channel.channelId}`
                                        )}
                                      </span>
                                    </a>
                                  </td>
                                  <td className="px-3 py-5">
                                    <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
                                      <Eye className="w-4 h-4" />
                                      <span>No videos watched</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="mb-4 mx-8 p-4 bg-white shadow-lg rounded-lg"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  {unwatched.length > 0 ? (
                    <>
                      <p>
                        You have <strong>{unwatched.length}</strong>{" "}
                        subscriptions ({percentUnwatched}%) with no videos
                        watched in the past year.
                      </p>
                      <p>
                        These inactive subscriptions might be cluttering your
                        feed. Consider unsubscribing from channels that no
                        longer align with your interests.
                      </p>
                      {unwatched.length > subscriptions.length * 0.3 && (
                        <p className="text-orange-800 font-medium">
                          Tip: Having many inactive subscriptions can make it
                          harder to discover content from channels you actually
                          watch.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-green-800 font-medium">
                      Excellent! All your subscriptions are active - you've
                      watched content from every channel you're subscribed to.
                    </p>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Watched Channels Table */}
            <motion.section
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-8 py-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-3xl font-bold text-black">
                        Watched Channels
                      </h4>
                    </div>
                    <div className="bg-green-50 rounded-xl px-4 py-2 border border-green-200">
                      <span className="text-sm font-medium text-green-700">
                        {watched.length} channels with activity
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {watched.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-xl text-gray-500 font-medium">
                        No watched channels to display
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>Rank</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <Type className="w-4 h-4" />
                                  <span>Channel Name</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <ExternalLink className="w-4 h-4" />
                                  <span>Channel URL</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <Eye className="w-4 h-4" />
                                  <span>Videos Watched</span>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {watched
                              .sort((a, b) => b.count - a.count)
                              .map((channel, idx) => {
                                const truncateUrl = (url) => {
                                  if (url.length > 35) {
                                    return url.substring(0, 35) + "...";
                                  }
                                  return url;
                                };

                                return (
                                  <tr
                                    key={idx}
                                    className={`${getRowBgColor(
                                      idx,
                                      channel.count
                                    )} transition-all duration-200 hover:shadow-md`}
                                  >
                                    <td className="px-6 py-5">
                                      <div className="flex items-center justify-center">
                                        {getRankIcon(idx)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-5">
                                      <div className="font-semibold text-gray-800">
                                        {channel.channelTitle}
                                      </div>
                                    </td>
                                    <td className="px-3 py-5">
                                      <a
                                        href={
                                          channel.channelUrl ||
                                          `https://www.youtube.com/channel/${channel.channelId}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all duration-200 font-mono text-sm group"
                                        title={
                                          channel.channelUrl ||
                                          `https://www.youtube.com/channel/${channel.channelId}`
                                        }
                                      >
                                        <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span>
                                          {truncateUrl(
                                            channel.channelUrl ||
                                              `https://www.youtube.com/channel/${channel.channelId}`
                                          )}
                                        </span>
                                      </a>
                                    </td>
                                    <td className="px-3 py-5">
                                      <div className="flex items-center space-x-3">
                                        <div
                                          className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold ${getBadgeColor(
                                            channel.count
                                          )}`}
                                        >
                                          <Eye className="w-4 h-4" />
                                          <span>{channel.count}</span>
                                        </div>
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                            style={{
                                              width: `${
                                                watched.length > 0
                                                  ? (channel.count /
                                                      Math.max(
                                                        ...watched.map(
                                                          (v) => v.count
                                                        )
                                                      )) *
                                                    100
                                                  : 0
                                              }%`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="mb-4 mx-8 p-4 bg-white shadow-lg rounded-lg"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    You have actively watched content from{" "}
                    <strong>{watched.length}</strong> channels (
                    {Math.round((watched.length / subscriptions.length) * 100)}%
                    of your subscriptions).
                  </p>
                  <p>
                    Total videos watched:{" "}
                    <strong>
                      {watched.reduce((sum, channel) => sum + channel.count, 0)}
                    </strong>{" "}
                    across all active channels.
                  </p>
                  <p>
                    Your viewing is{" "}
                    {watched.filter((c) => c.count >= 10).length >
                    watched.length * 0.7
                      ? "well-distributed"
                      : "concentrated"}{" "}
                    -{" "}
                    <strong>
                      {watched.filter((c) => c.count >= 10).length}
                    </strong>{" "}
                    channels have 10+ videos watched, while{" "}
                    <strong>
                      {watched.filter((c) => c.count >= 50).length}
                    </strong>{" "}
                    channels have 50+ videos watched.
                  </p>
                  {watched[0]?.count > 100 && (
                    <p className="text-green-800 font-medium">
                      You're a super fan of{" "}
                      <strong>{watched[0].channelTitle}</strong> with{" "}
                      {watched[0].count} videos watched!
                    </p>
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
            className="space-y-6 mt-8"
          >
            {subscriptions.length > 0 ? (
              subscriptions.map((sub, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.03 }}
                  className="bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-gray-200 hover:border-gray-300"
                >
                  <div className="p-6 space-y-4">
                    {/* Entry Number Header */}
                    <div className="flex items-center p-4 rounded-xl shadow-lg border-2 border-blue-200/50 relative overflow-hidden bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/80">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30 backdrop-blur-sm"></div>
                      <div className="relative flex items-center bg-gradient-to-r from-blue-50/60 via-purple-50/40 to-pink-50/60 backdrop-blur-sm space-x-3 pl-8 rounded-lg py-2 pr-4">
                        <div className="p-2 bg-gradient-to-r from-blue-100/60 to-purple-100/60 backdrop-blur-sm rounded-lg border border-blue-200/40 shadow-sm">
                          <Users className="w-6 h-6 text-blue-700" />
                        </div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
                          Subscription #{idx + 1}
                        </h3>
                      </div>
                    </div>

                    {/* Three columns layout for fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Channel ID */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gradient-to-r from-purple-100/70 to-blue-100/70 backdrop-blur-sm rounded-lg border border-purple-200/40">
                            <Hash className="w-4 h-4 text-purple-700" />
                          </div>
                          <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                            Channel ID
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50/60 to-blue-50/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                          <p className="font-semibold text-gray-800 text-sm break-all">
                            {sub.channelId}
                          </p>
                        </div>
                      </div>

                      {/* Channel URL */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gradient-to-r from-green-100/70 to-emerald-100/70 backdrop-blur-sm rounded-lg border border-green-200/40">
                            <ExternalLink className="w-4 h-4 text-green-700" />
                          </div>
                          <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
                            Channel URL
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-green-50/60 to-emerald-50/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/30">
                          <a
                            href={sub.channelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-indigo-700 text-sm hover:text-purple-700 hover:underline transition-colors duration-200 break-all"
                          >
                            {sub.channelUrl}
                          </a>
                        </div>
                      </div>

                      {/* Channel Title */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gradient-to-r from-blue-100/70 to-indigo-100/70 backdrop-blur-sm rounded-lg border border-blue-200/40">
                            <Type className="w-4 h-4 text-blue-700" />
                          </div>
                          <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">
                            Channel Title
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30">
                          <p className="font-semibold text-gray-800 text-sm">
                            {sub.channelTitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Watch Count Info */}
                    {/* <div className="bg-gradient-to-r from-yellow-50/60 to-amber-50/60 backdrop-blur-sm rounded-lg p-4 border border-yellow-200/30 mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye className="w-4 h-4 text-amber-700" />
                        <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">
                          Videos Watched (Last Year)
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800 text-lg">
                        {watchCountByChannel[sub.channelId] || 0} videos
                      </p>
                    </div> */}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
              >
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No subscriptions available.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "transparent" && (
          <SubscriptionComponent subscriptions={subscriptions} />
        )}
      </div>
    </main>
  );
}
