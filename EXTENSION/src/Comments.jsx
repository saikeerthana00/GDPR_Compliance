import React, { useMemo, useState, useEffect, Suspense, useRef } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  Info,
  MessageSquareText,
  Users,
  Calendar,
  Hash,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import SearchWordCloud from "./components/WordCloud";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const byDaysMax = (items) => {
  if (!items?.length) return 1;
  const now = Date.now() / 1000;
  const earliest = Math.min(...items.map((d) => d?.timestamp ?? now));
  return Math.max(1, Math.ceil((now - earliest) / 86400));
};

const filterByDaysSec = (items, days) => {
  const cutoff = Date.now() / 1000 - days * 86400;
  return (items || []).filter((d) => (d?.timestamp ?? 0) >= cutoff);
};

const perDaySeries = (arr) => {
  const m = new Map();
  arr.forEach((c) => {
    const t = c?.timestamp;
    if (!t) return;
    const d = new Date(t * 1000).toISOString().slice(0, 10);
    m.set(d, (m.get(d) || 0) + 1);
  });
  return Array.from(m.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const topAuthors = (arr, k = 10) => {
  const m = new Map();
  arr.forEach((c) => {
    const a = c?.author || "Unknown";
    m.set(a, (m.get(a) || 0) + 1);
  });
  return Array.from(m.entries())
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, k);
};

const tokenize = (text) => (text || "").match(/\b[\p{L}\p{N}'']+\b/gu) || [];
const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "is",
  "it",
  "you",
  "your",
  "i",
  "me",
  "my",
  "we",
  "our",
  "are",
  "am",
  "was",
  "were",
  "be",
  "been",
  "with",
  "by",
  "this",
  "that",
  "from",
  "as",
  "but",
  "if",
  "so",
  "not",
  "no",
  "yes",
  "do",
  "did",
  "does",
]);

function CommentsExplanatoryCard({ rows }) {
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
    author: "Example User",
    text: "This is an example comment text.",
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
                <MessageSquareText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Comments Understanding Guide
                </h3>
                <p className="text-sm text-gray-600">
                  Understanding your Instagram comments data
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
                        Comment #1
                      </p>
                      <div className="p-1 rounded-lg bg-blue-100 text-blue-700">
                        <MessageSquareText className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Author:
                          </p>
                          <p className="text-gray-900 text-sm break-all">
                            {first.author || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageSquareText className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Comment Text:
                          </p>
                          <p className="text-gray-900 text-sm">
                            {first.text
                              ? first.text.length > 50
                                ? first.text.slice(0, 50) + "..."
                                : first.text
                              : "Sample text"}
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
                        Comment Author
                      </p>
                      <p className="text-xs text-green-600">
                        The username who wrote the comment
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
                        Comment Text
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        The actual content of the comment
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
                        When the comment was posted (IST timezone)
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

const TransparentComments = ({ latest, filtered }) => {
  return (
    <div className="space-y-6 pb-20">
      <CommentsExplanatoryCard rows={filtered} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 mt-8"
      >
        {filtered.length ? (
          filtered.map((c, i) => {
            const t = c.timestamp
              ? new Date(c.timestamp * 1000).toLocaleString("en-US", {
                  timeZone: "Asia/Kolkata",
                })
              : "N/A";

            // Color coding based on comment characteristics
            const getCardStyle = (comment) => {
              const textLength = comment.text?.length || 0;
              if (textLength > 100) {
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
              } else if (textLength > 50) {
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

            const cardStyle = getCardStyle(c);

            return (
              <motion.div
                key={`${c.author || "u"}-${c.timestamp || i}-${i}`}
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
                        <MessageSquareText
                          className={`w-6 h-6 ${cardStyle.iconColor}`}
                        />
                      </div>
                      <h3
                        className={`text-xl font-bold drop-shadow-lg ${cardStyle.titleGradient}`}
                      >
                        Comment #{i + 1}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-r from-green-100/70 to-emerald-100/70 backdrop-blur-sm rounded-lg border border-green-200/40">
                          <Users className="w-4 h-4 text-green-700" />
                        </div>
                        <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
                          Author
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50/60 to-emerald-50/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/30">
                        <p className="font-semibold text-gray-800 text-sm break-words">
                          {c.author || "Unknown"}
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

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-r from-purple-100/70 to-pink-100/70 backdrop-blur-sm rounded-lg border border-purple-200/40">
                          <MessageSquareText className="w-4 h-4 text-purple-700" />
                        </div>
                        <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                          Comment Text
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50/60 to-pink-50/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                        <p className="font-semibold text-gray-800 text-sm break-words">
                          "{c.text || ""}"
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
            <MessageSquareText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No comments available.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default function Comments({ report, onBack }) {
  const all = report?.comments || [];
  const [activeTab, setActiveTab] = useState("concise");
  const [daysRange, setDaysRange] = useState(1);

  useEffect(() => setDaysRange(byDaysMax(all)), [all]);

  const filtered = useMemo(
    () => filterByDaysSec(all, daysRange),
    [all, daysRange]
  );
  const series = useMemo(() => perDaySeries(filtered), [filtered]);
  const authors = useMemo(() => topAuthors(filtered, 12), [filtered]);

  const words = useMemo(() => {
    const out = [];
    filtered.forEach((c) => {
      tokenize(c?.text || "")
        .map((w) => w.toLowerCase())
        .forEach((w) => {
          if (!STOP.has(w) && !/^\d+$/.test(w)) out.push(w);
        });
    });
    return out;
  }, [filtered]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const topAuthor = authors[0]?.author || "N/A";
    const peakDay =
      series.slice().sort((a, b) => b.value - a.value)[0]?.date || "N/A";
    const avgLen = total
      ? Math.round(
          filtered.reduce((s, c) => s + (c?.text?.length || 0), 0) / total
        )
      : 0;
    return { total, topAuthor, peakDay, avgLen };
  }, [filtered, authors, series]);

  // Enhanced analytics for chart summaries
  const chartStats = useMemo(() => {
    // Time series analysis
    const timeSeriesStats = {
      totalDays: series.length,
      peakValue: Math.max(...series.map((d) => d.value), 0),
      avgPerDay: series.length
        ? Math.round(
            (series.reduce((sum, d) => sum + d.value, 0) / series.length) * 10
          ) / 10
        : 0,
      activeDays: series.filter((d) => d.value > 0).length,
    };

    // Word cloud analysis
    const wordFreq = {};
    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const uniqueWords = Object.keys(wordFreq).length;

    // Authors analysis
    const authorsStats = {
      totalAuthors: authors.length,
      topAuthorCount: authors[0]?.count || 0,
      topAuthorPercent:
        stats.total > 0
          ? Math.round(((authors[0]?.count || 0) / stats.total) * 100)
          : 0,
      secondAuthor: authors[1]?.author || null,
      secondAuthorCount: authors[1]?.count || 0,
    };

    return {
      timeSeriesStats,
      wordStats: { topWords, uniqueWords, totalWords: words.length },
      authorsStats,
    };
  }, [series, words, authors, stats.total]);

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
          <h2 className="text-4xl font-bold text-gray-800 mb-3">Comments</h2>
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
                      <p className="text-sm text-blue-100">Total Comments</p>
                      <p className="text-3xl font-bold mt-2">{stats.total}</p>
                    </div>
                    <div className="bg-blue-400/30 p-2 rounded-lg">
                      <MessageSquareText className="w-8 h-8" />
                    </div>
                  </div>
                  <p className="mt-4 text-blue-100">In the selected range</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-green-100">Top Author</p>
                      <p className="text-xl font-bold mt-2 break-words">
                        {stats.topAuthor}
                      </p>
                    </div>
                    <div className="bg-green-400/30 p-2 rounded-lg">
                      <Users className="w-8 h-8" />
                    </div>
                  </div>
                  <p className="mt-4 text-green-100">Most comments</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-purple-100">Peak Day</p>
                      <p className="text-2xl font-bold mt-2">{stats.peakDay}</p>
                    </div>
                    <div className="bg-purple-400/30 p-2 rounded-lg">
                      <Calendar className="w-8 h-8" />
                    </div>
                  </div>
                  <p className="mt-4 text-purple-100">Most active date</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-orange-100">Avg Length</p>
                      <p className="text-3xl font-bold mt-2">{stats.avgLen}</p>
                    </div>
                    <div className="bg-orange-400/30 p-2 rounded-lg">
                      <Hash className="w-8 h-8" />
                    </div>
                  </div>
                  <p className="mt-4 text-orange-100">Chars per comment</p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Comments Over Time
                    </h4>
                    <div className="relative ml-2 group">
                      <Info
                        size={18}
                        className="text-gray-500 cursor-pointer"
                      />
                      <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition">
                        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm">
                          Daily count of comments.
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
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={series}
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
                        name="Comments"
                        stroke="#3b82f6"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    Over the last <strong>{daysRange}</strong> day
                    {daysRange > 1 && "s"}, you were active for{" "}
                    <strong>{chartStats.timeSeriesStats.activeDays}</strong> out
                    of <strong>{chartStats.timeSeriesStats.totalDays}</strong>{" "}
                    days.
                  </p>
                  <p>
                    You averaged{" "}
                    <strong>{chartStats.timeSeriesStats.avgPerDay}</strong>{" "}
                    comments per day, with your peak day reaching{" "}
                    <strong>{chartStats.timeSeriesStats.peakValue}</strong>{" "}
                    comments.
                  </p>
                  {stats.peakDay !== "N/A" && (
                    <p>
                      Your most active commenting day was{" "}
                      <strong>{stats.peakDay}</strong>.
                    </p>
                  )}
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex items-center mb-6">
                  <h4 className="text-2xl font-bold text-gray-800">
                    Word Cloud
                  </h4>
                  <div className="relative ml-2 group">
                    <Info size={18} className="text-gray-500 cursor-pointer" />
                    <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition">
                      <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm">
                        Most frequent words in comments.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="min-h-[320px] flex items-center justify-center">
                  {words.length ? (
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      }
                    >
                      <SearchWordCloud terms={words} />
                    </Suspense>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No words available.</p>
                    </div>
                  )}
                </div>
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    Your comments contained{" "}
                    <strong>{chartStats.wordStats.uniqueWords}</strong> unique
                    words across{" "}
                    <strong>{chartStats.wordStats.totalWords}</strong> total
                    words (after filtering common words).
                  </p>
                  {chartStats.wordStats.topWords.length > 0 && (
                    <p>
                      Your most used word was "
                      <strong>{chartStats.wordStats.topWords[0][0]}</strong>" (
                      {chartStats.wordStats.topWords[0][1]} times)
                      {chartStats.wordStats.topWords[1] && (
                        <>
                          , followed by "
                          <strong>{chartStats.wordStats.topWords[1][0]}</strong>
                          " ({chartStats.wordStats.topWords[1][1]} times)
                        </>
                      )}
                      .
                    </p>
                  )}
                  <p>
                    Average comment length was <strong>{stats.avgLen}</strong>{" "}
                    characters.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex items-center mb-4">
                  <h4 className="text-2xl font-bold text-gray-800">
                    Top Authors
                  </h4>
                </div>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={authors}
                      margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="author"
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Comments" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    You interacted with{" "}
                    <strong>{chartStats.authorsStats.totalAuthors}</strong>{" "}
                    different authors in the selected time period.
                  </p>
                  {stats.topAuthor !== "N/A" && (
                    <p>
                      You commented most frequently on posts by{" "}
                      <strong>{stats.topAuthor}</strong>(
                      {chartStats.authorsStats.topAuthorCount} comments -{" "}
                      {chartStats.authorsStats.topAuthorPercent}% of your total
                      comments)
                      {chartStats.authorsStats.secondAuthor && (
                        <>
                          , followed by{" "}
                          <strong>
                            {chartStats.authorsStats.secondAuthor}
                          </strong>
                          ({chartStats.authorsStats.secondAuthorCount} comments)
                        </>
                      )}
                      .
                    </p>
                  )}
                  <p>
                    This shows your engagement patterns across different content
                    creators.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.footer
              variants={itemVariants}
              className="mt-16 text-center text-gray-500 text-sm"
            >
              <p>Comments analyzed from your Instagram history file.</p>
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
              filtered.map((c, i) => {
                const t = c.timestamp
                  ? new Date(c.timestamp * 1000).toLocaleString("en-US", {
                      timeZone: "Asia/Kolkata",
                    })
                  : "N/A";

                return (
                  <motion.div
                    key={`${c.author || "u"}-${c.timestamp || i}-${i}`}
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
                            <MessageSquareText className="w-6 h-6 text-blue-700" />
                          </div>
                          <h3 className="text-xl font-bold drop-shadow-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Comment #{i + 1}
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-gradient-to-r from-green-100/70 to-emerald-100/70 backdrop-blur-sm rounded-lg border border-green-200/40">
                              <Users className="w-4 h-4 text-green-700" />
                            </div>
                            <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
                              Author
                            </p>
                          </div>
                          <div className="bg-gradient-to-r from-green-50/60 to-emerald-50/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/30">
                            <p className="font-semibold text-gray-800 text-sm break-words">
                              {c.author || "Unknown"}
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

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-gradient-to-r from-purple-100/70 to-pink-100/70 backdrop-blur-sm rounded-lg border border-purple-200/40">
                              <MessageSquareText className="w-4 h-4 text-purple-700" />
                            </div>
                            <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                              Comment Text
                            </p>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50/60 to-pink-50/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                            <p className="font-semibold text-gray-800 text-sm break-words">
                              "{c.text || ""}"
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
                <MessageSquareText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No comments in this range.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "transparent" && (
          <TransparentComments latest={latest} filtered={filtered} />
        )}

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center text-gray-500 text-sm"
        >
          <p>Data analyzed from your comments.</p>
        </motion.footer>
      </div>
    </main>
  );
}
