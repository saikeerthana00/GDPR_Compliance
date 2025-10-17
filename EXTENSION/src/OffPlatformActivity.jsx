import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  Info,
  Activity,
  Calendar,
  Clock,
  ListChecks,
  Hash,
  ExternalLink,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const COLORS = Array.from(
  { length: 28 },
  (_, i) => `hsl(${(i * 17) % 360} 78% 56%)`
);

const byDaysMax = (items, tsKey = "timestamp") => {
  if (!items?.length) return 1;
  const now = Date.now() / 1000;
  const earliest = Math.min(...items.map((d) => d?.[tsKey] ?? now));
  return Math.max(1, Math.ceil((now - earliest) / 86400));
};

const filterByDaysSec = (items, days, tsKey = "timestamp") => {
  const cutoff = Date.now() / 1000 - days * 86400;
  return (items || []).filter((d) => (d?.[tsKey] ?? 0) >= cutoff);
};

const groupCount = (arr, keyFn) => {
  const m = new Map();
  arr.forEach((x) => {
    const k = keyFn(x);
    if (!k) return;
    m.set(k, (m.get(k) || 0) + 1);
  });
  return Array.from(m.entries())
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);
};

const groupPerDay = (arr, tsKey = "timestamp") => {
  const m = new Map();
  arr.forEach((x) => {
    const t = x?.[tsKey];
    if (!t) return;
    const d = new Date(t * 1000);
    const iso = d.toISOString().slice(0, 10);
    m.set(iso, (m.get(iso) || 0) + 1);
  });
  return Array.from(m.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

function OffPlatformExplanatoryCard({ rows }) {
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
    name: "Example App",
    type: "app_visit",
    timestamp: Date.now() / 1000,
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
        } bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm transition-all duration-300 ease-out ${
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
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
        </div>

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Off-Platform Activity Guide
                </h3>
                <p className="text-sm text-gray-600">
                  Understanding your off-Meta activity data
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
                        Activity #1
                      </p>
                      <div className="p-1 rounded-lg bg-blue-100 text-blue-700">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Source:
                          </p>
                          <p className="text-gray-900 text-sm break-all">
                            {first.name || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Hash className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Event Type:
                          </p>
                          <p className="text-gray-900 text-sm">
                            {first.type || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Timestamp:
                          </p>
                          <p className="text-gray-900 text-sm">
                            {first.timestamp
                              ? new Date(first.timestamp * 1000).toLocaleString(
                                  "en-US",
                                  {
                                    timeZone: "Asia/Kolkata",
                                  }
                                )
                              : "N/A"}
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
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 flex-1">
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Source Name
                      </p>
                      <p className="text-xs text-green-600">
                        The app, website, or platform where activity occurred
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
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 flex-1">
                      <p className="text-sm font-medium text-purple-800">
                        Event Type
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        The specific type of activity or interaction
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
                        Timestamp
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        When the activity occurred (IST timezone)
                      </p>
                    </div>
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

const TransparentOffPlatform = ({ latest, filtered }) => {
  return (
    <div className="space-y-6 pb-20">
      <OffPlatformExplanatoryCard rows={filtered} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 mt-8"
      >
        {filtered.length ? (
          filtered.map((e, i) => {
            const t = e.timestamp
              ? new Date(e.timestamp * 1000).toLocaleString("en-US", {
                  timeZone: "Asia/Kolkata",
                })
              : "N/A";

            // Color coding based on event type or source
            const getCardStyle = (eventType) => {
              if (
                eventType?.toLowerCase().includes("visit") ||
                eventType?.toLowerCase().includes("view")
              ) {
                return {
                  bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
                  border: "border-blue-200 hover:border-blue-300",
                  headerBg:
                    "border-blue-200/50 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-blue-50/80",
                  innerBg:
                    "bg-gradient-to-br from-blue-100/30 via-indigo-100/20 to-blue-100/30",
                  iconBg:
                    "bg-gradient-to-r from-blue-100/60 to-indigo-100/60 border-blue-200/40",
                  iconColor: "text-blue-700",
                  titleGradient:
                    "bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent",
                };
              } else if (
                eventType?.toLowerCase().includes("search") ||
                eventType?.toLowerCase().includes("query")
              ) {
                return {
                  bg: "bg-gradient-to-r from-purple-50 to-pink-50",
                  border: "border-purple-200 hover:border-purple-300",
                  headerBg:
                    "border-purple-200/50 bg-gradient-to-r from-purple-50/80 via-pink-50/60 to-purple-50/80",
                  innerBg:
                    "bg-gradient-to-br from-purple-100/30 via-pink-100/20 to-purple-100/30",
                  iconBg:
                    "bg-gradient-to-r from-purple-100/60 to-pink-100/60 border-purple-200/40",
                  iconColor: "text-purple-700",
                  titleGradient:
                    "bg-gradient-to-r from-purple-800 to-pink-700 bg-clip-text text-transparent",
                };
              } else {
                return {
                  bg: "bg-gradient-to-r from-green-50 to-emerald-50",
                  border: "border-green-200 hover:border-green-300",
                  headerBg:
                    "border-green-200/50 bg-gradient-to-r from-green-50/80 via-emerald-50/60 to-green-50/80",
                  innerBg:
                    "bg-gradient-to-br from-green-100/30 via-emerald-100/20 to-green-100/30",
                  iconBg:
                    "bg-gradient-to-r from-green-100/60 to-emerald-100/60 border-green-200/40",
                  iconColor: "text-green-700",
                  titleGradient:
                    "bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent",
                };
              }
            };

            const cardStyle = getCardStyle(e.type);

            return (
              <motion.div
                key={`${e.id || i}-${e.timestamp || i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.01 }}
                className={`rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${cardStyle.bg} ${cardStyle.border}`}
              >
                <div className="p-6 space-y-4">
                  <div
                    className={`flex items-center p-4 rounded-xl shadow-lg border-2 relative overflow-hidden ${cardStyle.headerBg}`}
                  >
                    <div
                      className={`absolute inset-0 ${cardStyle.innerBg} backdrop-blur-sm`}
                    ></div>
                    <div
                      className={`relative flex items-center space-x-3 pl-8 rounded-lg py-2 pr-4 ${cardStyle.bg} backdrop-blur-sm`}
                    >
                      <div
                        className={`p-2 rounded-lg border ${cardStyle.iconBg} backdrop-blur-sm`}
                      >
                        <Hash className={`w-6 h-6 ${cardStyle.iconColor}`} />
                      </div>
                      <h3
                        className={`text-xl font-bold drop-shadow-lg ${cardStyle.titleGradient}`}
                      >
                        Activity #{i + 1}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-r from-green-100/70 to-emerald-100/70 backdrop-blur-sm rounded-lg border border-green-200/40">
                          <Globe className="w-4 h-4 text-green-700" />
                        </div>
                        <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
                          Source
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50/60 to-emerald-50/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/30">
                        <p className="font-semibold text-gray-800 text-sm break-words">
                          {e.name || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-r from-purple-100/70 to-pink-100/70 backdrop-blur-sm rounded-lg border border-purple-200/40">
                          <Hash className="w-4 h-4 text-purple-700" />
                        </div>
                        <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                          Event Type
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50/60 to-pink-50/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                        <p className="font-semibold text-gray-800 text-sm break-words">
                          {e.type || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-r from-blue-100/70 to-indigo-100/70 backdrop-blur-sm rounded-lg border border-blue-200/40">
                          <Clock className="w-4 h-4 text-blue-700" />
                        </div>
                        <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">
                          Timestamp
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30">
                        <p className="font-semibold text-gray-800 text-sm">
                          {t}
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
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No off-platform activity available.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default function OffPlatformActivity({ report, onBack }) {
  const all = report?.off_platform_activity || [];
  const [activeTab, setActiveTab] = useState("concise");
  const [daysRange, setDaysRange] = useState(1);

  useEffect(() => setDaysRange(byDaysMax(all)), [all]);

  const filtered = useMemo(
    () => filterByDaysSec(all, daysRange),
    [all, daysRange]
  );
  const sources = useMemo(
    () => groupCount(filtered, (x) => x?.name || null).slice(0, 20),
    [filtered]
  );
  const types = useMemo(
    () => groupCount(filtered, (x) => x?.type || null).slice(0, 20),
    [filtered]
  );
  const perDay = useMemo(() => groupPerDay(filtered), [filtered]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const topSource = sources[0]?.key || "N/A";
    const topType = types[0]?.key || "N/A";
    const peakDay =
      perDay.slice().sort((a, b) => b.value - a.value)[0]?.date || "N/A";
    return { total, topSource, topType, peakDay };
  }, [filtered, sources, types, perDay]);

  const sourcesStats = useMemo(() => {
    if (!sources.length) {
      return {
        totalSources: 0,
        topSource: null,
        topSourceEvents: 0,
        topSourcePercentage: 0,
      };
    }
    const totalEvents = sources.reduce((sum, source) => sum + source.value, 0);
    const topSource = sources[0];
    return {
      totalSources: sources.length,
      topSource: topSource?.key || null,
      topSourceEvents: topSource?.value || 0,
      topSourcePercentage: totalEvents
        ? Math.round(((topSource?.value || 0) / totalEvents) * 100)
        : 0,
    };
  }, [sources]);

  const typesStats = useMemo(() => {
    if (!types.length) {
      return {
        totalTypes: 0,
        topType: null,
        topTypeEvents: 0,
        topTypePercentage: 0,
      };
    }
    const totalEvents = types.reduce((sum, type) => sum + type.value, 0);
    const topType = types[0];
    return {
      totalTypes: types.length,
      topType: topType?.key || null,
      topTypeEvents: topType?.value || 0,
      topTypePercentage: totalEvents
        ? Math.round(((topType?.value || 0) / totalEvents) * 100)
        : 0,
    };
  }, [types]);

  const timelineStats = useMemo(() => {
    if (!perDay.length) {
      return {
        totalDays: 0,
        averagePerDay: 0,
        peakDay: null,
        peakDayEvents: 0,
        quietestDay: null,
        quietestDayEvents: 0,
      };
    }

    const sortedByValue = perDay.slice().sort((a, b) => b.value - a.value);
    const peakDay = sortedByValue[0];
    const quietestDay = sortedByValue[sortedByValue.length - 1];
    const totalEvents = perDay.reduce((sum, day) => sum + day.value, 0);

    return {
      totalDays: perDay.length,
      averagePerDay: Math.round(totalEvents / perDay.length),
      peakDay: peakDay?.date || null,
      peakDayEvents: peakDay?.value || 0,
      quietestDay: quietestDay?.date || null,
      quietestDayEvents: quietestDay?.value || 0,
    };
  }, [perDay]);

  const latest =
    filtered
      .slice()
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0] || null;

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Off Platform Activity
          </h2>
          <button
            onClick={onBack}
            className="text-blue-600 hover:underline text-sm"
          >
            &larr; Back to Overview
          </button>
        </motion.header>

        <div className="mb-8">
          <nav className="flex justify-center space-x-1 p-1 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
            {[
              { id: "concise", label: "Concise" },
              { id: "rawdata", label: "Raw Data" },
              { id: "transparent", label: "Transparent" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex-1 ${
                  activeTab === t.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-transparent text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "concise" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            <motion.section variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-blue-100">Total Events</p>
                      <p className="text-3xl font-bold mt-2">{stats.total}</p>
                    </div>
                    <div className="bg-blue-400/30 p-2 rounded-lg">
                      <Activity className="w-8 h-8" />
                    </div>
                  </div>
                  <p className="mt-4 text-blue-100">
                    Off-Meta events in the selected range
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-green-100">Top Source</p>
                      <p className="text-xl font-bold mt-2 break-words">
                        {stats.topSource}
                      </p>
                    </div>
                    <div className="bg-green-400/30 p-2 rounded-lg">
                      <ListChecks className="w-8 h-8" />
                    </div>
                  </div>
                  <p className="mt-4 text-green-100">Most frequent app/site</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-purple-100">Top Event Type</p>
                      <p className="text-xl font-bold mt-2 break-words">
                        {stats.topType}
                      </p>
                    </div>
                    <div className="bg-purple-400/30 p-2 rounded-lg">
                      <Clock className="w-8 h-8" />
                    </div>
                  </div>
                  <p className="mt-4 text-purple-100">Most common event</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-orange-100">Peak Day</p>
                      <p className="text-2xl font-bold mt-2">{stats.peakDay}</p>
                    </div>
                    <div className="bg-orange-400/30 p-2 rounded-lg">
                      <Calendar className="w-8 h-8" />
                    </div>
                  </div>
                  <p className="mt-4 text-orange-100">Most active date</p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Top Sources
                    </h4>
                    <div className="relative ml-2 group">
                      <Info
                        size={18}
                        className="text-gray-500 cursor-pointer"
                      />
                      <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition">
                        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm">
                          Events grouped by source name.
                        </div>
                      </div>
                    </div>
                  </div>
                  <label className="text-sm text-gray-700">
                    Last {daysRange} day{daysRange > 1 && "s"}
                    <input
                      type="range"
                      min="1"
                      max={byDaysMax(all)}
                      step="1"
                      value={daysRange}
                      onChange={(e) => setDaysRange(parseInt(e.target.value))}
                      className="w-40 ml-2"
                    />
                  </label>
                </div>
                <div className="w-full h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sources}
                      margin={{ top: 20, right: 30, bottom: 60, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="key"
                        angle={-20}
                        textAnchor="end"
                        interval={0}
                        height={60}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Events" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Sources Summary Section */}
                {sources.length > 0 && (
                  <div
                    className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      lineHeight: "1.6",
                    }}
                  >
                    <p>
                      Over the last {daysRange} day{daysRange > 1 && "s"}, your
                      off-platform activity came from{" "}
                      <strong>{sourcesStats.totalSources}</strong> different
                      source{sourcesStats.totalSources !== 1 && "s"}.
                    </p>
                    {sourcesStats.topSource && (
                      <p>
                        Your most active source was{" "}
                        <strong>{sourcesStats.topSource}</strong> with{" "}
                        <strong>{sourcesStats.topSourceEvents}</strong> events,
                        accounting for{" "}
                        <strong>{sourcesStats.topSourcePercentage}%</strong> of
                        your total off-platform activity.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Event Types
                    </h4>
                    <div className="relative ml-2 group">
                      <Info
                        size={18}
                        className="text-gray-500 cursor-pointer"
                      />
                      <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition">
                        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm">
                          Events grouped by type.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={types}
                      margin={{ top: 20, right: 30, bottom: 40, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="key" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Entries" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Event Types Summary Section */}
                {types.length > 0 && (
                  <div
                    className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      lineHeight: "1.6",
                    }}
                  >
                    <p>
                      Your off-platform activity consisted of{" "}
                      <strong>{typesStats.totalTypes}</strong> different event
                      type{typesStats.totalTypes !== 1 && "s"} over the selected
                      period.
                    </p>
                    {typesStats.topType && (
                      <p>
                        The most common event type was{" "}
                        <strong>{typesStats.topType}</strong> with{" "}
                        <strong>{typesStats.topTypeEvents}</strong> occurrences,
                        representing{" "}
                        <strong>{typesStats.topTypePercentage}%</strong> of all
                        your off-platform events.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex items-center mb-4">
                  <h4 className="text-2xl font-bold text-gray-800">
                    Activity Over Time
                  </h4>
                  <div className="relative ml-2 group">
                    <Info size={18} className="text-gray-500 cursor-pointer" />
                    <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition">
                      <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm">
                        Daily breakdown of off-platform activity events.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={perDay}
                      margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Events"
                        stroke="#6366f1"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Timeline Summary Section */}
                {perDay.length > 0 && (
                  <div
                    className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      lineHeight: "1.6",
                    }}
                  >
                    <p>
                      Your off-platform activity spanned{" "}
                      <strong>{timelineStats.totalDays}</strong> day
                      {timelineStats.totalDays !== 1 && "s"}, with an average of{" "}
                      <strong>{timelineStats.averagePerDay}</strong> events per
                      day.
                    </p>
                    {timelineStats.peakDay && (
                      <p>
                        Your most active day was{" "}
                        <strong>{timelineStats.peakDay}</strong> with{" "}
                        <strong>{timelineStats.peakDayEvents}</strong> events.
                      </p>
                    )}
                    {timelineStats.quietestDay &&
                      timelineStats.quietestDayEvents !==
                        timelineStats.peakDayEvents && (
                        <p>
                          Your quietest day was{" "}
                          <strong>{timelineStats.quietestDay}</strong> with{" "}
                          <strong>{timelineStats.quietestDayEvents}</strong>{" "}
                          event{timelineStats.quietestDayEvents !== 1 && "s"}.
                        </p>
                      )}
                  </div>
                )}
              </div>
            </motion.section>

            <motion.footer
              variants={itemVariants}
              className="mt-16 text-center text-gray-500 text-sm"
            >
              <p>Off-platform activity derived from your uploaded file.</p>
            </motion.footer>
          </motion.div>
        )}

        {activeTab === "rawdata" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 mt-8"
          >
            {filtered.length ? (
              filtered.map((e, i) => {
                const t = e.timestamp
                  ? new Date(e.timestamp * 1000).toLocaleString("en-US", {
                      timeZone: "Asia/Kolkata",
                    })
                  : "N/A";
                return (
                  <motion.div
                    key={`${e.id || i}-${e.timestamp || i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.01 }}
                    className="rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-center p-4 rounded-xl shadow-lg border-2 bg-gradient-to-r from-gray-100/60 to-gray-200/60 border-gray-200/40 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/30 to-gray-200/30 backdrop-blur-sm"></div>
                        <div className="relative flex items-center space-x-3 pl-8 rounded-lg py-2 pr-4 bg-gradient-to-r from-gray-50/60 to-gray-100/60 backdrop-blur-sm">
                          <div className="p-2 rounded-lg border bg-gradient-to-r from-blue-100/60 to-indigo-100/60 border-blue-200/40 backdrop-blur-sm">
                            <Hash className="w-6 h-6 text-blue-700" />
                          </div>
                          <h3 className="text-xl font-bold drop-shadow-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Activity #{i + 1}
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-gradient-to-r from-green-100/70 to-emerald-100/70 backdrop-blur-sm rounded-lg border border-green-200/40">
                              <Globe className="w-4 h-4 text-green-700" />
                            </div>
                            <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
                              Source
                            </p>
                          </div>
                          <div className="bg-gradient-to-r from-green-50/60 to-emerald-50/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/30">
                            <p className="font-semibold text-gray-800 text-sm break-words">
                              {e.name || "Unknown"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-gradient-to-r from-purple-100/70 to-pink-100/70 backdrop-blur-sm rounded-lg border border-purple-200/40">
                              <Hash className="w-4 h-4 text-purple-700" />
                            </div>
                            <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                              Event Type
                            </p>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50/60 to-pink-50/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                            <p className="font-semibold text-gray-800 text-sm break-words">
                              {e.type || "Unknown"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-gradient-to-r from-blue-100/70 to-indigo-100/70 backdrop-blur-sm rounded-lg border border-blue-200/40">
                              <Clock className="w-4 h-4 text-blue-700" />
                            </div>
                            <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">
                              Timestamp
                            </p>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30">
                            <p className="font-semibold text-gray-800 text-sm">
                              {t}
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
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No off-platform activity in this range.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "transparent" && (
          <TransparentOffPlatform latest={latest} filtered={filtered} />
        )}

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center text-gray-500 text-sm"
        >
          <p>Data analyzed from your off-Meta activity log.</p>
        </motion.footer>
      </div>
    </main>
  );
}
