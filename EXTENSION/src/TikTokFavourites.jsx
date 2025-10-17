import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "recharts";
import {
  Hash,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Sliders,
  Play,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"];

function FavExplanatoryCard({ rows }) {
  const [expanded, setExpanded] = useState(true);
  const [sticky, setSticky] = useState(false);
  const explanationRef = useRef(null);
  const placeholderRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const s = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (s !== sticky) setSticky(s);
      },
      { threshold: 0 }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [sticky]);

  useEffect(() => {
    if (!placeholderRef.current || !explanationRef.current) return;
    placeholderRef.current.style.height = sticky
      ? `${explanationRef.current.getBoundingClientRect().height}px`
      : "0px";
  }, [sticky, expanded]);

  const first = rows?.[0] || {
    url: "https://www.tiktok.com/@user/video/123",
    added: new Date().toUTCString(),
    watched: "–",
    isWatched: false,
  };

  return (
    <>
      <div
        ref={sentinelRef}
        style={{
          height: 1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          pointerEvents: "none",
        }}
      />
      <div
        ref={placeholderRef}
        style={{ height: 0, transition: "height .2s ease-out" }}
      />
      <div
        ref={explanationRef}
        className={`${
          sticky ? "fixed top-0 left-0 right-0 z-50" : "relative"
        } bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm transition-all duration-300 ease-out ${
          sticky ? "scale-98" : "scale-100"
        }`}
        style={
          sticky
            ? {
                maxWidth: "100%",
                margin: "0 auto",
                left: "1rem",
                right: "1rem",
              }
            : {}
        }
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-xl" />
        </div>

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Favourites Guide
                </h3>
                <p className="text-sm text-gray-600">
                  Understanding your saved TikTok videos
                </p>
              </div>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              expanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-lg font-semibold text-gray-900">
                        Video #1
                      </p>
                      <div
                        className={`p-1 rounded-lg ${
                          first.isWatched
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {first.isWatched ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Hash className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Video URL:
                          </p>
                          <a
                            href={first.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm break-all inline-flex items-center gap-1"
                          >
                            {first.url.length > 50
                              ? `${first.url.substring(0, 50)}...`
                              : first.url}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Added:
                          </p>
                          <p className="text-gray-900 text-sm">{first.added}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            first.isWatched ? "bg-blue-100" : "bg-gray-100"
                          }`}
                        >
                          <Eye
                            className={`w-4 h-4 ${
                              first.isWatched
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Status:
                          </p>
                          <p className="text-gray-900 text-sm">
                            {first.watched === "–"
                              ? "Not watched yet"
                              : `Watched on ${first.watched}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 min-h-[80px]">
                    <div className="flex-shrink-0">
                      <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                        <path
                          d="M2 16 L38 16 M30 8 L38 16 L30 24"
                          stroke="url(#gradient1)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <defs>
                          <linearGradient
                            id="gradient1"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 flex-1">
                      <p className="text-sm font-medium text-purple-800 mb-1">
                        Video URL
                      </p>
                      <p className="text-xs text-purple-600">
                        Direct TikTok link to the saved video
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 min-h-[64px]">
                    <div className="flex-shrink-0">
                      <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                        <path
                          d="M2 16 L38 16 M30 8 L38 16 L30 24"
                          stroke="url(#gradient2)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <defs>
                          <linearGradient
                            id="gradient2"
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
                        Save Date
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        When you favourited this video
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 min-h-[64px]">
                    <div className="flex-shrink-0">
                      <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                        <path
                          d="M2 16 L38 16 M30 8 L38 16 L30 24"
                          stroke="url(#gradient3)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <defs>
                          <linearGradient
                            id="gradient3"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        Watch Status
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Whether you later watched the same video
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      <p className="text-sm font-medium text-orange-800">
                        Color Coding
                      </p>
                    </div>
                    <p className="text-xs text-blue-700">
                      <span className="text-green-700 font-medium">
                        Green cards
                      </span>{" "}
                      = Watched videos
                      <br />
                      <span className="text-red-700 font-medium">
                        Red cards
                      </span>{" "}
                      = Still pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TikTokFavourites({ userData, onBack }) {
  const [tab, setTab] = useState("overview");
  const [rangeMode, setRangeMode] = useState("monthly");
  const [barRange, setBarRange] = useState(7);

  const favs =
    userData?.["Your Activity"]?.["Favorite Videos"]
      ?.FavoriteVideoListNormalized ||
    userData?.["Your Activity"]?.["Favorite Videos"]?.FavoriteVideoList ||
    [];

  const watch = userData?.["Your Activity"]?.["Watch History"]?.VideoList || [];

  const watchMap = useMemo(() => {
    const m = {};
    watch.forEach((w) => {
      const link = w.Link || w.link || "";
      if (!link) return;
      const t = w.Date ? new Date(w.Date).getTime() : 0;
      if (!m[link] || t > m[link]) m[link] = t;
    });
    return m;
  }, [watch]);

  const total = favs.length;

  const watchedAfter = useMemo(
    () =>
      favs.filter((f) => {
        const link = f.Link || f.link || "";
        const at = f.Date ? new Date(f.Date).getTime() : 0;
        const wt = watchMap[link];
        return wt && wt > at;
      }).length,
    [favs, watchMap]
  );

  const unwatched = total - watchedAfter;
  const pct = total ? Math.round((watchedAfter / total) * 100) : 0;

  const pieData = [
    { name: "Watched", value: watchedAfter, color: "#10b981" },
    { name: "Unwatched", value: unwatched, color: "#ef4444" },
  ];

  const barDataSaved = useMemo(() => {
    if (!favs.length) return [];
    const g = {};
    favs.forEach((f) => {
      const at = f.Date ? new Date(f.Date) : null;
      if (!at) return;
      const key =
        rangeMode === "monthly"
          ? `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}`
          : `${at.getFullYear()}`;
      if (!g[key]) g[key] = { period: key, added: 0, watched: 0 };
      g[key].added++;
      const link = f.Link || f.link || "";
      const wt = watchMap[link];
      if (wt && wt > at.getTime()) g[key].watched++;
    });
    return Object.values(g)
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-barRange);
  }, [favs, watchMap, rangeMode, barRange]);

  const barDataAny = useMemo(() => {
    const saved = {};
    const watched = {};
    favs.forEach((f) => {
      const at = f.Date ? new Date(f.Date) : null;
      if (!at) return;
      const key =
        rangeMode === "monthly"
          ? `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}`
          : `${at.getFullYear()}`;
      saved[key] = (saved[key] || 0) + 1;
    });
    watch.forEach((w) => {
      const at = w.Date ? new Date(w.Date) : null;
      if (!at) return;
      const key =
        rangeMode === "monthly"
          ? `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}`
          : `${at.getFullYear()}`;
      watched[key] = (watched[key] || 0) + 1;
    });
    const keys = Array.from(
      new Set([...Object.keys(saved), ...Object.keys(watched)])
    );
    const rows = keys
      .map((k) => ({
        period: k,
        saved: saved[k] || 0,
        watched: watched[k] || 0,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-barRange);
    return rows;
  }, [favs, watch, rangeMode, barRange]);

  // Additional summary calculations
  const peakSavingPeriod = useMemo(() => {
    if (!barDataSaved.length) return null;
    return barDataSaved.reduce((max, curr) =>
      curr.added > max.added ? curr : max
    );
  }, [barDataSaved]);

  const bestCompletionPeriod = useMemo(() => {
    if (!barDataSaved.length) return null;
    return barDataSaved.reduce((max, curr) => {
      const rate = curr.added > 0 ? (curr.watched / curr.added) * 100 : 0;
      const maxRate = max.added > 0 ? (max.watched / max.added) * 100 : 0;
      return rate > maxRate ? curr : max;
    });
  }, [barDataSaved]);

  const peakWatchingPeriod = useMemo(() => {
    if (!barDataAny.length) return null;
    return barDataAny.reduce((max, curr) =>
      curr.watched > max.watched ? curr : max
    );
  }, [barDataAny]);

  const rows = useMemo(
    () =>
      favs.map((f, i) => {
        const link = f.Link || f.link || "";
        const at = f.Date ? new Date(f.Date).getTime() : 0;
        const wt = watchMap[link];
        return {
          id: i,
          url: link,
          added: f.Date ? new Date(f.Date).toUTCString() : "",
          watched: wt ? new Date(wt).toUTCString() : "–",
          isWatched: !!wt && wt > at,
        };
      }),
    [favs, watchMap]
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
            />
            <span className="text-slate-600 font-medium">
              {data.value} videos ({((data.value / total) * 100).toFixed(1)}%)
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
          <h2 className="text-3xl font-bold text-gray-800">Favourites</h2>
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
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
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
                        Total Saved
                      </h5>
                      <p className="text-3xl font-bold mt-2">{total}</p>
                    </div>
                    <div className="bg-indigo-400 bg-opacity-30 p-2 rounded-lg">
                      <Play size={24} className="text-indigo-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-indigo-100">Videos in Favourites</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-green-100">
                        Watched After Saving
                      </h5>
                      <p className="text-3xl font-bold mt-2">{watchedAfter}</p>
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
                      <p className="text-3xl font-bold mt-2">{unwatched}</p>
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
                      <p className="text-3xl font-bold mt-2">{pct}%</p>
                    </div>
                    <div className="bg-purple-400 bg-opacity-30 p-2 rounded-lg">
                      <TrendingUp size={24} className="text-purple-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-purple-100">Watch completion rate</p>
                </div>
              </div>
            </motion.section>

            <motion.section
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
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
                        Favourites Completion Status
                      </h4>
                      <p className="text-slate-500 font-medium">
                        Videos watched vs unwatched after saving
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
                        <RTooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div
                    className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      lineHeight: "1.6",
                    }}
                  >
                    <p>
                      Out of <strong>{total}</strong> saved videos, you have
                      watched <strong>{watchedAfter}</strong> after saving them.
                    </p>
                    <p>
                      Your completion rate is <strong>{pct}%</strong>, with{" "}
                      <strong>{unwatched}</strong> videos still unwatched.
                    </p>
                    {pct >= 70 && (
                      <p className="text-green-600 font-medium">
                        Great job! You have a high completion rate for your
                        saved videos.
                      </p>
                    )}
                    {pct < 30 && (
                      <p className="text-orange-600 font-medium">
                        You might want to revisit your saved videos - there are
                        many unwatched ones!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
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
                        Any Video Watched vs Saved
                      </h4>
                      <p className="text-slate-500 font-medium">
                        Total watch history vs favourites by{" "}
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
                        data={barDataAny}
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
                        <RTooltip content={<BarTooltip />} />
                        <Bar
                          dataKey="saved"
                          fill="#3b82f6"
                          name="Saved"
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

                  <div
                    className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      lineHeight: "1.6",
                    }}
                  >
                    {peakWatchingPeriod && (
                      <p>
                        Your peak watching{" "}
                        {rangeMode === "monthly" ? "month" : "year"} was{" "}
                        <strong>{peakWatchingPeriod.period}</strong> with{" "}
                        <strong>{peakWatchingPeriod.watched}</strong> videos
                        watched.
                      </p>
                    )}
                    <p>
                      Over the last <strong>{barRange}</strong>{" "}
                      {rangeMode === "monthly" ? "months" : "years"}, you saved{" "}
                      <strong>
                        {barDataAny.reduce((sum, d) => sum + d.saved, 0)}
                      </strong>{" "}
                      videos and watched{" "}
                      <strong>
                        {barDataAny.reduce((sum, d) => sum + d.watched, 0)}
                      </strong>{" "}
                      videos in total.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
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
                        Saved Videos Watched vs Saved
                      </h4>
                      <p className="text-slate-500 font-medium">
                        Saved vs watched-after-saving by{" "}
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
                        data={barDataSaved}
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
                        <RTooltip content={<BarTooltip />} />
                        <Bar
                          dataKey="added"
                          fill="#3b82f6"
                          name="Saved"
                          radius={[2, 2, 0, 0]}
                        />
                        <Bar
                          dataKey="watched"
                          fill="#10b981"
                          name="Watched After Saving"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div
                    className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      lineHeight: "1.6",
                    }}
                  >
                    {peakSavingPeriod && (
                      <p>
                        Your peak saving{" "}
                        {rangeMode === "monthly" ? "month" : "year"} was{" "}
                        <strong>{peakSavingPeriod.period}</strong> with{" "}
                        <strong>{peakSavingPeriod.added}</strong> videos saved.
                      </p>
                    )}
                    {bestCompletionPeriod && bestCompletionPeriod.added > 0 && (
                      <p>
                        Your best completion{" "}
                        {rangeMode === "monthly" ? "month" : "year"} was{" "}
                        <strong>{bestCompletionPeriod.period}</strong> with{" "}
                        <strong>
                          {(
                            (bestCompletionPeriod.watched /
                              bestCompletionPeriod.added) *
                            100
                          ).toFixed(1)}
                          %
                        </strong>{" "}
                        completion rate.
                      </p>
                    )}
                    <p>
                      Over the displayed period, you maintained an average
                      completion rate of{" "}
                      <strong>
                        {barDataSaved.length > 0
                          ? (
                              (barDataSaved.reduce(
                                (sum, d) => sum + d.watched,
                                0
                              ) /
                                barDataSaved.reduce(
                                  (sum, d) => sum + d.added,
                                  0
                                )) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </strong>{" "}
                      for saved videos.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}

        {tab === "rawdata" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 mt-8"
          >
            {rows.length ? (
              rows.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.01 }}
                  className="rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center p-4 rounded-xl shadow-lg border-2 bg-gradient-to-r from-gray-100/60 to-gray-200/60 border-gray-200/40 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/30 to-gray-200/30 backdrop-blur-sm"></div>
                      <div className="relative flex items-center space-x-3 pl-8 rounded-lg py-2 pr-4 bg-gradient-to-r from-gray-50/60 to-gray-100/60 backdrop-blur-sm">
                        <div className="p-2 rounded-lg border bg-gradient-to-r from-purple-100/60 to-blue-100/60 border-purple-200/40 backdrop-blur-sm">
                          <Hash className="w-6 h-6 text-purple-700" />
                        </div>
                        <h3 className="text-xl font-bold drop-shadow-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                          Video #{i + 1}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gradient-to-r from-purple-100/70 to-blue-100/70 backdrop-blur-sm rounded-lg border border-purple-200/40">
                            <Hash className="w-4 h-4 text-purple-700" />
                          </div>
                          <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                            Video URL
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50/60 to-blue-50/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-indigo-600 hover:text-indigo-800 break-all inline-flex items-center gap-1 text-sm"
                          >
                            {r.url.length > 40
                              ? `${r.url.substring(0, 40)}...`
                              : r.url}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      </div>

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
                            {r.added}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-1.5 backdrop-blur-sm rounded-lg border ${
                              r.isWatched
                                ? "bg-gradient-to-r from-blue-100/70 to-indigo-100/70 border-blue-200/40"
                                : "bg-gradient-to-r from-gray-100/70 to-slate-100/70 border-gray-200/40"
                            }`}
                          >
                            {r.isWatched ? (
                              <Eye className="w-4 h-4 text-blue-700" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <p
                            className={`text-xs font-bold uppercase tracking-wider ${
                              r.isWatched ? "text-blue-700" : "text-gray-500"
                            }`}
                          >
                            Watch Status
                          </p>
                        </div>
                        <div
                          className={`backdrop-blur-sm rounded-lg p-3 border ${
                            r.isWatched
                              ? "bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border-blue-200/30"
                              : "bg-gradient-to-r from-gray-50/60 to-slate-50/60 border-gray-200/30"
                          }`}
                        >
                          <p className="font-semibold text-gray-800 text-sm">
                            {r.watched === "–" ? "Not watched yet" : r.watched}
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
                <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No favourites found.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === "transparent" && (
          <div className="space-y-6 pb-20">
            <FavExplanatoryCard rows={rows} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mt-8"
            >
              {rows.length ? (
                rows.map((r, i) => {
                  const watched = r.isWatched;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.01 }}
                      className={`rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                        watched
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300"
                          : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:border-red-300"
                      }`}
                    >
                      <div className="p-6 space-y-4">
                        <div
                          className={`flex items-center p-4 rounded-xl shadow-lg border-2 relative overflow-hidden ${
                            watched
                              ? "border-green-200/50 bg-gradient-to-r from-green-50/80 via-emerald-50/60 to-teal-50/80"
                              : "border-red-200/50 bg-gradient-to-r from-red-50/80 via-pink-50/60 to-rose-50/80"
                          }`}
                        >
                          <div
                            className={`absolute inset-0 ${
                              watched
                                ? "bg-gradient-to-br from-green-100/30 via-emerald-100/20 to-teal-100/30"
                                : "bg-gradient-to-br from-red-100/30 via-pink-100/20 to-rose-100/30"
                            } backdrop-blur-sm`}
                          ></div>
                          <div
                            className={`relative flex items-center space-x-3 pl-8 rounded-lg py-2 pr-4 ${
                              watched
                                ? "bg-gradient-to-r from-green-50/60 via-emerald-50/40 to-teal-50/60"
                                : "bg-gradient-to-r from-red-50/60 via-pink-50/40 to-rose-50/60"
                            } backdrop-blur-sm`}
                          >
                            <div
                              className={`p-2 rounded-lg border shadow-sm ${
                                watched
                                  ? "bg-gradient-to-r from-green-100/60 to-emerald-100/60 border-green-200/40"
                                  : "bg-gradient-to-r from-red-100/60 to-pink-100/60 border-red-200/40"
                              } backdrop-blur-sm`}
                            >
                              {watched ? (
                                <CheckCircle className="w-6 h-6 text-green-700" />
                              ) : (
                                <Clock className="w-6 h-6 text-red-700" />
                              )}
                            </div>
                            <h3
                              className={`text-xl font-bold drop-shadow-lg ${
                                watched
                                  ? "bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent"
                                  : "bg-gradient-to-r from-red-800 to-pink-700 bg-clip-text text-transparent"
                              }`}
                            >
                              Video #{i + 1} - {watched ? "Watched" : "Pending"}
                            </h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-gradient-to-r from-purple-100/70 to-blue-100/70 backdrop-blur-sm rounded-lg border border-purple-200/40">
                                <Hash className="w-4 h-4 text-purple-700" />
                              </div>
                              <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                                Video URL
                              </p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50/60 to-blue-50/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-indigo-600 hover:text-indigo-800 break-all inline-flex items-center gap-1 text-sm"
                              >
                                {r.url.length > 40
                                  ? `${r.url.substring(0, 40)}...`
                                  : r.url}
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            </div>
                          </div>

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
                                {r.added}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`p-1.5 backdrop-blur-sm rounded-lg border ${
                                  watched
                                    ? "bg-gradient-to-r from-blue-100/70 to-indigo-100/70 border-blue-200/40"
                                    : "bg-gradient-to-r from-gray-100/70 to-slate-100/70 border-gray-200/40"
                                }`}
                              >
                                {watched ? (
                                  <Eye className="w-4 h-4 text-blue-700" />
                                ) : (
                                  <Clock className="w-4 h-4 text-gray-500" />
                                )}
                              </div>
                              <p
                                className={`text-xs font-bold uppercase tracking-wider ${
                                  watched ? "text-blue-700" : "text-gray-500"
                                }`}
                              >
                                Watch Status
                              </p>
                            </div>
                            <div
                              className={`backdrop-blur-sm rounded-lg p-3 border ${
                                watched
                                  ? "bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border-blue-200/30"
                                  : "bg-gradient-to-r from-gray-50/60 to-slate-50/60 border-gray-200/30"
                              }`}
                            >
                              <p className="font-semibold text-gray-800 text-sm">
                                {r.watched === "–"
                                  ? "Not watched yet"
                                  : r.watched}
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
                  <p className="text-gray-500">No favourites available.</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
