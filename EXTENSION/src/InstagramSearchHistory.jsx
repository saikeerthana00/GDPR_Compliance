import React, { useState, useEffect, useMemo, Suspense } from "react";
import {
  Info,
  Search,
  Clock,
  Hash,
  BarChart3,
  Calendar,
  TrendingUp,
} from "lucide-react";
import SearchWordCloud from "./components/WordCloud";
import TransparentSearchTab from "./TransparentTabSearch";

// Add motion for animations (assuming framer-motion is available like in location history)
const motion = {
  div: ({ children, ...props }) => <div {...props}>{children}</div>,
  header: ({ children, ...props }) => <header {...props}>{children}</header>,
  footer: ({ children, ...props }) => <footer {...props}>{children}</footer>,
};

// constants for days/hours
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const RENDER_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);

// how many days back your data spans (expects `.time` in ms)
const getMaxSpanDays = (data) => {
  if (!data?.length) return 1;
  const earliest = Math.min(...data.map((d) => d.time));
  return Math.max(1, Math.ceil((Date.now() - earliest) / 86400000));
};

// pick only entries in the last N days
const filterByDays = (data, days) => {
  const cutoff = Date.now() - days * 86400000;
  return data.filter((d) => d.time >= cutoff);
};

// build a full grid of { day, hour, count } for the heatmap
const generateHeatmapGrid = (days, raw) => {
  const cutoff = Date.now() - days * 86400000;
  const counts = raw
    .filter((d) => d.time >= cutoff)
    .reduce((acc, { time }) => {
      const date = new Date(time);
      const key = `${DAYS[date.getDay()]}_${date
        .getHours()
        .toString()
        .padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  return RENDER_DAYS.flatMap((day) =>
    HOURS.map((hour) => ({
      day,
      hour,
      count: counts[`${day}_${hour}`] || 0,
    }))
  );
};

// simple SVG heatmap
const HeatmapSVG = ({ data }) => {
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const cellMap = {};
  data.forEach((c) => (cellMap[`${c.day}_${c.hour}`] = c.count));
  const max = Math.max(...data.map((c) => c.count), 0);
  const cellW = 40,
    cellH = 40,
    mL = 80,
    mT = 40;
  const getColor = (count) => {
    if (!max) return "#f8fafc";
    const r = count / max;
    if (r < 0.2) return "#e0f2fe";
    if (r < 0.4) return "#bae6fd";
    if (r < 0.6) return "#7dd3fc";
    if (r < 0.8) return "#38bdf8";
    if (r < 0.9) return "#0ea5e9";
    return "#0284c7";
  };
  const show = (day, hour, count, ri, ci) =>
    setTip({
      visible: true,
      x: mL + ci * cellW,
      y: mT + ri * cellH,
      content: `${count} searches at ${hour}:00 on ${day}`,
    });
  const hide = () => setTip((t) => ({ ...t, visible: false }));

  return (
    <div style={{ position: "relative" }}>
      <svg
        width={mL + HOURS.length * cellW}
        height={mT + RENDER_DAYS.length * cellH + 40}
        className="rounded-lg"
      >
        {HOURS.map((h, i) => (
          <text
            key={h}
            x={mL + i * cellW + cellW / 2}
            y={mT - 10}
            textAnchor="middle"
            fontSize="12"
            fill="#64748b"
            fontWeight="600"
          >
            {h}
          </text>
        ))}
        {RENDER_DAYS.map((d, i) => (
          <text
            key={d}
            x={mL - 10}
            y={mT + i * cellH + cellH / 2 + 4}
            textAnchor="end"
            fontSize="12"
            fill="#64748b"
            fontWeight="600"
          >
            {d}
          </text>
        ))}
        {RENDER_DAYS.map((day, ri) =>
          HOURS.map((hour, ci) => {
            const count = cellMap[`${day}_${hour}`] || 0;
            return (
              <g key={`${day}_${hour}`}>
                <rect
                  x={mL + ci * cellW}
                  y={mT + ri * cellH}
                  width={cellW}
                  height={cellH}
                  fill={getColor(count)}
                  stroke="#fff"
                  strokeWidth="2"
                  rx="4"
                  className="cursor-pointer transition-all duration-200 hover:stroke-gray-300"
                  onMouseEnter={() => show(day, hour, count, ri, ci)}
                  onMouseLeave={hide}
                />
                {count > 0 && (
                  <text
                    x={mL + ci * cellW + cellW / 2}
                    y={mT + ri * cellH + cellH / 2 + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#1e293b"
                    fontWeight="600"
                  >
                    {count}
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>
      {tip.visible && (
        <div
          style={{
            position: "absolute",
            left: tip.x + cellW + 5,
            top: tip.y - cellH / 2,
            backgroundColor: "rgba(0,0,0,0.85)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "500",
            pointerEvents: "none",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {tip.content}
        </div>
      )}
    </div>
  );
};

export default function InstagramSearchHistory({ report, onBack }) {
  // raw from report
  const allSearchData = report.search_history || [];

  // convert seconds → milliseconds for filtering & stats
  const processedData = useMemo(
    () =>
      allSearchData
        .map(({ timestamp, query }) =>
          timestamp != null ? { time: timestamp * 1000, query } : null
        )
        .filter(Boolean),
    [allSearchData]
  );

  const [activeTab, setActiveTab] = useState("concise");
  const [searchDays, setSearchDays] = useState(1);
  const [imSearchDays, setImSearchDays] = useState(1);

  // initialize slider to full span
  useEffect(() => {
    const maxS = getMaxSpanDays(processedData);
    setSearchDays(maxS);
    setImSearchDays(maxS);
  }, [processedData]);

  // whenever slider changes, update heatmap range
  useEffect(() => {
    setImSearchDays(searchDays);
  }, [searchDays]);

  // regenerate heatmap
  const heatmapData = useMemo(
    () => generateHeatmapGrid(searchDays, processedData),
    [searchDays, processedData]
  );

  // summary stats
  const activityStats = useMemo(() => {
    if (!processedData.length)
      return { total: 0, avgWords: 0, peakHour: "00", mostDay: DAYS[0] };

    const total = processedData.length;
    const wordsCount = processedData.reduce(
      (acc, { query }) => acc + (query.match(/\b\w+\b/g) || []).length,
      0
    );
    const avgWords = Math.round((wordsCount / total) * 10) / 10;

    const hourCounts = {};
    processedData.forEach(({ time }) => {
      const h = new Date(time).getHours().toString().padStart(2, "0");
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const peakHour =
      Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "00";

    const dayCounts = {};
    processedData.forEach(({ time }) => {
      const d = DAYS[new Date(time).getDay()];
      dayCounts[d] = (dayCounts[d] || 0) + 1;
    });
    const mostDay =
      Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || DAYS[0];

    return { total, avgWords, peakHour, mostDay };
  }, [processedData]);

  // word clouds data
  const fullQueries = useMemo(
    () => processedData.map((i) => i.query),
    [processedData]
  );
  const words = useMemo(() => {
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
    ]);
    const W = [];
    processedData.forEach(({ query }) => {
      (query.match(/\b\w+\b/g) || [])
        .map((w) => w.toLowerCase())
        .forEach((w) => {
          if (!STOP.has(w) && !/^\d+$/.test(w)) W.push(w);
        });
    });
    return W;
  }, [processedData]);

  // raw list with localized timestamps
  const rawList = useMemo(
    () =>
      processedData.map(({ time, query }, i) => ({
        id: i,
        query,
        timeString: new Date(time).toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
      })),
    [processedData]
  );

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
            Instagram Search History
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
              { id: "concise", label: "Overview" },
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

        {activeTab === "concise" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white bg-opacity-20">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Total Searches</p>
                    <p className="text-3xl font-bold">{activityStats.total}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white bg-opacity-20">
                    <Hash className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-green-100">Avg Words</p>
                    <p className="text-3xl font-bold">
                      {activityStats.avgWords}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white bg-opacity-20">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-100">Peak Hour</p>
                    <p className="text-3xl font-bold">
                      {activityStats.peakHour}:00
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white bg-opacity-20">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-100">Most Active Day</p>
                    <p className="text-2xl font-bold">
                      {activityStats.mostDay}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div> */}
            {/* Heatmap */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">
                      Search Activity Heatmap
                    </h4>
                    <p className="text-sm text-gray-500">
                      Visual representation of your search patterns
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Last</span>
                    <input
                      type="range"
                      min="1"
                      max={getMaxSpanDays(processedData)}
                      value={searchDays}
                      onChange={(e) => setSearchDays(+e.target.value)}
                      className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-semibold">{searchDays}</span>
                    <span>day{searchDays > 1 ? "s" : ""}</span>
                  </label>
                </div>
              </div>
              <div className="overflow-x-auto">
                <HeatmapSVG data={heatmapData} />
              </div>
            </motion.div> */}
            {/* Word Clouds */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-lg bg-green-100">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">
                      Top Search Queries
                    </h4>
                    <p className="text-sm text-gray-500">
                      Most frequent search terms
                    </p>
                  </div>
                </div>
                <div className="min-h-[300px] flex items-center justify-center">
                  {fullQueries.length ? (
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      }
                    >
                      <SearchWordCloud terms={fullQueries} />
                    </Suspense>
                  ) : (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No search queries found</p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Hash className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">
                      Popular Keywords
                    </h4>
                    <p className="text-sm text-gray-500">
                      Most common words in searches
                    </p>
                  </div>
                </div>
                <div className="min-h-[300px] flex items-center justify-center">
                  {words.length ? (
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                      }
                    >
                      <SearchWordCloud terms={words} />
                    </Suspense>
                  ) : (
                    <div className="text-center py-12">
                      <Hash className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No keywords found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div> */}
            Placeholder
          </div>
        )}

        {activeTab === "rawdata" && (
          <div className="space-y-6">
            {rawList.length > 0 ? (
              rawList.map((item, index) => {
                const isFirst = index === 0;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-gray-200 hover:border-gray-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <Search className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p
                              className={`text-lg font-semibold ${
                                isFirst
                                  ? "text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text"
                                  : "text-gray-900"
                              }`}
                            >
                              Search {index + 1}
                            </p>
                            <p className="text-sm text-gray-500">
                              Search Query
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Time
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                {item.timeString}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Search className="w-4 h-4 text-green-600 mt-1" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Query
                              </p>
                              <p className="font-medium text-gray-900 break-words">
                                "{item.query}"
                              </p>
                            </div>
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
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No search history available.</p>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "transparent" && (
          <TransparentSearchTab searchData={rawList} />
        )}

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center text-gray-500 text-sm"
        >
          <p>Search data analyzed from your Instagram history file.</p>
        </motion.footer>
      </div>
    </main>
  );
}
