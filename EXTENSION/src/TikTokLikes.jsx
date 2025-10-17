import React, { useMemo, useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Hash,
  Link as LinkIcon,
  Calendar,
  Play,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  Activity,
  Heart,
  Eye,
  Sliders,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

function LikesExplanatoryCard({ rows }) {
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const explanationRef = useRef(null);
  const placeholderRef = useRef(null);
  const sentinelRef = useRef(null);

  const firstEntry = useMemo(() => {
    const first = rows?.[0];
    return {
      url: first?.url || "https://www.tiktok.com/@user/video/123",
      date: first?.date || new Date().toUTCString(),
    };
  }, [rows]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const s = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setIsSticky(s);
      },
      { threshold: 0 }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!placeholderRef.current || !explanationRef.current) return;
    placeholderRef.current.style.height = isSticky
      ? `${explanationRef.current.getBoundingClientRect().height}px`
      : "0px";
  }, [isSticky, isExplanationExpanded]);

  return (
    <>
      <div
        ref={sentinelRef}
        style={{
          height: "1px",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          pointerEvents: "none",
        }}
      />
      <div
        ref={placeholderRef}
        style={{
          height: 0,
          transition: "height 0.2s ease-out",
        }}
      />
      <motion.div
        ref={explanationRef}
        className={`${
          isSticky ? "fixed top-0 left-0 right-0 z-50" : "relative"
        } bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm transition-all duration-300 ease-out`}
        style={
          isSticky
            ? {
                maxWidth: "100%",
                margin: "0 auto",
                left: "1rem",
                right: "1rem",
              }
            : {}
        }
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0, scale: isSticky ? 0.98 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-xl" />
        </div>

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Understanding Your TikTok Likes
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsExplanationExpanded((v) => !v)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              {isExplanationExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {isExplanationExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-purple-800">Video</h4>
                      </div>
                      <p className="text-sm text-purple-700">
                        The TikTok post you liked
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                          <LinkIcon className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-blue-800">Link</h4>
                      </div>
                      <p className="text-sm text-blue-700">
                        Direct URL to open the video
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-green-800">
                          Liked On
                        </h4>
                      </div>
                      <p className="text-sm text-green-700">
                        Timestamp when you tapped like
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 shadow-sm border">
                        <p className="text-lg font-semibold text-gray-900 mb-4">
                          Latest Like
                        </p>
                        <div className="space-y-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <LinkIcon className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-700">
                                Video URL
                              </p>
                              <a
                                href={firstEntry.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-900 text-sm break-all inline-flex items-center gap-1"
                              >
                                {firstEntry.url}
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Liked On
                              </p>
                              <p className="text-gray-900 text-sm">
                                {firstEntry.date}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <motion.div
                        className="flex items-center space-x-4 pt-8"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex-shrink-0">
                          <svg
                            className="w-12 h-8"
                            viewBox="0 0 48 32"
                            fill="none"
                          >
                            <path
                              d="M2 16 L38 16 M30 8 L38 16 L30 24"
                              stroke="url(#g1)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <defs>
                              <linearGradient
                                id="g1"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-blue-800">
                            Open Link
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Go to the liked TikTok post
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center space-x-4 mt-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex-shrink-0">
                          <svg
                            className="w-12 h-8"
                            viewBox="0 0 48 32"
                            fill="none"
                          >
                            <path
                              d="M2 16 L38 16 M30 8 L38 16 L30 24"
                              stroke="url(#g2)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <defs>
                              <linearGradient
                                id="g2"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-green-800">
                            Timestamp
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Exact UTC time you liked it
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

export default function TikTokLikes({ userData, onBack }) {
  const [tab, setTab] = useState("overview");
  const [rangeMode, setRangeMode] = useState("monthly");
  const [barRange, setBarRange] = useState(12);

  const likes =
    userData?.["Your Activity"]?.["Like List"]?.ItemFavoriteListNormalized ||
    userData?.["Your Activity"]?.["Like List"]?.ItemFavoriteList ||
    [];

  const watchHistory =
    userData?.["Your Activity"]?.["Watch History"]?.VideoList || [];

  const rows = useMemo(
    () =>
      likes.map((e, i) => ({
        id: i,
        url: e.Link || e.link || "",
        date: e.Date ? new Date(e.Date).toUTCString() : "",
        timestamp: e.Date ? new Date(e.Date).getTime() : 0,
      })),
    [likes]
  );

  // Activity data for charts
  const activityData = useMemo(() => {
    if (!likes.length || !watchHistory.length) return [];

    const dataMap = new Map();

    // Process likes
    likes.forEach((like) => {
      if (!like.Date) return;
      const date = new Date(like.Date);
      const key =
        rangeMode === "monthly"
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}`
          : `${date.getFullYear()}`;

      if (!dataMap.has(key)) {
        dataMap.set(key, { period: key, likes: 0, watches: 0, activity: 0 });
      }
      const entry = dataMap.get(key);
      entry.likes += 1;
      entry.activity += 1;
    });

    // Process watch history
    watchHistory.forEach((watch) => {
      if (!watch.Date) return;
      const date = new Date(watch.Date);
      const key =
        rangeMode === "monthly"
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}`
          : `${date.getFullYear()}`;

      if (!dataMap.has(key)) {
        dataMap.set(key, { period: key, likes: 0, watches: 0, activity: 0 });
      }
      const entry = dataMap.get(key);
      entry.watches += 1;
      entry.activity += 1;
    });

    return Array.from(dataMap.values())
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-barRange);
  }, [likes, watchHistory, rangeMode, barRange]);

  // Hourly activity data
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      likes: 0,
      watches: 0,
      total: 0,
    }));

    likes.forEach((like) => {
      if (!like.Date) return;
      const hour = new Date(like.Date).getHours();
      hours[hour].likes += 1;
      hours[hour].total += 1;
    });

    watchHistory.forEach((watch) => {
      if (!watch.Date) return;
      const hour = new Date(watch.Date).getHours();
      hours[hour].watches += 1;
      hours[hour].total += 1;
    });

    return hours;
  }, [likes, watchHistory]);

  // Activity summary stats
  const activitySummaryStats = useMemo(() => {
    const totalLikes = activityData.reduce((sum, item) => sum + item.likes, 0);
    const totalWatches = activityData.reduce(
      (sum, item) => sum + item.watches,
      0
    );
    const peakPeriod = activityData.reduce(
      (max, item) =>
        item.likes + item.watches > max.likes + max.watches ? item : max,
      { period: "", likes: 0, watches: 0 }
    );
    const avgLikesPerPeriod =
      totalLikes > 0 ? Math.round(totalLikes / barRange) : 0;
    const avgWatchesPerPeriod =
      totalWatches > 0 ? Math.round(totalWatches / barRange) : 0;

    return {
      totalLikes,
      totalWatches,
      peakPeriod,
      avgLikesPerPeriod,
      avgWatchesPerPeriod,
    };
  }, [activityData, barRange]);

  // Hourly summary stats
  const hourlySummaryStats = useMemo(() => {
    const peakHour = hourlyData.reduce(
      (max, item) => (item.total > max.total ? item : max),
      { hour: 0, total: 0 }
    );
    const mostActiveLikingHour = hourlyData.reduce(
      (max, item) => (item.likes > max.likes ? item : max),
      { hour: 0, likes: 0 }
    );
    const mostActiveWatchingHour = hourlyData.reduce(
      (max, item) => (item.watches > max.watches ? item : max),
      { hour: 0, watches: 0 }
    );
    const totalHourlyActivity = hourlyData.reduce(
      (sum, item) => sum + item.total,
      0
    );

    return {
      peakHour,
      mostActiveLikingHour,
      mostActiveWatchingHour,
      totalActivity: totalHourlyActivity,
    };
  }, [hourlyData]);

  // Statistics
  const stats = useMemo(() => {
    if (!rows.length) return {};

    const totalLikes = rows.length;
    const totalWatches = watchHistory.length;

    // Find most active hour for likes
    const likesHourCounts = {};
    likes.forEach((like) => {
      if (!like.Date) return;
      const hour = new Date(like.Date).getHours();
      likesHourCounts[hour] = (likesHourCounts[hour] || 0) + 1;
    });

    const mostActiveLikeHour = Object.entries(likesHourCounts).reduce(
      (max, [hour, count]) =>
        count > max.count ? { hour: +hour, count } : max,
      { hour: 0, count: 0 }
    );

    // Calculate engagement rate (likes per watches)
    const engagementRate =
      totalWatches > 0 ? (totalLikes / totalWatches) * 100 : 0;

    return {
      totalLikes,
      totalWatches,
      engagementRate: engagementRate.toFixed(1),
      mostActiveLikeHour: mostActiveLikeHour.hour,
      firstLike: rows.length ? rows[rows.length - 1].date : "–",
      mostRecentLike: rows.length ? rows[0].date : "–",
    };
  }, [rows, likes, watchHistory]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-slate-800 mb-2">
            {rangeMode === "monthly" ? `Month: ${label}` : `Year: ${label}`}
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

  const HourlyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-slate-800 mb-2">
            {label}:00 - {(label + 1) % 24}:00
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
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold text-gray-800">Liked Posts</h2>
        </motion.header>

        <div className="mb-6">
          <nav className="flex justify-center space-x-1 p-1 bg-white rounded-xl shadow-md max-w-3xl mx-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "rawdata", label: "Raw Data" },
              { id: "transparent", label: "Transparent" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex-1 ${
                  tab === t.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-transparent text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {tab === "overview" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Stats Cards */}
            <motion.section variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-indigo-100">
                        Total Likes
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {stats.totalLikes}
                      </p>
                    </div>
                    <div className="bg-indigo-400/30 p-2 rounded-lg">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="mt-3 text-indigo-100">Posts you liked</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-emerald-100">
                        Total Watches
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {stats.totalWatches}
                      </p>
                    </div>
                    <div className="bg-emerald-400/30 p-2 rounded-lg">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="mt-3 text-emerald-100">Videos watched</p>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-rose-100">
                        Engagement Rate
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {stats.engagementRate}%
                      </p>
                    </div>
                    <div className="bg-rose-400/30 p-2 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="mt-3 text-rose-100">Likes per 100 watches</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-purple-100">
                        Most Active Hour
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {stats.mostActiveLikeHour}:00
                      </p>
                    </div>
                    <div className="bg-purple-400/30 p-2 rounded-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="mt-3 text-purple-100">Peak liking time</p>
                </div>
              </div>
            </motion.section>

            {/* Active Participation Time Chart */}
            <motion.section variants={itemVariants}>
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-3xl shadow-2xl border border-slate-200/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-xl"></div>

                <div className="relative p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                        Active Participation Over Time
                      </h4>
                      <p className="text-slate-500 font-medium">
                        Browsing vs liking behavior by{" "}
                        {rangeMode === "monthly" ? "month" : "year"}
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-slate-600" />
                          <div className="flex flex-col">
                            <label className="text-sm font-medium text-slate-700 mb-1">
                              Time Period
                            </label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setRangeMode("monthly")}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                                  rangeMode === "monthly"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                Monthly
                              </button>
                              <button
                                onClick={() => setRangeMode("yearly")}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                                  rangeMode === "yearly"
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

                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200">
                        <div className="flex items-center space-x-3">
                          <Sliders className="w-5 h-5 text-slate-600" />
                          <div className="flex flex-col">
                            <label className="text-sm font-medium text-slate-700 mb-1">
                              Show Last: {barRange}{" "}
                              {rangeMode === "monthly" ? "months" : "years"}
                            </label>
                            <input
                              type="range"
                              min="6"
                              max={rangeMode === "monthly" ? "36" : "10"}
                              value={barRange}
                              onChange={(e) =>
                                setBarRange(parseInt(e.target.value))
                              }
                              className="w-32 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-inner border border-slate-100/50">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={activityData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="period"
                          stroke="#64748b"
                          fontSize={12}
                          tickFormatter={(value) =>
                            rangeMode === "monthly"
                              ? value.split("-")[1] +
                                "/" +
                                value.split("-")[0].slice(-2)
                              : value
                          }
                        />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="watches"
                          fill="#10b981"
                          name="Watches"
                          radius={[0, 0, 4, 4]}
                        />
                        <Bar
                          dataKey="likes"
                          fill="#3b82f6"
                          name="Likes"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Activity Chart Summary */}
                    <div
                      className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                      style={{
                        fontSize: "14px",
                        color: "#333",
                        lineHeight: "1.6",
                      }}
                    >
                      <p>
                        Over the last <strong>{barRange}</strong>{" "}
                        {rangeMode === "monthly" ? "months" : "years"}, you
                        liked <strong>{activitySummaryStats.totalLikes}</strong>{" "}
                        posts and watched{" "}
                        <strong>{activitySummaryStats.totalWatches}</strong>{" "}
                        videos.
                      </p>
                      {activitySummaryStats.peakPeriod.period && (
                        <p>
                          Your most active period was{" "}
                          <strong>
                            {rangeMode === "monthly"
                              ? activitySummaryStats.peakPeriod.period.split(
                                  "-"
                                )[1] +
                                "/" +
                                activitySummaryStats.peakPeriod.period
                                  .split("-")[0]
                                  .slice(-2)
                              : activitySummaryStats.peakPeriod.period}
                          </strong>{" "}
                          with{" "}
                          <strong>
                            {activitySummaryStats.peakPeriod.likes}
                          </strong>{" "}
                          likes and{" "}
                          <strong>
                            {activitySummaryStats.peakPeriod.watches}
                          </strong>{" "}
                          watches.
                        </p>
                      )}
                      {activitySummaryStats.avgLikesPerPeriod > 0 && (
                        <p>
                          On average, you liked{" "}
                          <strong>
                            {activitySummaryStats.avgLikesPerPeriod}
                          </strong>{" "}
                          posts and watched{" "}
                          <strong>
                            {activitySummaryStats.avgWatchesPerPeriod}
                          </strong>{" "}
                          videos per{" "}
                          {rangeMode === "monthly" ? "month" : "year"}.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Hourly Activity Pattern */}
            <motion.section variants={itemVariants}>
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-green-50/30 rounded-3xl shadow-2xl border border-slate-200/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-50"></div>

                <div className="relative p-8">
                  <div className="mb-8">
                    <h4 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                      Daily Activity Pattern
                    </h4>
                    <p className="text-slate-500 font-medium">
                      Hourly distribution of likes and watches
                    </p>
                  </div>

                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-inner border border-slate-100/50">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={hourlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="hour"
                          stroke="#64748b"
                          fontSize={12}
                          tickFormatter={(value) => `${value}:00`}
                        />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <RTooltip content={<HourlyTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="watches"
                          stackId="1"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                          name="Watches"
                        />
                        <Area
                          type="monotone"
                          dataKey="likes"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.8}
                          name="Likes"
                        />
                      </AreaChart>
                    </ResponsiveContainer>

                    {/* Hourly Chart Summary */}
                    <div
                      className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                      style={{
                        fontSize: "14px",
                        color: "#333",
                        lineHeight: "1.6",
                      }}
                    >
                      <p>
                        Your peak activity hour is{" "}
                        <strong>{hourlySummaryStats.peakHour.hour}:00</strong>{" "}
                        with{" "}
                        <strong>{hourlySummaryStats.peakHour.total}</strong>{" "}
                        total activities.
                      </p>
                      {hourlySummaryStats.mostActiveLikingHour.likes > 0 && (
                        <p>
                          You like posts most actively at{" "}
                          <strong>
                            {hourlySummaryStats.mostActiveLikingHour.hour}:00
                          </strong>{" "}
                          (
                          <strong>
                            {hourlySummaryStats.mostActiveLikingHour.likes}
                          </strong>{" "}
                          likes).
                        </p>
                      )}
                      {hourlySummaryStats.mostActiveWatchingHour.watches >
                        0 && (
                        <p>
                          Your busiest watching hour is{" "}
                          <strong>
                            {hourlySummaryStats.mostActiveWatchingHour.hour}:00
                          </strong>{" "}
                          with{" "}
                          <strong>
                            {hourlySummaryStats.mostActiveWatchingHour.watches}
                          </strong>{" "}
                          videos watched.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}

        {tab === "rawdata" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mt-8"
          >
            {rows.length ? (
              rows.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.02, 1) }}
                  className="bg-white rounded-xl shadow-lg border transition-all hover:shadow-xl hover:scale-[1.01] border-gray-200"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                        <Hash className="w-5 h-5 text-indigo-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        Like #{i + 1}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Video URL
                        </p>
                        <a
                          href={r.url}
                          className="font-medium text-indigo-600 hover:text-indigo-800 break-all inline-flex items-center gap-1"
                          title={r.url}
                        >
                          {r.url || "Unknown"}{" "}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Liked On
                        </p>
                        <p className="font-medium text-gray-900 text-sm">
                          {r.date}
                        </p>
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
                <p className="text-gray-500">No likes found.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === "transparent" && (
          <div className="space-y-6 pb-20">
            <LikesExplanatoryCard rows={rows} />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mt-8"
            >
              {rows.length ? (
                rows.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.02, 1) }}
                    className="bg-white rounded-xl shadow-lg border transition-all hover:shadow-xl hover:scale-[1.01] border-gray-200"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                          <Hash className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          Like #{i + 1}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Video URL
                          </p>
                          <a
                            href={r.url}
                            className="font-medium text-indigo-600 hover:text-indigo-800 break-all inline-flex items-center gap-1"
                          >
                            {r.url || "Unknown"}{" "}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Liked On
                          </p>
                          <p className="font-medium text-gray-900 text-sm">
                            {r.date}
                          </p>
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
                  <p className="text-gray-500">No likes available.</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
