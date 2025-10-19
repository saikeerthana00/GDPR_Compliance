import React, {
  useState,
  useEffect,
  useMemo,
  Suspense,
  useCallback,
} from "react";
import JSZip from "jszip";
import { BrowserRouter as Router } from "react-router-dom";
import TransparentTiktokSearch from "./TransparentTiktokSearch";
import TransparentTiktokFollowers from "./TransparentTiktokFollowers";
import TransparentTiktokLocation from "./TransparentTiktokLocation";
import TikTokLikes from "./TikTokLikes";
import TikTokFavourites from "./TikTokFavourites";
import { motion } from "framer-motion";
import {
  Info,
  ExternalLink,
  Clock,
  Users,
  PlayCircle,
  Smartphone,
  Monitor,
  Wifi,
  Signal,
  Eye,
  MapPin,
  Link,
  Play,
  UserPlus,
  Activity,
  Calendar,
  Heart,
  TrendingUp,
  Search,
  Type,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Sidebar from "./SidebarTikTok";
import { HiMenuAlt2 } from "react-icons/hi";
import DataCard from "./components/DataCard";
import SearchWordCloud from "./components/WordCloud";
import MapPlotter from "./components/MapPlotter";
import "./App_main.css";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import BrowsingTransparentTab from "./TransparentTiktokBrowsing";

// ——— helpers for time-based filtering & heatmap ———
const getMaxSpanDays = (data) => {
  if (!data.length) return 1;
  const earliest = Math.min(...data.map((d) => d.time));
  return Math.max(1, Math.ceil((Date.now() - earliest) / 86400000));
};
const filterByDays = (data, days) => {
  const cutoff = Date.now() - days * 86400000;
  return data.filter((d) => d.time >= cutoff);
};
const generateHeatmapGrid = (days, raw) => {
  const cutoff = Date.now() - days * 86400000;
  const counts = raw
    .filter((d) => d.time >= cutoff)
    .reduce((acc, { time }) => {
      const d = new Date(time);
      const key = `${WEEKDAYS[d.getDay()]}_${d
        .getHours()
        .toString()
        .padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  return RENDER_DAYS.flatMap((day) =>
    HOURS.map((hour) => ({ day, hour, count: counts[`${day}_${hour}`] || 0 }))
  );
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);
const RENDER_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ToggleSwitch = ({ checked, onChange, leftLabel, rightLabel }) => (
  <div className="flex items-center gap-2">
    <span
      className={`text-sm ${
        !checked ? "text-gray-900 font-medium" : "text-gray-500"
      }`}
    >
      {leftLabel}
    </span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
    <span
      className={`text-sm ${
        checked ? "text-gray-900 font-medium" : "text-gray-500"
      }`}
    >
      {rightLabel}
    </span>
  </div>
);

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
    if (!max) return "#ffffd9";
    const r = count / max;
    if (r === 0) return "#ffffd9";
    if (r < 0.2) return "#edf8b1";
    if (r < 0.4) return "#c7e9b4";
    if (r < 0.6) return "#7fcdbb";
    if (r < 0.8) return "#41b6c4";
    if (r < 0.9) return "#1d91c0";
    return "#225ea8";
  };
  const show = (day, hour, count, ri, ci) =>
    setTip({
      visible: true,
      x: mL + ci * cellW,
      y: mT + ri * cellH,
      content: `${count} at ${hour}:00 on ${day}`,
    });
  const hide = () => setTip((t) => ({ ...t, visible: false }));

  return (
    <div style={{ position: "relative" }}>
      <svg
        width={mL + HOURS.length * cellW}
        height={mT + RENDER_DAYS.length * cellH + 40}
      >
        {HOURS.map((h, i) => (
          <text
            key={h}
            x={mL + i * cellW + cellW / 2}
            y={mT - 10}
            textAnchor="middle"
            fontSize="12"
            fill="#333"
            fontWeight="bold"
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
            fill="#333"
            fontWeight="bold"
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
                  onMouseEnter={() => show(day, hour, count, ri, ci)}
                  onMouseLeave={hide}
                />
                {count > 0 && (
                  <text
                    x={mL + ci * cellW + cellW / 2}
                    y={mT + ri * cellH + cellH / 2 + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#000"
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
            backgroundColor: "rgba(0,0,0,0.75)",
            color: "#fff",
            padding: "6px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {tip.content}
        </div>
      )}
    </div>
  );
};

const BrowsingCard = ({ userData, onBack, stats }) => {
  const [activeTab, setActiveTab] = useState("concise");
  const [daysWindow, setDaysWindow] = useState(90);
  const [heatmapData, setHeatmapData] = useState([]);

  const list = userData?.["Your Activity"]?.["Watch History"]?.VideoList || [];

  const maxDays = useMemo(() => {
    if (!list.length) return 1;
    const now = Date.now();
    const oldest = new Date(
      Math.min(...list.map((v) => new Date(v.Date).getTime()))
    ).getTime();
    return Math.max(1, Math.ceil((now - oldest) / (1000 * 60 * 60 * 24)));
  }, [list]);

  useEffect(() => {
    const cutoff = Date.now() - daysWindow * 24 * 60 * 60 * 1000;
    const filtered = list.filter(
      ({ Date: d }) => new Date(d).getTime() >= cutoff
    );
    const freq = {};
    filtered.forEach(({ Date: d }) => {
      const dt = new Date(d);
      const key = `${WEEKDAYS[dt.getDay()]}_${dt
        .getHours()
        .toString()
        .padStart(2, "0")}`;
      freq[key] = (freq[key] || 0) + 1;
    });
    const arr = Object.entries(freq).map(([k, count]) => {
      const [day, hour] = k.split("_");
      return { day, hour, count };
    });
    setHeatmapData(arr);
  }, [list, daysWindow]);

  const totalViews = list.filter(
    ({ Date: d }) =>
      new Date(d).getTime() >= Date.now() - daysWindow * 24 * 60 * 60 * 1000
  ).length;

  const peakHour = useMemo(() => {
    const freq = {};
    list.forEach(({ Date: d }) => {
      const time = new Date(d).getTime();
      if (time < Date.now() - daysWindow * 24 * 60 * 60 * 1000) return;
      const h = new Date(d).getHours();
      freq[h] = (freq[h] || 0) + 1;
    });
    return Object.entries(freq).reduce(
      (max, [hour, count]) =>
        count > max.count ? { hour: +hour, count } : max,
      { hour: 0, count: 0 }
    );
  }, [list, daysWindow]);

  const busiestDay = useMemo(() => {
    const freq = {};
    list.forEach(({ Date: d }) => {
      const time = new Date(d).getTime();
      if (time < Date.now() - daysWindow * 24 * 60 * 60 * 1000) return;
      const day = WEEKDAYS[new Date(d).getDay()];
      freq[day] = (freq[day] || 0) + 1;
    });
    return Object.entries(freq).reduce(
      (max, [day, count]) => (count > max.count ? { day, count } : max),
      { day: "", count: 0 }
    );
  }, [list, daysWindow]);

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Browsing History
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
          <>
            {" "}
            <motion.section variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2  gap-6 mb-12">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-blue-100">
                        Videos Viewed
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {stats.totalVideos.toLocaleString()}{" "}
                        <span className="text-base font-normal">total</span>
                      </p>
                    </div>
                    <div className="bg-blue-400 bg-opacity-30 p-2 rounded-lg">
                      <Play size={28} />
                    </div>
                  </div>
                  <p className="mt-4 text-blue-100">Total watch history</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-green-100">
                        Most Active Hour
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {stats.mostActiveHour.toString().padStart(2, "0")}:00
                      </p>
                    </div>
                    <div className="bg-green-400 bg-opacity-30 p-2 rounded-lg">
                      <Clock size={28} />
                    </div>
                  </div>
                  <p className="mt-4 text-green-100">Peak viewing time</p>
                </div>
              </div>
            </motion.section>
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Watch History Heatmap
                    </h4>
                    <div className="relative ml-2">
                      <Info
                        size={18}
                        className="text-gray-500 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={maxDays}
                      value={daysWindow}
                      onChange={(e) => setDaysWindow(+e.target.value)}
                      className="w-32"
                    />
                    <span className="text-sm text-gray-700 whitespace-nowrap w-20">
                      Last{" "}
                      <strong className="inline-block w-6 text-center">
                        {daysWindow}
                      </strong>{" "}
                      day{daysWindow > 1 && "s"}
                    </span>
                  </div>
                </div>
                <HeatmapSVG data={heatmapData} />
                {heatmapData.length === 0 && (
                  <div className="text-red-900 mt-4">
                    No watch data in this range.
                  </div>
                )}
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    Over the last <strong>{daysWindow}</strong> days, you viewed
                    a total of <strong>{totalViews}</strong> videos.
                  </p>
                  <p>
                    You were most active around{" "}
                    <strong>
                      {peakHour.hour.toString().padStart(2, "0")}:00
                    </strong>
                    , when you made <strong>{peakHour.count}</strong> views.
                  </p>
                  <p>
                    Your busiest day was <strong>{busiestDay.day}</strong> with{" "}
                    <strong>{busiestDay.count}</strong> views.
                  </p>
                </div>
              </div>
            </motion.section>
          </>
        )}

        {activeTab === "rawdata" && (
          <div className="space-y-6 mt-8">
            {list.length > 0 ? (
              list.map((item, index) => {
                const displayTime = new Date(item.Date).toUTCString();
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-gray-200 hover:border-gray-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                            <PlayCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-900 mb-1">
                              Video {index + 1}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Eye className="w-3.5 h-3.5 mr-1.5" />
                              Viewed at {displayTime}
                            </p>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                            <Link className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Video Link
                              </p>
                              <a
                                className="font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 truncate"
                                title={item.Link}
                                href={item.Link}
                              >
                                {item.Link || "Unknown"}
                                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                            <Clock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Watch Time
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                {displayTime}
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
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No browsing data available.</p>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "transparent" && (
          <BrowsingTransparentTab report={list} />
        )}
      </div>
    </main>
  );
};

const FollowersCard = ({ userData, onBack }) => {
  const [activeTab, setActiveTab] = useState("concise");

  // Separate state for followers section
  const [followersGranularity, setFollowersGranularity] = useState("year");
  const [followersRange, setFollowersRange] = useState(1);

  // Separate state for following section
  const [followingGranularity, setFollowingGranularity] = useState("year");
  const [followingRange, setFollowingRange] = useState(1);

  const [showInfo, setShowInfo] = useState(false);

  const followersList =
    userData?.["Your Activity"]?.["Follower"]?.FansList || [];
  const followingList =
    userData?.["Your Activity"]?.["Following"]?.Following || [];

  const makeSeries = (events = [], gran = "month") => {
    const counts = {};
    events.forEach(({ Date: d }) => {
      const dt = new Date(d);
      const key =
        gran === "year"
          ? dt.getFullYear().toString()
          : `${MONTH_LABELS[dt.getMonth()]} ${dt.getFullYear()}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const dateA =
          gran === "year"
            ? new Date(`${a.name}-01-01`)
            : new Date(`${a.name.split(" ")[0]} 1, ${a.name.split(" ")[1]}`);
        const dateB =
          gran === "year"
            ? new Date(`${b.name}-01-01`)
            : new Date(`${b.name.split(" ")[0]} 1, ${b.name.split(" ")[1]}`);
        return dateA - dateB;
      });
  };

  const followersRaw = useMemo(
    () => makeSeries(followersList, followersGranularity),
    [followersList, followersGranularity]
  );
  const followingRaw = useMemo(
    () => makeSeries(followingList, followingGranularity),
    [followingList, followingGranularity]
  );

  // Separate maxRange calculations for each section
  const followersMaxRange = useMemo(() => {
    const list = followersList;
    if (!list || !list.length) return 1;

    const now = new Date();
    const earliest = new Date(
      Math.min(...list.map((f) => new Date(f.Date).getTime()))
    );

    if (followersGranularity === "year") {
      return Math.max(1, now.getFullYear() - earliest.getFullYear() + 2);
    } else {
      const monthsDiff =
        (now.getFullYear() - earliest.getFullYear()) * 12 +
        (now.getMonth() - earliest.getMonth()) +
        +2;
      return Math.max(1, monthsDiff);
    }
  }, [followersList, followersGranularity]);

  const followingMaxRange = useMemo(() => {
    const list = followingList;
    if (!list || !list.length) return 48;

    const now = new Date();
    const earliest = new Date(
      Math.min(...list.map((f) => new Date(f.Date).getTime()))
    );

    if (followingGranularity === "year") {
      return Math.max(1, now.getFullYear() - earliest.getFullYear() + 2);
    } else {
      const monthsDiff =
        (now.getFullYear() - earliest.getFullYear()) * 12 +
        (now.getMonth() - earliest.getMonth()) +
        2;
      return Math.max(1, monthsDiff);
    }
  }, [followingList, followingGranularity]);

  // Separate useEffect hooks for each section
  useEffect(() => {
    if (followersList && followersList.length > 0) {
      setFollowersRange((r) => Math.min(r, followersMaxRange));
    }
  }, [followersMaxRange, followersList]);

  useEffect(() => {
    if (followingList && followingList.length > 0) {
      setFollowingRange((r) => Math.min(r, followingMaxRange));
    }
  }, [followingMaxRange, followingList]);

  useEffect(() => {
    setFollowersRange((r) => Math.min(r, followersMaxRange));
  }, [followersMaxRange]);

  useEffect(() => {
    setFollowingRange((r) => Math.min(r, followingMaxRange));
  }, [followingMaxRange]);

  const buildSeries = (raw, r, gran) => {
    const map = Object.fromEntries(raw.map(({ name, value }) => [name, value]));
    const now = new Date();
    const arr = [];
    for (let i = r - 1; i >= 0; i--) {
      if (gran === "month") {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const name = `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
        arr.push({ name, value: map[name] || 0 });
      } else {
        const year = now.getFullYear() - i;
        const name = `${year}`;
        arr.push({ name, value: map[name] || 0 });
      }
    }
    return arr;
  };

  const followersSeries = useMemo(
    () => buildSeries(followersRaw, followersRange, followersGranularity),
    [followersRaw, followersRange, followersGranularity]
  );
  const followingSeries = useMemo(
    () => buildSeries(followingRaw, followingRange, followingGranularity),
    [followingRaw, followingRange, followingGranularity]
  );

  // Calculate followers summary stats
  const followersStats = useMemo(() => {
    const totalFollowers = followersSeries.reduce(
      (sum, item) => sum + item.value,
      0
    );
    const peakPeriod = followersSeries.reduce(
      (max, item) => (item.value > max.value ? item : max),
      { name: "", value: 0 }
    );
    const avgPerPeriod =
      totalFollowers > 0 ? Math.round(totalFollowers / followersRange) : 0;

    return {
      total: totalFollowers,
      peak: peakPeriod,
      average: avgPerPeriod,
    };
  }, [followersSeries, followersRange]);

  // Calculate following summary stats
  const followingStats = useMemo(() => {
    const totalFollowing = followingSeries.reduce(
      (sum, item) => sum + item.value,
      0
    );
    const peakPeriod = followingSeries.reduce(
      (max, item) => (item.value > max.value ? item : max),
      { name: "", value: 0 }
    );
    const avgPerPeriod =
      totalFollowing > 0 ? Math.round(totalFollowing / followingRange) : 0;

    return {
      total: totalFollowing,
      peak: peakPeriod,
      average: avgPerPeriod,
    };
  }, [followingSeries, followingRange]);

  const noFollowersData = followersSeries.every((d) => d.value === 0);
  const noFollowingData = followingSeries.every((d) => d.value === 0);

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Followers & Following
          </h2>
          <button
            onClick={onBack}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Overview
          </button>
        </motion.header>

        <div className="mb-8">
          <nav className="flex justify-center space-x-1 p-1 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
            {[
              { id: "concise", label: "Concise" },
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
          <div className="space-y-12">
            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Followers Acquired
                    </h4>
                    <div className="relative ml-2">
                      <Info
                        size={18}
                        className="text-gray-500 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <ToggleSwitch
                      checked={followersGranularity === "year"}
                      onChange={(checked) =>
                        setFollowersGranularity(checked ? "year" : "month")
                      }
                      leftLabel="Monthly"
                      rightLabel="Yearly"
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={followersMaxRange}
                        value={followersRange}
                        onChange={(e) =>
                          setFollowersRange(parseInt(e.target.value))
                        }
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                            ((followersRange - 1) / (followersMaxRange - 1)) *
                            100
                          }%, #e5e7eb ${
                            ((followersRange - 1) / (followersMaxRange - 1)) *
                            100
                          }%, #e5e7eb 100%)`,
                        }}
                      />
                      <span className="text-sm text-gray-700 whitespace-nowrap min-w-max">
                        Last{" "}
                        <strong className="inline-block w-4 text-center">
                          {followersRange}
                        </strong>{" "}
                        {followersGranularity === "year" ? "years" : "months"}
                      </span>
                    </div>
                  </div>
                </div>
                {noFollowersData ? (
                  <div className="mt-4 text-red-600">
                    No followers in the selected date range.
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart
                        data={followersSeries}
                        margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                      >
                        <defs>
                          <linearGradient
                            id="gradientFollowers"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#82ca9d"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#82ca9d"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                          height={50}
                          tick={{ fontSize: 12, fill: "#333" }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12, fill: "#333" }}
                        />
                        <RechartsTooltip />
                        <Legend
                          verticalAlign="top"
                          wrapperStyle={{ lineHeight: "24px", fontSize: 12 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name="Cumulative"
                          stroke="#82ca9d"
                          fill="url(#gradientFollowers)"
                          animationDuration={1500}
                        />
                        <Bar
                          dataKey="value"
                          name="Followers"
                          barSize={20}
                          fill="#4f81bd"
                          radius={[6, 6, 0, 0]}
                          animationDuration={1500}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>

                    {/* Followers Summary */}
                    <div
                      className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                      style={{
                        fontSize: "14px",
                        color: "#333",
                        lineHeight: "1.6",
                      }}
                    >
                      <p>
                        Over the last <strong>{followersRange}</strong>{" "}
                        {followersGranularity === "year" ? "years" : "months"},
                        you gained <strong>{followersStats.total}</strong>{" "}
                        followers.
                      </p>
                      {followersStats.peak.value > 0 && (
                        <p>
                          Your most successful period was{" "}
                          <strong>{followersStats.peak.name}</strong> when you
                          gained <strong>{followersStats.peak.value}</strong>{" "}
                          followers.
                        </p>
                      )}
                      {followersStats.average > 0 && (
                        <p>
                          On average, you gained{" "}
                          <strong>{followersStats.average}</strong> followers
                          per{" "}
                          {followersGranularity === "year" ? "year" : "month"}.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Following Made
                    </h4>
                    <div className="relative ml-2">
                      <Info
                        size={18}
                        className="text-gray-500 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <ToggleSwitch
                      checked={followingGranularity === "year"}
                      onChange={(checked) =>
                        setFollowingGranularity(checked ? "year" : "month")
                      }
                      leftLabel="Monthly"
                      rightLabel="Yearly"
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={followingMaxRange}
                        value={followingRange}
                        onChange={(e) =>
                          setFollowingRange(parseInt(e.target.value))
                        }
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                            ((followingRange - 1) / (followingMaxRange - 1)) *
                            100
                          }%, #e5e7eb ${
                            ((followingRange - 1) / (followingMaxRange - 1)) *
                            100
                          }%, #e5e7eb 100%)`,
                        }}
                      />
                      <span className="text-sm text-gray-700 whitespace-nowrap min-w-max">
                        Last{" "}
                        <strong className="inline-block w-4 text-center">
                          {followingRange}
                        </strong>{" "}
                        {followingGranularity === "year" ? "years" : "months"}
                      </span>
                    </div>
                  </div>
                </div>
                {noFollowingData ? (
                  <div className="mt-4 text-red-600">
                    No following in the selected date range.
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart
                        data={followingSeries}
                        margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                      >
                        <defs>
                          <linearGradient
                            id="gradientFollowing"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8884d8"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8884d8"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                          height={50}
                          tick={{ fontSize: 12, fill: "#333" }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12, fill: "#333" }}
                        />
                        <RechartsTooltip />
                        <Legend
                          verticalAlign="top"
                          wrapperStyle={{ lineHeight: "24px", fontSize: 12 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name="Cumulative"
                          stroke="#8884d8"
                          fill="url(#gradientFollowing)"
                          animationDuration={1500}
                        />
                        <Bar
                          dataKey="value"
                          name="Following"
                          barSize={20}
                          fill="#c0504d"
                          radius={[6, 6, 0, 0]}
                          animationDuration={1500}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>

                    {/* Following Summary */}
                    <div
                      className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                      style={{
                        fontSize: "14px",
                        color: "#333",
                        lineHeight: "1.6",
                      }}
                    >
                      <p>
                        Over the last <strong>{followingRange}</strong>{" "}
                        {followingGranularity === "year" ? "years" : "months"},
                        you followed <strong>{followingStats.total}</strong>{" "}
                        accounts.
                      </p>
                      {followingStats.peak.value > 0 && (
                        <p>
                          Your most active period was{" "}
                          <strong>{followingStats.peak.name}</strong> when you
                          followed <strong>{followingStats.peak.value}</strong>{" "}
                          accounts.
                        </p>
                      )}
                      {followingStats.average > 0 && (
                        <p>
                          On average, you followed{" "}
                          <strong>{followingStats.average}</strong> accounts per{" "}
                          {followingGranularity === "year" ? "year" : "month"}.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.section>
          </div>
        )}

        {activeTab === "rawdata" && (
          <div className="space-y-8 mt-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">
                      Total Followers
                    </p>
                    <p className="text-2xl font-bold text-blue-800">
                      {followersList.length}
                    </p>
                  </div>
                  <div className="bg-blue-200 p-3 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">
                      Total Following
                    </p>
                    <p className="text-2xl font-bold text-purple-800">
                      {followingList.length}
                    </p>
                  </div>
                  <div className="bg-purple-200 p-3 rounded-full">
                    <UserPlus className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Total Activities
                    </p>
                    <p className="text-2xl font-bold text-green-800">
                      {followersList.length + followingList.length}
                    </p>
                  </div>
                  <div className="bg-green-200 p-3 rounded-full">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Combined Timeline Cards */}
            {(followersList.length > 0 || followingList.length > 0) && (
              <div className="mb-12">
                <div className="space-y-6">
                  {(() => {
                    const combined = [
                      ...followersList.map((item) => ({
                        ...item,
                        type: "follower",
                      })),
                      ...followingList.map((item) => ({
                        ...item,
                        type: "following",
                      })),
                    ].sort((a, b) => new Date(b.Date) - new Date(a.Date));

                    return combined.map((item, index) => {
                      const date = new Date(item.Date);
                      const displayTime = date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const isFollower = item.type === "follower";

                      return (
                        <motion.div
                          key={`${item.type}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.03 }}
                          className={`bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-gray-200 hover:border-${
                            isFollower ? "blue" : "purple"
                          }-300`}
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`p-2.5 rounded-xl bg-gradient-to-br from-${
                                    isFollower ? "blue" : "purple"
                                  }-50 to-${
                                    isFollower ? "blue" : "purple"
                                  }-100 transition-colors`}
                                >
                                  {isFollower ? (
                                    <Users
                                      className={`w-5 h-5 text-${
                                        isFollower ? "blue" : "purple"
                                      }-600`}
                                    />
                                  ) : (
                                    <UserPlus
                                      className={`w-5 h-5 text-${
                                        isFollower ? "blue" : "purple"
                                      }-600`}
                                    />
                                  )}
                                </div>
                                <div>
                                  <p className="text-lg font-semibold text-gray-900 mb-1">
                                    {isFollower
                                      ? `Follower #${index + 1}`
                                      : `Following #${index + 1}`}
                                  </p>
                                  <p className="text-sm text-gray-500 flex items-center">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                    {displayTime}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    isFollower
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-purple-100 text-purple-700"
                                  }`}
                                >
                                  {isFollower ? "Follower" : "Following"}
                                </span>
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    isFollower ? "bg-blue-400" : "bg-purple-400"
                                  } shadow-sm`}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div
                                  className={`flex items-start space-x-3 p-4 bg-gradient-to-r from-${
                                    isFollower ? "blue" : "purple"
                                  }-50 to-${
                                    isFollower ? "blue" : "purple"
                                  }-100/50 rounded-lg border border-${
                                    isFollower ? "blue" : "purple"
                                  }-100 hover:border-${
                                    isFollower ? "blue" : "purple"
                                  }-200 transition-colors`}
                                >
                                  <Clock
                                    className={`w-4 h-4 text-${
                                      isFollower ? "blue" : "purple"
                                    }-600 mt-0.5 flex-shrink-0`}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                      Activity Date
                                    </p>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                  <TrendingUp className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                      Action
                                    </p>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {isFollower
                                        ? "Gained Follower"
                                        : "Followed User"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Empty State */}
            {followersList.length === 0 && followingList.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
              >
                <div className="bg-gray-200 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Social Activity Data
                </h3>
                <p className="text-gray-500 mb-4">
                  Your followers and following activity will appear here
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>Followers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UserPlus className="w-4 h-4" />
                    <span>Following</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "transparent" && (
          <TransparentTiktokFollowers
            followersList={followersList}
            followingList={followingList}
          />
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </main>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

// Separate component for word clouds to completely isolate them from slider state
const WordCloudsSection = React.memo(({ queryTerms, wordTerms }) => {
  return (
    <motion.section variants={itemVariants}>
      <div className="grid grid-cols-1 gap-6">
        {/* Full-Query Cloud */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="text-2xl font-bold text-gray-800 mb-4">
            Top Search Queries (All Time)
          </h4>
          {queryTerms.length ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading word cloud...</div>
                </div>
              }
            >
              <SearchWordCloud terms={queryTerms} />
            </Suspense>
          ) : (
            <p className="text-gray-500 text-sm">No searches available.</p>
          )}
        </div>

        {/* Individual-Words Cloud */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="text-2xl font-bold text-gray-800 mb-4">
            Top Search Words (All Time)
          </h4>
          {wordTerms.length ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading word cloud...</div>
                </div>
              }
            >
              <SearchWordCloud terms={wordTerms} />
            </Suspense>
          ) : (
            <p className="text-gray-500 text-sm">No words to display.</p>
          )}
        </div>
      </div>
    </motion.section>
  );
});

const SearchCard = ({ userData, onBack }) => {
  // grab the raw TikTok searches
  const rawList = useMemo(
    () =>
      userData?.["Your Activity"]?.Searches?.SearchList?.map((e) => ({
        query: e.SearchTerm,
        time: Date.parse(e.Date),
        title: e.SearchTerm, // Add title property for consistency
      })) || [],
    [userData]
  );

  console.log("Raw list: ", rawList);

  // component state
  const [activeTab, setActiveTab] = useState("overview");
  const [heatmapDays, setHeatmapDays] = useState(1); // Renamed for clarity
  const [showHeatmapTooltip, setShowHeatmapTooltip] = useState(false);

  // A small list of English stopwords to filter out common words
  const STOPWORDS = useMemo(
    () =>
      new Set([
        "a",
        "about",
        "above",
        "after",
        "again",
        "against",
        "all",
        "am",
        "an",
        "and",
        "any",
        "are",
        "as",
        "at",
        "be",
        "because",
        "been",
        "before",
        "being",
        "below",
        "between",
        "both",
        "but",
        "by",
        "could",
        "did",
        "do",
        "does",
        "doing",
        "down",
        "during",
        "each",
        "few",
        "for",
        "from",
        "further",
        "had",
        "has",
        "have",
        "having",
        "he",
        "her",
        "here",
        "hers",
        "herself",
        "him",
        "himself",
        "his",
        "how",
        "i",
        "if",
        "in",
        "into",
        "is",
        "it",
        "its",
        "itself",
        "just",
        "me",
        "more",
        "most",
        "my",
        "myself",
        "no",
        "nor",
        "not",
        "now",
        "of",
        "off",
        "on",
        "once",
        "only",
        "or",
        "other",
        "our",
        "ours",
        "ourselves",
        "out",
        "over",
        "own",
        "s",
        "same",
        "she",
        "should",
        "so",
        "some",
        "such",
        "t",
        "than",
        "that",
        "the",
        "their",
        "theirs",
        "them",
        "themselves",
        "then",
        "there",
        "these",
        "they",
        "this",
        "those",
        "through",
        "to",
        "too",
        "under",
        "until",
        "up",
        "very",
        "was",
        "we",
        "were",
        "what",
        "when",
        "where",
        "which",
        "while",
        "who",
        "whom",
        "why",
        "will",
        "with",
        "you",
        "your",
        "yours",
        "yourself",
        "yourselves",
        "per",
        "going",
        "using",
      ]),
    []
  );

  // initialize heatmap slider to full range (capped at 90 days)
  useEffect(() => {
    const maxD = Math.min(90, getMaxSpanDays(rawList));
    setHeatmapDays(maxD);
  }, [rawList]);

  // Use entire dataset for everything else (not filtered by slider)
  const allSearchData = rawList;

  // WordCloud terms: full queries (strings, duplicates allowed) - using ALL data
  // These are now stable and won't change when heatmapDays changes
  const queryTerms = useMemo(
    () => allSearchData.map((item) => item.query),
    [allSearchData]
  );

  // WordCloud terms: individual words (filtered, excluding numbers) - using ALL data
  const wordTerms = useMemo(() => {
    const allWords = [];
    allSearchData.forEach(({ query }) => {
      const words = (query.match(/\b\w+\b/g) || []).map((w) => w.toLowerCase());
      words.forEach((w) => {
        // Filter out stopwords and numbers
        if (!STOPWORDS.has(w) && !/^\d+$/.test(w)) {
          allWords.push(w);
        }
      });
    });
    return allWords;
  }, [allSearchData, STOPWORDS]);

  // summary stats - using ALL data
  const activityStats = useMemo(() => {
    if (!rawList.length)
      return {
        totalQueries: 0,
        avgWordsPerSearch: 0,
        peakHour: "00",
        mostActiveDay: WEEKDAYS[0],
        maxViews: 0,
        dayViews: 0,
      };

    const total = rawList.length;
    const words = rawList.reduce(
      (acc, { query }) => acc + (query.match(/\b\w+\b/g) || []).length,
      0
    );
    const avgWordsPerSearch = Math.round((words / total) * 10) / 10;

    const hourCount = {};
    rawList.forEach(({ time }) => {
      const h = new Date(time).getHours().toString().padStart(2, "0");
      hourCount[h] = (hourCount[h] || 0) + 1;
    });
    const peakHour = Object.entries(hourCount).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    const maxViews = hourCount[peakHour] || 0;

    const dayCount = {};
    rawList.forEach(({ time }) => {
      const d = WEEKDAYS[new Date(time).getDay()];
      dayCount[d] = (dayCount[d] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCount).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    const dayViews = dayCount[mostActiveDay] || 0;

    return {
      totalQueries: total,
      avgWordsPerSearch,
      peakHour,
      mostActiveDay,
      maxViews,
      dayViews,
    };
  }, [rawList]);

  // Word cloud analytics for summaries
  const wordCloudStats = useMemo(() => {
    // Full query analysis
    const queryFreq = {};
    queryTerms.forEach((query) => {
      queryFreq[query] = (queryFreq[query] || 0) + 1;
    });
    const topQueries = Object.entries(queryFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Individual word analysis
    const wordFreq = {};
    wordTerms.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const uniqueQueries = Object.keys(queryFreq).length;
    const uniqueWords = Object.keys(wordFreq).length;
    const repeatSearchRate = Math.round(
      (1 - uniqueQueries / queryTerms.length) * 100
    );

    return {
      topQueries,
      topWords,
      uniqueQueries,
      uniqueWords,
      repeatSearchRate,
      totalFilteredWords: wordTerms.length,
    };
  }, [queryTerms, wordTerms]);

  // raw-data list for "Raw Data" tab - using ALL data
  const rawDataList = useMemo(
    () =>
      rawList.map(({ query, time }, i) => ({
        id: i,
        query,
        title: query,
        time: time,
        timeString: new Date(time).toUTCString(),
      })),
    [rawList]
  );

  // Separate heatmap data and stats to isolate re-renders
  const heatmapData = useMemo(
    () => generateHeatmapGrid(heatmapDays, rawList),
    [heatmapDays, rawList]
  );

  const heatmapStats = useMemo(
    () => ({
      searchesInPeriod: filterByDays(rawList, heatmapDays).length,
      days: heatmapDays,
    }),
    [rawList, heatmapDays]
  );

  // Enhanced WordClouds component with summaries
  const WordCloudsSection = ({ queryTerms, wordTerms }) => (
    <motion.section variants={itemVariants} className="space-y-8">
      {/* Full Query Cloud */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <h4 className="text-2xl font-bold text-gray-800">
            Popular Search Queries
          </h4>
          <div className="relative ml-2">
            <Info size={18} className="text-gray-500 cursor-pointer" />
          </div>
        </div>
        <SearchWordCloud terms={queryTerms} />
        <div
          className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
          style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
        >
          <p>
            You made <strong>{wordCloudStats.uniqueQueries}</strong> unique
            searches out of <strong>{queryTerms.length}</strong> total queries (
            {wordCloudStats.repeatSearchRate}% repeat searches).
          </p>
          {wordCloudStats.topQueries.length > 0 && (
            <p>
              Your most frequent search was "
              <strong>{wordCloudStats.topQueries[0][0]}</strong>" (
              {wordCloudStats.topQueries[0][1]} times)
              {wordCloudStats.topQueries[1] && (
                <>
                  , followed by "
                  <strong>{wordCloudStats.topQueries[1][0]}</strong>" (
                  {wordCloudStats.topQueries[1][1]} times)
                </>
              )}
              .
            </p>
          )}
        </div>
      </div>

      {/* Individual Words Cloud */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <h4 className="text-2xl font-bold text-gray-800">
            Common Search Terms
          </h4>
          <div className="relative ml-2">
            <Info size={18} className="text-gray-500 cursor-pointer" />
          </div>
        </div>
        <SearchWordCloud terms={wordTerms} />
        <div
          className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
          style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
        >
          <p>
            After filtering common words, you used{" "}
            <strong>{wordCloudStats.uniqueWords}</strong> unique terms across{" "}
            <strong>{wordCloudStats.totalFilteredWords}</strong> total words in
            your searches.
          </p>
          {wordCloudStats.topWords.length > 0 && (
            <p>
              Your most used search term was "
              <strong>{wordCloudStats.topWords[0][0]}</strong>" (appeared{" "}
              {wordCloudStats.topWords[0][1]} times)
              {wordCloudStats.topWords[1] && (
                <>
                  , followed by "
                  <strong>{wordCloudStats.topWords[1][0]}</strong>" (
                  {wordCloudStats.topWords[1][1]} times)
                </>
              )}
              .
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );

  // Memoize the word clouds section to prevent unnecessary re-renders
  const memoizedWordClouds = useMemo(
    () => <WordCloudsSection queryTerms={queryTerms} wordTerms={wordTerms} />,
    [queryTerms, wordTerms, wordCloudStats]
  );

  // Handle slider change with immediate state update
  const handleSliderChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    setHeatmapDays(value);
  }, []);

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
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
          <h2 className="text-3xl font-bold text-gray-800">Search History</h2>
        </motion.header>

        {/* Tabs */}
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
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Stats Cards - Always visible */}
            <motion.section variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-indigo-100">
                        Total Queries
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {activityStats.totalQueries}
                      </p>
                    </div>
                    <div className="bg-indigo-400 bg-opacity-30 p-2 rounded-lg">
                      <Search size={24} className="text-indigo-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-indigo-100">
                    Total searches across all time
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-emerald-100">
                        Avg Words
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {activityStats.avgWordsPerSearch}
                      </p>
                    </div>
                    <div className="bg-emerald-400 bg-opacity-30 p-2 rounded-lg">
                      <Type size={24} className="text-emerald-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-emerald-100">
                    Average words per search query
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Heatmap - Always visible */}
            <motion.section variants={itemVariants}>
              <div className="mt-4 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Search Heatmap
                    </h4>
                    <div
                      className="relative ml-2"
                      onMouseEnter={() => setShowHeatmapTooltip(true)}
                      onMouseLeave={() => setShowHeatmapTooltip(false)}
                    >
                      <Info
                        size={18}
                        className="text-gray-500 cursor-pointer"
                      />
                      {showHeatmapTooltip && (
                        <>
                          <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2">
                            <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm">
                              Number of searches by hour & day over period.
                            </div>
                          </div>
                          <div className="absolute z-10 top-[calc(100%+0.25rem)] left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                        </>
                      )}
                    </div>
                  </div>
                  <label className="text-sm text-gray-700 flex items-center">
                    Last <strong className="mx-1">{heatmapDays}</strong> day
                    {heatmapDays > 1 && "s"}:
                    <input
                      type="range"
                      min="1"
                      max={getMaxSpanDays(rawList)}
                      value={heatmapDays}
                      onChange={handleSliderChange}
                      className="w-32 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer ml-2"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                          ((heatmapDays - 1) / (getMaxSpanDays(rawList) - 1)) *
                          100
                        }%, #E5E7EB ${
                          ((heatmapDays - 1) / (getMaxSpanDays(rawList) - 1)) *
                          100
                        }%, #E5E7EB 100%)`,
                      }}
                    />
                  </label>
                </div>
                <HeatmapSVG data={heatmapData} />
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    Over the last {heatmapStats.days} day
                    {heatmapStats.days > 1 && "s"}, you performed{" "}
                    <strong>{heatmapStats.searchesInPeriod}</strong> searches.
                  </p>
                  {rawList.length > 0 && (
                    <>
                      <p>
                        Overall, you made most searches at{" "}
                        <strong>{activityStats.peakHour}:00</strong>.
                      </p>
                      <p>
                        You seemed to make most searches on{" "}
                        <strong>{activityStats.mostActiveDay}</strong>.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Word Clouds with summaries */}
            {memoizedWordClouds}
          </motion.div>
        )}

        {activeTab === "rawdata" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mt-8"
          >
            {rawDataList.length > 0 ? (
              rawDataList.map((item, index) => {
                const displayTime = new Date(item.time).toUTCString();
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-gray-200 hover:border-gray-300"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                          <Search className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-800">
                            Search {index + 1}
                          </p>
                          <p className="text-sm text-gray-500 font-medium">
                            Search Record
                          </p>
                        </div>
                      </div>
                      {/* Query */}
                      <div className="mb-4">
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">
                          Query
                        </p>
                        <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                          {item.query}
                        </p>
                      </div>
                      {/* Timestamp */}
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-200">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">
                            Timestamp
                          </p>
                          <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                            {displayTime}
                          </p>
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
          </motion.div>
        )}

        {activeTab === "transparent" && (
          <TransparentTiktokSearch rawDataList={rawDataList} />
        )}
      </div>
    </main>
  );
};
const LocationCard = ({ userData, onBack }) => {
  const [activeTab, setActiveTab] = useState("concise");
  const [sortOrder, setSortOrder] = useState("descending"); // "ascending" or "descending"

  const logins =
    userData?.["Your Activity"]?.["Login History"]?.LoginHistoryList || [];

  // Calculate statistics
  const stats = useMemo(() => {
    const deviceCounts = {};
    const locationCounts = {};

    logins.forEach((login) => {
      const device = login.DeviceModel || "Unknown Device";
      const ip = login.IP || "Unknown Location";

      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      locationCounts[ip] = (locationCounts[ip] || 0) + 1;
    });

    const uniqueDevices = Object.keys(deviceCounts).length;
    const totalLogins = logins.length;

    // Prepare pie chart data
    const pieData = Object.entries(deviceCounts).map(([device, count]) => ({
      name: device,
      value: count,
      percentage: ((count / totalLogins) * 100).toFixed(1),
    }));

    // Sort device list
    const sortedDevices = Object.entries(deviceCounts)
      .sort(([, a], [, b]) => (sortOrder === "descending" ? b - a : a - b))
      .map(([device, count]) => ({ device, count }));

    // Get most frequent locations (top 5)
    const frequentLocations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    // Get most used device
    const mostUsedDevice = Object.entries(deviceCounts).reduce(
      (max, [device, count]) => (count > max.count ? { device, count } : max),
      { device: "None", count: 0 }
    );

    // Get most frequent location
    const mostFrequentLocation = Object.entries(locationCounts).reduce(
      (max, [location, count]) =>
        count > max.count ? { location, count } : max,
      { location: "Unknown", count: 0 }
    );

    return {
      totalLogins,
      uniqueDevices,
      pieData,
      sortedDevices,
      frequentLocations,
      mostUsedDevice,
      mostFrequentLocation,
    };
  }, [logins, sortOrder]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Colors for pie chart
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#F97316",
    "#06B6D4",
    "#84CC16",
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} logins ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Login Locations
          </h2>
          <button
            onClick={onBack}
            className="text-blue-600 hover:underline text-sm"
          >
            &larr; Back to Overview
          </button>
        </motion.header>

        {/* Stats Cards */}
        <motion.section
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-lg font-medium text-indigo-100">
                    Total Logins
                  </h5>
                  <p className="text-3xl font-bold mt-2">{stats.totalLogins}</p>
                </div>
                <div className="bg-indigo-400 bg-opacity-30 p-2 rounded-lg">
                  <Search size={24} className="text-indigo-100" />
                </div>
              </div>
              <p className="mt-4 text-indigo-100">
                Total login sessions recorded
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-lg font-medium text-emerald-100">
                    Unique Devices
                  </h5>
                  <p className="text-3xl font-bold mt-2">
                    {stats.uniqueDevices}
                  </p>
                </div>
                <div className="bg-emerald-400 bg-opacity-30 p-2 rounded-lg">
                  <Users size={24} className="text-emerald-100" />
                </div>
              </div>
              <p className="mt-4 text-emerald-100">
                Different devices used for login
              </p>
            </div>
          </div>
        </motion.section>

        <div className="mb-8">
          <nav className="flex justify-center space-x-1 p-1 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
            {[
              { id: "concise", label: "Concise" },
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
            {/* Map Section */}
            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <MapPlotter
                  logins={logins}
                  frequentLocations={stats.frequentLocations}
                  showFrequentLocationsList={true}
                />
                {!logins.length && (
                  <div className="text-red-600 mt-4">
                    No login history available.
                  </div>
                )}
                {stats.frequentLocations.length > 0 && (
                  <div
                    className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      lineHeight: "1.6",
                    }}
                  >
                    <p>
                      You have logged in from a total of{" "}
                      <strong>{stats.frequentLocations.length}</strong>{" "}
                      different locations.
                    </p>
                    <p>
                      Your most frequently used location is{" "}
                      <strong>{stats.mostFrequentLocation.location}</strong>{" "}
                      with <strong>{stats.mostFrequentLocation.count}</strong>{" "}
                      login sessions.
                    </p>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Charts Section */}
            {stats.totalLogins > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <motion.section variants={itemVariants}>
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                      <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                      Logins by Device Model
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) =>
                              `${name}: ${percentage}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {stats.pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Legend />
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
                        You have used <strong>{stats.uniqueDevices}</strong>{" "}
                        different devices for login.
                      </p>
                      <p>
                        Your most frequently used device is{" "}
                        <strong>{stats.mostUsedDevice.device}</strong> with{" "}
                        <strong>{stats.mostUsedDevice.count}</strong> login
                        sessions (
                        {(
                          (stats.mostUsedDevice.count / stats.totalLogins) *
                          100
                        ).toFixed(1)}
                        % of total).
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Device List */}
                <motion.section variants={itemVariants}>
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold flex items-center">
                        <Monitor className="w-5 h-5 mr-2 text-green-600" />
                        Device Login Count
                      </h3>
                      <button
                        onClick={() =>
                          setSortOrder(
                            sortOrder === "ascending"
                              ? "descending"
                              : "ascending"
                          )
                        }
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <span className="text-sm font-medium">
                          {sortOrder === "ascending"
                            ? "Ascending"
                            : "Descending"}
                        </span>
                        {sortOrder === "ascending" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {stats.sortedDevices.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor: COLORS[idx % COLORS.length],
                              }}
                            ></div>
                            <span className="font-medium text-gray-900">
                              {item.device}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">
                              {item.count}
                            </span>
                            <p className="text-xs text-gray-500">
                              {((item.count / stats.totalLogins) * 100).toFixed(
                                1
                              )}
                              %
                            </p>
                          </div>
                        </div>
                      ))}
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
                        Device usage ranges from{" "}
                        <strong>
                          {Math.min(...stats.sortedDevices.map((d) => d.count))}
                        </strong>{" "}
                        to{" "}
                        <strong>
                          {Math.max(...stats.sortedDevices.map((d) => d.count))}
                        </strong>{" "}
                        login sessions.
                      </p>
                      <p>
                        The top 3 devices account for{" "}
                        <strong>
                          {(
                            (stats.sortedDevices
                              .slice(0, 3)
                              .reduce((sum, d) => sum + d.count, 0) /
                              stats.totalLogins) *
                            100
                          ).toFixed(1)}
                          %
                        </strong>{" "}
                        of all login sessions.
                      </p>
                    </div>
                  </div>
                </motion.section>
              </div>
            )}
          </div>
        )}
        {activeTab === "rawdata" && (
          <div className="space-y-6 mt-8">
            {logins.length > 0 ? (
              logins.map((item, idx) => {
                const displayTime = new Date(item.Date).toUTCString();
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-gray-200 hover:border-gray-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100 transition-colors">
                            <MapPin className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-900 mb-1">
                              Login {idx + 1}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1.5" />
                              Accessed at {displayTime}
                            </p>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {/* IP Address */}
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                IP Address
                              </p>
                              <p className="font-medium text-gray-900 text-sm break-all">
                                {item.IP || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Login Time */}
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-colors">
                            <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Login Time
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                {displayTime}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Device Model */}
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                            <Smartphone className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Device Model
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                {item.DeviceModel || "Unknown Device"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Device System */}
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100 hover:border-orange-200 transition-colors">
                            <Monitor className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Operating System
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                {item.DeviceSystem || "Unknown OS"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Network Type */}
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-100 hover:border-teal-200 transition-colors">
                            <Wifi className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Network Type
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                {item.NetworkType || "Unknown Network"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Carrier */}
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100 hover:border-pink-200 transition-colors">
                            <Signal className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Carrier
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                {item.Carrier || "Not Specified"}
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
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No login data available.</p>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "transparent" && (
          <div className="mt-8">
            <TransparentTiktokLocation logins={logins} />
          </div>
        )}
      </div>
    </main>
  );
};

const UploadTikTok = () => {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(true);
  const [file, setFile] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const toggleSidebar = () => {
    setOpenSidebarToggle((prev) => !prev);
  };

  const normalizeFavs = (list) => {
    if (!Array.isArray(list)) return [];
    const out = list
      .map((e) => ({
        Date: e.Date || e.date || "",
        Link: e.Link || e.link || "",
      }))
      .filter((e) => e.Date && e.Link)
      .sort((a, b) => new Date(b.Date) - new Date(a.Date));
    return out;
  };

  const normalizeLikes = (list) => {
    if (!Array.isArray(list)) return [];
    const out = list
      .map((e) => ({
        Date: e.Date || e.date || "",
        Link: e.Link || e.link || "",
      }))
      .filter((e) => e.Date && e.Link)
      .sort((a, b) => new Date(b.Date) - new Date(a.Date));
    return out;
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a ZIP file.");
      return;
    }
    setLoading(true);
    setUserData(null);

    try {
      const zip = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const zipData = new JSZip();
            zipData.loadAsync(event.target.result).then(resolve).catch(reject);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsArrayBuffer(file);
      });

      const data = await loadTikTokJsonFromZip(zip);

      const ya = data?.["Your Activity"] || {};
      const favRaw =
        ya?.["Favorite Videos"]?.FavoriteVideoList ??
        ya?.FavoriteVideos?.FavoriteVideoList ??
        [];
      const likeRaw =
        ya?.["Like List"]?.ItemFavoriteList ??
        ya?.LikeList?.ItemFavoriteList ??
        [];

      const favNormalized = normalizeFavs(favRaw);
      const likeNormalized = normalizeLikes(likeRaw);

      if (!data["Your Activity"]) data["Your Activity"] = {};
      if (!data["Your Activity"]["Favorite Videos"])
        data["Your Activity"]["Favorite Videos"] = {};
      if (!data["Your Activity"]["Like List"])
        data["Your Activity"]["Like List"] = {};

      data["Your Activity"]["Favorite Videos"].FavoriteVideoListNormalized =
        favNormalized;
      data["Your Activity"]["Like List"].ItemFavoriteListNormalized =
        likeNormalized;

      setUserData(data);
    } catch (error) {
      console.error("Upload or processing failed:", error);
      alert("Upload or processing failed. Please check the file and console.");
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadTikTokJsonFromZip = async (zip) => {
    const path = "user_data_tiktok.json";
    const fileObj = zip.file(path);
    if (!fileObj) {
      throw new Error(`Could not find ${path} in the ZIP.`);
    }
    const content = await fileObj.async("string");
    return JSON.parse(content);
  };

  const handleTitleClick = (title) => {
    setActiveCard(title);
  };

  const handleBack = () => {
    setActiveCard(null);
  };

  const stats = useMemo(() => {
    if (!userData) return {};
    const videoList =
      userData?.["Your Activity"]?.["Watch History"]?.VideoList || [];
    const followersList =
      userData?.["Your Activity"]?.["Follower"]?.FansList || [];
    const followingList =
      userData?.["Your Activity"]?.["Following"]?.Following || [];
    const favListNorm =
      userData?.["Your Activity"]?.["Favorite Videos"]
        ?.FavoriteVideoListNormalized || [];
    const likeListNorm =
      userData?.["Your Activity"]?.["Like List"]?.ItemFavoriteListNormalized ||
      [];

    const totalVideos = videoList.length;
    const hourCounts = {};
    videoList.forEach(({ Date: d }) => {
      const h = new Date(d).getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const mostActiveHour = Object.entries(hourCounts).reduce(
      (max, [hour, count]) =>
        count > max.count ? { hour: +hour, count } : max,
      { hour: 0, count: 0 }
    );

    return {
      totalVideos,
      mostActiveHour: mostActiveHour.hour,
      followersGained: followersList?.length || 0,
      followingIncrease: followingList?.length || 0,
      favoritesCount: favListNorm.length,
      likesCount: likeListNorm.length,
    };
  }, [userData]);

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <div
          className={`transition-all duration-300 ${
            openSidebarToggle ? "w-64" : "w-0"
          }`}
        >
          <Sidebar
            openSidebarToggle={openSidebarToggle}
            OpenSidebar={toggleSidebar}
            setActiveCard={setActiveCard}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {!openSidebarToggle && (
            <button
              onClick={toggleSidebar}
              className="fixed left-4 top-4 z-50 bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
            >
              <HiMenuAlt2 className="w-6 h-6 text-gray-700" />
            </button>
          )}

          <main className="flex-1 overflow-y-auto p-4">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
              Upload TikTok Data
            </h2>

            <label
              htmlFor="tiktok-upload"
              className="block mb-4 text-lg font-semibold text-gray-700 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg py-6 text-center hover:border-blue-500 transition-colors"
            >
              {file ? file.name : "Choose a .zip file to upload"}
              <input
                id="tiktok-upload"
                type="file"
                accept=".zip"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={loading}
                className="hidden"
              />
            </label>
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg text-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Submit"}
            </button>

            <div className="mt-8">
              {userData ? (
                activeCard === "Liked Posts" ? (
                  <TikTokLikes userData={userData} onBack={handleBack} />
                ) : activeCard === "Favourites" ? (
                  <TikTokFavourites userData={userData} onBack={handleBack} />
                ) : activeCard === "Browsing History" ? (
                  <BrowsingCard
                    userData={userData}
                    onBack={handleBack}
                    stats={stats}
                  />
                ) : activeCard === "Followers & Following" ? (
                  <FollowersCard userData={userData} onBack={handleBack} />
                ) : activeCard === "Search History" ? (
                  <SearchCard userData={userData} onBack={handleBack} />
                ) : activeCard === "Login History" ? (
                  <LocationCard userData={userData} onBack={handleBack} />
                ) : (
                  <div className="grid grid-cols-3 justify-center gap-4">
                    <DataCard
                      title="Browsing History"
                      description="Overview of watch activity"
                      whyCollectedAnswer="To improve your “For You” feed, content suggestions, ads, and overall experience, as well as to maintain safety and performance."
                      sharedWithAnswer="Data may be shared with service providers; third-party platforms and partners integrated with TikTok; advertisers (in aggregate reports)measurement/data partners; TikTok’s Corporate Group. Know <a 
                                                                                                                                                                                                              href='https://www.tiktok.com/legal/page/eea/privacy-policy/en' 
                                                                                                                                                                                                              class='text-blue-600 underline'
                                                                                                                                                                                                              target='_blank'
                                                                                                                                                                                                              rel='noopener noreferrer'
                                                                                                                                                                                                            > more.</a>"
                      howToControlAnswer="TikTok doesn't provide option to clear the browsing history directly through the app/website."
                      howLongStoredAnswer="TikTok usually retains the browsing history either for 3 months or 1.5 years or sometime even for a longer time."
                      onTitleClick={handleTitleClick}
                    />
                    <DataCard
                      title="Followers & Following"
                      description="Followers acquired and accounts you follow"
                      whyCollectedAnswer="TikTok collects information about “the accounts you follow and that follow you” to provide and administer the Platform, personalise features (e.g., recommendations/suggestions), support social interactions. Know <a 
                                                                                                                                                                                                              href='https://www.tiktok.com/legal/page/eea/privacy-policy/en' 
                                                                                                                                                                                                              class='text-blue-600 underline'
                                                                                                                                                                                                              target='_blank'
                                                                                                                                                                                                              rel='noopener noreferrer'
                                                                                                                                                                                                            > more.</a>"
                      sharedWithAnswer="Follower/following information can be visible to other users and the public depending on your settings."
                      howToControlAnswer="You can use in-app privacy settings (e.g., account visibility and audience controls) to manage how follower/following information is shown"
                      howLongStoredAnswer="Information is kept for as long as you have an account"
                      onTitleClick={handleTitleClick}
                    />
                    <DataCard
                      title="Search History"
                      description="Search terms used on TikTok"
                      whyCollectedAnswer="To improve your “For You” feed, content suggestions, ads, and overall experience, as well as to maintain safety and performance."
                      sharedWithAnswer="Data may be shared with service providers; third-party platforms and partners integrated with TikTok; advertisers (in aggregate reports)measurement/data partners; TikTok’s Corporate Group. Know <a 
                                                                                                                                                                                                              href='https://www.tiktok.com/legal/page/eea/privacy-policy/en' 
                                                                                                                                                                                                              class='text-blue-600 underline'
                                                                                                                                                                                                              target='_blank'
                                                                                                                                                                                                              rel='noopener noreferrer'
                                                                                                                                                                                                            > more.</a>"
                      howToControlAnswer="TikTok doesn't provide option to clear the search history directly through the app/website."
                      howLongStoredAnswer="TikTok usually retains the browsing history either for 3 months or 1.5 years or sometime even for a longer time."
                      onTitleClick={handleTitleClick}
                    />
                    <DataCard
                      title="Login History"
                      description="Location, device and network connection information when you access the Platform."
                      whyCollectedAnswer="TikTok collects technical information such as device ID, IP address, and system details “to identify your activity across devices to give you a seamless log-in experience and for security purposes."
                      sharedWithAnswer="Login-related information may be shared with service providers (for hosting, security, analytics), TikTok’s corporate group entities supporting global operations, and—when legally required—law enforcement or public authorities. Know <a 
                                                                                                                                                                                                              href='https://www.tiktok.com/legal/page/eea/privacy-policy/en' 
                                                                                                                                                                                                              class='text-blue-600 underline'
                                                                                                                                                                                                              target='_blank'
                                                                                                                                                                                                              rel='noopener noreferrer'
                                                                                                                                                                                                            > more.</a>"
                      howToControlAnswer="Manage permisssions in your device."
                      howLongStoredAnswer="Information is kept for as long as you have an account"
                      onTitleClick={handleTitleClick}
                    />
                    <DataCard
                      title="Liked Posts"
                      description="Posts you liked on TikTok"
                      whyCollectedAnswer="To improve your “For You” feed, content suggestions, ads, and overall experience, as well as to maintain safety and performance."
                      sharedWithAnswer="Your likes and engagement activity may be: Visible to other users and the public (depending on your account/privacy settings); Included in aggregate analytics reports for creators, advertisers, and partners..etc. Know <a 
                                                                                                                                                                                                              href='https://www.tiktok.com/legal/page/eea/privacy-policy/en' 
                                                                                                                                                                                                              class='text-blue-600 underline'
                                                                                                                                                                                                              target='_blank'
                                                                                                                                                                                                              rel='noopener noreferrer'
                                                                                                                                                                                                            > more.</a>"
                      howToControlAnswer="You can also delete likes manually."
                      howLongStoredAnswer="TikTok retains like/interactions data as long as necessary to operate and personalise the Platform and to fulfil legal or business obligations."
                      onTitleClick={handleTitleClick}
                    />
                    <DataCard
                      title="Favourites"
                      description="Saved TikTok videos"
                      whyCollectedAnswer="To improve your “For You” feed, content suggestions, ads, and overall experience, as well as to maintain safety and performance. Also, for you to keep track of favourite videos."
                      sharedWithAnswer="Only visible to you and may be used by TikTok to provide better services."
                      howToControlAnswer="You can also manually remove them from the favourites list."
                      howLongStoredAnswer="TikTok retains favourites information as long as necessary to provide and personalise the Platform, comply with law, or pursue legitimate business purposes."
                      onTitleClick={handleTitleClick}
                    />
                  </div>
                )
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default UploadTikTok;
