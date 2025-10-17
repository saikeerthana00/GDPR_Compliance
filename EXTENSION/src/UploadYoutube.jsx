import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useTransition,
  Suspense,
} from "react";
import JSZip from "jszip";
import { BrowserRouter as Router } from "react-router-dom";
import SubscriptionsCharts from "./SubscriptionCharts";
import WatchLaterCharts from "./WatchLaterCharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  Video,
  CircleDollarSign,
  Play,
  ExternalLink,
  Eye,
  Users,
  TrendingUp,
  Crown,
  Medal,
  Award,
  Search,
  Type,
  MessageCircleMore,
} from "lucide-react";
import { HiMenuAlt2 } from "react-icons/hi";
import { debounce } from "lodash";
import "./App_main.css";
import Sidebar from "./SidebarYoutube";
import DataCard from "./components/DataCard";
import SearchWordCloud from "./components/WordCloud";
import WatchSection from "./TransparentYoutubeBrowsing";
import SearchSection from "./TransparentYoutubeSearch";
import CommentsSection from "./TransparentYoutubeComments";

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
      const key = `${DAYS[d.getDay()]}_${d
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

const aggregateBy = (data, keyFn) => {
  const map = {};
  data.forEach((item) => {
    const k = keyFn(item);
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);
};

const generateColors = () =>
  Array.from({ length: 20 }, (_, i) => `hsl(${(i * 25) % 360}, 80%, 65%)`);
const COLORS = generateColors();

const CustomTooltipPie = ({ active, payload, total }) => {
  if (active && payload?.length && total > 0) {
    const { key, value } = payload[0].payload;
    const pct = ((value / total) * 100).toFixed(1);
    return (
      <div className="bg-white shadow-lg rounded-lg p-4 text-sm border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{key}</p>
        <p className="text-gray-700">{`${value} (${pct}%)`}</p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const YoutubeBrowsingCharts = ({ report, onBack }) => {
  const [viewDays, setViewDays] = useState(1);
  const [searchDays, setSearchDays] = useState(1);
  const [contentDays, setContentDays] = useState(1);
  const [pieEntries, setPieEntries] = useState(5);

  const [imViewDays, setImViewDays] = useState(1);
  const [imSearchDays, setImSearchDays] = useState(1);
  const [imContentDays, setImContentDays] = useState(1);
  const [imPieEntries, setImPieEntries] = useState(5);

  const [showContentTooltip, setShowContentTooltip] = useState(false);
  const [showHeatmapTooltip, setShowHeatmapTooltip] = useState(false);
  const [showSearchTooltip, setShowSearchTooltip] = useState(false);
  const [showFeedTooltip, setShowFeedTooltip] = useState(false);
  const [showAllLegendEntries, setShowAllLegendEntries] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [isPending, startTransition] = useTransition();
  const cacheRef = useRef({ heatmap: { views: {}, searches: {} } });

  const debouncedSet = useCallback(
    debounce((setter, value) => {
      startTransition(() => setter(value));
    }, 100),
    []
  );

  const [data, setData] = useState({ watch: [], search: [] });
  const [loaded, setLoaded] = useState(false);

  const [topN, setTopN] = useState(5);
  const getRankIcon = (idx) => {
    if (idx === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (idx === 1) return <Medal className="w-5 h-5 text-gray-500" />;
    if (idx === 2) return <Award className="w-5 h-5 text-orange-500" />;
    return (
      <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">
        #{idx + 1}
      </span>
    );
  };

  const getWatchBadgeColor = (count) => {
    if (count >= 40) return "bg-red-50 text-red-700 border border-red-200";
    if (count >= 30)
      return "bg-orange-50 text-orange-700 border border-orange-200";
    if (count >= 20)
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    return "bg-blue-50 text-blue-700 border border-blue-200";
  };

  const getRowBgColor = (idx) => {
    if (idx === 0)
      return "bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-yellow-400";
    if (idx === 1)
      return "bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-l-gray-400";
    if (idx === 2)
      return "bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-400";
    return "bg-white hover:bg-gray-50";
  };

  const truncateUrl = (url) => {
    if (url.length > 35) {
      return url.substring(0, 35) + "...";
    }
    return url;
  };

  useEffect(() => {
    if (!report) return;
    const { watch, search } = report;
    setData({ watch, search });

    const maxV = Math.min(90, getMaxSpanDays(watch));
    const maxS = Math.min(90, getMaxSpanDays(search));
    setViewDays(maxV);
    setSearchDays(maxS);
    setContentDays(maxV);
    setPieEntries(
      Math.min(5, aggregateBy(watch, (i) => i.subtitlesName).length)
    );
    setImViewDays(maxV);
    setImSearchDays(maxS);
    setImContentDays(maxV);
    setImPieEntries(
      Math.min(5, aggregateBy(watch, (i) => i.subtitlesName).length)
    );
    setLoaded(true);
  }, [report]);

  useEffect(() => {
    setImViewDays(viewDays);
  }, [viewDays]);
  useEffect(() => {
    setImSearchDays(searchDays);
  }, [searchDays]);
  useEffect(() => {
    setImContentDays(contentDays);
  }, [contentDays]);
  useEffect(() => {
    setImPieEntries(pieEntries);
  }, [pieEntries]);

  useEffect(() => {
    cacheRef.current.heatmap.views = {};
    cacheRef.current.heatmap.searches = {};
  }, [data.watch, data.search]);

  const getHeatmap = useCallback(
    (type, days) => {
      const raw = type === "views" ? data.watch : data.search;
      const slot = cacheRef.current.heatmap[type];
      if (!slot[days]) slot[days] = generateHeatmapGrid(days, raw);
      return slot[days];
    },
    [data.watch, data.search]
  );

  const heatmapViews = useMemo(
    () => getHeatmap("views", viewDays),
    [getHeatmap, viewDays]
  );
  const heatmapSearches = useMemo(
    () => getHeatmap("searches", searchDays),
    [getHeatmap, searchDays]
  );

  const filteredWatch = useMemo(
    () => filterByDays(data.watch, viewDays),
    [data.watch, viewDays]
  );
  const filteredSearch = useMemo(
    () => filterByDays(data.search, searchDays),
    [data.search, searchDays]
  );

  const contentPieData = useMemo(() => {
    return aggregateBy(
      filterByDays(data.watch, contentDays).filter(
        (i) => i.subtitlesName !== "Unknown"
      ),
      (i) => i.subtitlesName
    );
  }, [data.watch, contentDays]);

  const limitedPieData = useMemo(
    () => contentPieData.slice(0, pieEntries),
    [contentPieData, pieEntries]
  );

  const feedHourly = useMemo(() => {
    return HOURS.map((hStr) => {
      const h = parseInt(hStr, 10);
      const events = filteredWatch.filter(
        (e) => new Date(e.time).getHours() === h
      );
      const adCount = events.filter((e) => e.type === "ad").length;
      const videoCount = events.filter((e) => e.type === "video").length;
      const total = events.length;
      return {
        hour: hStr,
        videosRatio: total ? videoCount / total : 0,
        adsRatio: total ? adCount / total : 0,
        videoCount,
        adCount,
        total,
      };
    });
  }, [filteredWatch]);

  const searchTerms = useMemo(
    () => aggregateBy(filteredSearch, (i) => i.title.toLowerCase()),
    [filteredSearch]
  );

  const activityStats = useMemo(() => {
    if (!data.watch.length)
      return {
        total: 0,
        posts: 0,
        ads: 0,
        peakHour: "00",
        maxViews: 0,
        mostActiveDay: "Monday",
        dayViews: 0,
      };
    const posts = data.watch.filter((item) => item.type === "video").length;
    const ads = data.watch.filter((item) => item.type === "ad").length;
    const hourCounts = {};
    data.watch.forEach((item) => {
      const hour = new Date(item.time).getHours().toString().padStart(2, "0");
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    const maxViews = hourCounts[peakHour] || 0;
    const dayCounts = {};
    data.watch.forEach((item) => {
      const day = DAYS[new Date(item.time).getDay()];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    const dayViews = dayCounts[mostActiveDay] || 0;
    return {
      total: posts + ads,
      posts,
      ads,
      peakHour,
      maxViews,
      mostActiveDay,
      dayViews,
    };
  }, [data.watch]);

  const feedStats = useMemo(() => {
    if (!filteredWatch.length)
      return {
        postsPercent: 0,
        adsPercent: 0,
        highestAdHour: "00",
        highestAdPercent: 0,
        highestPostHour: "00",
        highestPostPercent: 0,
      };
    const posts = filteredWatch.filter((item) => item.type === "video").length;
    const ads = filteredWatch.filter((item) => item.type === "ad").length;
    const total = posts + ads;
    let postsPercent = ((posts / total) * 100).toFixed(0);
    let adsPercent = ((ads / total) * 100).toFixed(0);
    let highestAdHour = "00",
      highestAdPercent = 0,
      highestPostHour = "00",
      highestPostPercent = 0;
    feedHourly.forEach((hourData) => {
      if (hourData.total > 0) {
        const adPercent = hourData.adsRatio * 100;
        const postPercent = hourData.videosRatio * 100;
        if (adPercent > highestAdPercent) {
          highestAdPercent = adPercent;
          highestAdHour = hourData.hour;
        }
        if (postPercent > highestPostPercent) {
          highestPostPercent = postPercent;
          highestPostHour = hourData.hour;
        }
      }
    });
    return {
      postsPercent,
      adsPercent,
      highestAdHour,
      highestAdPercent: highestAdPercent.toFixed(0),
      highestPostHour,
      highestPostPercent: highestPostPercent.toFixed(0),
    };
  }, [filteredWatch, feedHourly]);

  const displayLegendEntries = useMemo(() => {
    if (contentPieData.length <= 6 || showAllLegendEntries) {
      return limitedPieData;
    }
    return limitedPieData.slice(0, 6);
  }, [limitedPieData, showAllLegendEntries, contentPieData.length]);

  const shouldShowToggle = contentPieData.length > 6 && pieEntries > 6;

  // Aggregate watch-counts by video (title + url + channel)
  const videoCounts = useMemo(() => {
    const map = {};
    data.watch.forEach((item) => {
      //   console.log(item.url);
      if (item.type === "video") {
        const key = item.url || item.title; // use URL if available, else title
        if (!map[key]) {
          map[key] = {
            title: item.title,
            url: item.url,
            channel: item.subtitlesName,
            count: 0,
          };
        }
        map[key].count += 1;
      }
    });
    return Object.values(map)
      .filter((v) => v.count >= 10)
      .sort((a, b) => b.count - a.count);
  }, [data.watch]);
  console.log(videoCounts);
  // Ensure topN does not exceed available entries
  useEffect(() => {
    setTopN((prev) => {
      if (videoCounts.length === 0) return 3;
      return Math.min(prev, videoCounts.length);
    });
  }, [videoCounts]);

  return (
    <main className="flex-1 overflow-y-auto">
      <button
        onClick={onBack}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        &larr; Back
      </button>
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            YouTube Watch History
          </h2>
        </motion.header>

        <div className="mb-8">
          <nav className="flex justify-center space-x-1 p-1 bg-white rounded-xl shadow-md max-w-3xl mx-auto">
            {[
              { id: "overview", label: "Concise" },
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
            {/* Stats Cards */}
            <motion.section variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-blue-100">
                        Views
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {activityStats.posts} views
                      </p>
                    </div>
                    <div className="bg-blue-400 bg-opacity-30 p-2 rounded-lg">
                      <Video size={24} className="text-blue-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-blue-100">
                    Content from your followed channels
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-green-100">
                        Ads
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {activityStats.ads} views
                      </p>
                    </div>
                    <div className="bg-green-400 bg-opacity-30 p-2 rounded-lg">
                      <CircleDollarSign size={24} className="text-green-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-green-100">
                    Advertisement content you watched
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-purple-100">
                        Peak Hour
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {activityStats.peakHour}:00
                      </p>
                    </div>
                    <div className="bg-purple-400 bg-opacity-30 p-2 rounded-lg">
                      <Clock size={24} className="text-purple-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-purple-100">Your most active hour</p>
                </div>
              </div>
            </motion.section>

            {/* Views Heatmap */}
            <motion.section
              variants={itemVariants}
              className={`${
                activeTab !== "overview" && activeTab !== "overview"
                  ? "hidden"
                  : ""
              }`}
            >
              <div className="mt-4 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      When do you watch?
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
                            <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                              <p className="text-sm">
                                Number of videos and ads viewed by hour and day over
                                the selected period.
                              </p>
                            </div>
                          </div>
                          <div className="absolute z-10 top-[calc(100%+0.25rem)] left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                        </>
                      )}
                    </div>
                  </div>
                  <label className="text-sm text-gray-700 flex items-center">
                    Last <strong className="mx-1">{imViewDays}</strong> day
                    {imViewDays > 1 && "s"}:
                    <input
                      type="range"
                      min="1"
                      max={getMaxSpanDays(data.watch)}
                      value={imViewDays}
                      onChange={(e) => {
                        const v = +e.currentTarget.value;
                        setImViewDays(v);
                        debouncedSet(setViewDays, v);
                      }}
                      className="w-32 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </label>
                </div>
                <HeatmapSVG data={heatmapViews} />
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    Over the last {viewDays} day{viewDays > 1 && "s"}, you
                    viewed a total of <strong>{activityStats.total}</strong>{" "}
                    videos and ads.
                  </p>
                  <p>
                    You viewed most videos at{" "}
                    <strong>{activityStats.peakHour}:00</strong> with{" "}
                    <strong>{activityStats.maxViews}</strong> views.
                  </p>
                  <p>
                    Your most active day was{" "}
                    <strong>{activityStats.mostActiveDay}</strong> with{" "}
                    <strong>{activityStats.dayViews}</strong> views.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Content Pie */}
            <motion.section
              variants={itemVariants}
              className={`${
                activeTab !== "overview" && activeTab !== "overview"
                  ? "hidden"
                  : ""
              }`}
            >
              <div className="mt-4 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Channels you watch
                    </h4>
                    <div
                      className="relative ml-2"
                      onMouseEnter={() => setShowContentTooltip(true)}
                      onMouseLeave={() => setShowContentTooltip(false)}
                    >
                      <Info
                        size={18}
                        className="text-gray-500 cursor-pointer"
                      />
                      {showContentTooltip && (
                        <>
                          <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2">
                            <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                              <p className="text-sm">
                                Number of views per channel.
                              </p>
                            </div>
                          </div>
                          <div className="absolute z-10 top-[calc(100%+0.25rem)] left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <label className="text-sm text-gray-700">
                      Last {imContentDays} day{imContentDays > 1 && "s"}:
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={getMaxSpanDays(data.watch)}
                      value={imContentDays}
                      onChange={(e) => {
                        const v = +e.currentTarget.value;
                        setImContentDays(v);
                        debouncedSet(setContentDays, v);
                      }}
                      className="w-32 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <label className="text-sm text-gray-700 ml-6">
                      Entries: {imPieEntries}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={contentPieData.length}
                      value={imPieEntries}
                      onChange={(e) => {
                        const v = +e.currentTarget.value;
                        setImPieEntries(v);
                        debouncedSet(setPieEntries, v);
                      }}
                      className="w-32 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="w-full md:w-1/2 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={limitedPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          nameKey="key"
                          dataKey="value"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          paddingAngle={2}
                        >
                          {limitedPieData.map((entry, idx) => (
                            <Cell
                              key={idx}
                              fill={COLORS[idx % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={
                            <CustomTooltipPie
                              total={limitedPieData.reduce(
                                (a, c) => a + c.value,
                                0
                              )}
                            />
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="grid grid-cols-2 gap-3">
                      {displayLegendEntries.map((entry, idx) => (
                        <div
                          key={idx}
                          className="flex items-center p-2 rounded-lg bg-gray-50"
                        >
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          />
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {entry.key}
                            </p>
                            <p className="text-xs text-gray-500">
                              {entry.value} views
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {shouldShowToggle && (
                      <button
                        onClick={() =>
                          setShowAllLegendEntries(!showAllLegendEntries)
                        }
                        className="mt-4 flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 transition-colors"
                      >
                        {showAllLegendEntries ? (
                          <>
                            <ChevronUp size={16} className="mr-1" /> View less
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} className="mr-1" /> View more
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    Over the last {contentDays} day{contentDays > 1 && "s"}, you
                    watched content from{" "}
                    <strong>{limitedPieData.length}</strong> different channels.
                  </p>
                  {limitedPieData.length > 0 && (
                    <p>
                      Your top channel was{" "}
                      <strong>{limitedPieData[0].key}</strong> with{" "}
                      <strong>{limitedPieData[0].value}</strong> views (
                      {(
                        (limitedPieData[0].value /
                          limitedPieData.reduce((a, c) => a + c.value, 0)) *
                        100
                      ).toFixed(1)}
                      % of total views).
                    </p>
                  )}
                  {limitedPieData.length > 1 && (
                    <p>
                      Your second most watched channel was{" "}
                      <strong>{limitedPieData[1].key}</strong> with{" "}
                      <strong>{limitedPieData[1].value}</strong> views.
                    </p>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Feed Mix */}
            <motion.section
              variants={itemVariants}
              className={`${
                activeTab !== "overview" && activeTab !== "overview"
                  ? "hidden"
                  : ""
              }`}
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Ads vs videos
                    </h4>
                    <div
                      className="relative ml-2 cursor-pointer"
                      onMouseEnter={() => setShowFeedTooltip(true)}
                      onMouseLeave={() => setShowFeedTooltip(false)}
                    >
                      <Info size={18} className="text-gray-500" />
                      {showFeedTooltip && (
                        <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2">
                          <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm">
                            Shows, for each hour (0–23), the share of videos vs
                            ads you watched.
                          </div>
                          <div className="absolute -top-1 left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="text-sm text-gray-700 flex items-center">
                    Last <strong className="mx-1">{imViewDays}</strong> day
                    {imViewDays > 1 && "s"}:
                    <input
                      type="range"
                      min="1"
                      max={getMaxSpanDays(data.watch)}
                      value={imViewDays}
                      onChange={(e) => {
                        const v = +e.currentTarget.value;
                        setImViewDays(v);
                        debouncedSet(setViewDays, v);
                      }}
                      className="w-32 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </label>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={feedHourly}
                    margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      label={{
                        value: "Hour (0–23)",
                        position: "insideBottom",
                        dy: 10,
                      }}
                    />
                    <YAxis
                      domain={[0, 1]}
                      tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    />
                    <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
                    <Legend verticalAlign="top" align="center" />
                    <Bar
                      dataKey="videosRatio"
                      stackId="a"
                      name="Videos"
                      barSize={20}
                      fill="#3b82f6"
                    />
                    <Bar
                      dataKey="adsRatio"
                      stackId="a"
                      name="Ads"
                      barSize={20}
                      fill="#10b981"
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    Over the last {viewDays} day{viewDays > 1 && "s"}, about{" "}
                    {feedStats.postsPercent}% videos and {feedStats.adsPercent}%
                    ads.
                  </p>
                  <p>
                    Ads are viewed most at <strong>{feedStats.highestAdHour}:00</strong> (
                    {feedStats.highestAdPercent}%).
                  </p>
                  <p>
                    Videos are viewed most at{" "}
                    <strong>{feedStats.highestPostHour}:00</strong> (
                    {feedStats.highestPostPercent}%).
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="mt-6 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Header Section */}
                <div className="px-8 py-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-3xl font-bold text-black ">
                        Top Videos
                      </h4>
                    </div>

                    {videoCounts.length > 0 && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 ">
                        <label className="flex items-center space-x-3 text-black">
                          <span className="text-sm font-medium">Show Top</span>
                          <div className=" py-1 rounded-lg">
                            <strong className="text-lg">{topN}</strong>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max={videoCounts.length}
                            value={topN}
                            onChange={(e) => setTopN(+e.currentTarget.value)}
                            className="w-32 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                            // style={{
                            //   background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                            //     (topN / videoCounts.length) * 100
                            //   }%, rgba(255,255,255,0.3) ${
                            //     (topN / videoCounts.length) * 100
                            //   }%, rgba(255,255,255,0.3) 100%)`,
                            // }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8">
                  {videoCounts.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <Play className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-xl text-gray-500 font-medium">
                        No videos watched more than 10 times
                      </p>
                      <p className="text-gray-400 mt-2">
                        Start watching to see your top videos here
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
                                  <Play className="w-4 h-4" />
                                  <span>Title</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <ExternalLink className="w-4 h-4" />
                                  <span>Video URL</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <Eye className="w-4 h-4" />
                                  <span>Times Watched</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4" />
                                  <span>Channel</span>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {videoCounts.slice(0, topN).map((video, idx) => (
                              <tr
                                key={idx}
                                className={`${getRowBgColor(
                                  idx
                                )} transition-all duration-200 hover:shadow-md`}
                              >
                                {/* Rank Column */}
                                <td className="px-6 py-5">
                                  <div className="flex items-center justify-center">
                                    {getRankIcon(idx)}
                                  </div>
                                </td>

                                {/* Title Column */}
                                <td className="px-2 py-5">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <Play className="w-5 h-5 text-indigo-600" />
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900 leading-5">
                                        {video.title}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* URL Column */}
                                <td className="px-3 py-5">
                                  <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all duration-200 font-mono text-sm group"
                                    title={video.url}
                                  >
                                    <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span>{truncateUrl(video.url)}</span>
                                  </a>
                                </td>

                                {/* Watch Count Column */}
                                <td className="px-3 py-5">
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold ${getWatchBadgeColor(
                                        video.count
                                      )}`}
                                    >
                                      <Eye className="w-4 h-4" />
                                      <span>{video.count}</span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                        style={{
                                          width: `${
                                            (video.count /
                                              Math.max(
                                                ...videoCounts.map(
                                                  (v) => v.count
                                                )
                                              )) *
                                            100
                                          }%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </td>

                                {/* Channel Column */}
                                <td className="px-3 py-5">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                      <Users className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {video.channel}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  {videoCounts.length > 0 ? (
                    <>
                      <p>
                        You have <strong>{videoCounts.length}</strong> videos
                        that you've watched 10 or more times.
                      </p>
                      <p>
                        Your most rewatched video is{" "}
                        <strong>"{videoCounts[0].title}"</strong> with{" "}
                        <strong>{videoCounts[0].count}</strong> views from
                        channel <strong>{videoCounts[0].channel}</strong>.
                      </p>
                      {videoCounts.length > 1 && (
                        <p>
                          The total watch count for your top{" "}
                          {Math.min(topN, videoCounts.length)} videos is{" "}
                          <strong>
                            {videoCounts
                              .slice(0, topN)
                              .reduce((sum, video) => sum + video.count, 0)}
                          </strong>{" "}
                          views.
                        </p>
                      )}
                    </>
                  ) : (
                    <p>
                      You don't have any videos that you've watched 10 or more
                      times in your current data download package.
                    </p>
                  )}
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}

        {activeTab === "rawdata" && (
          <div className="space-y-6 mt-8">
            {data.watch.length > 0 ? (
              data.watch.map((item, index) => {
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
                      {/* Header Section */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                            <Video className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-800">
                              Video {index + 1}
                            </p>
                            <p className="text-sm text-gray-500 font-medium">
                              Watch Record
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Title */}
                      <div className="group md:col-span-2">
                        <div className="flex items-start mb-4 space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-200">
                          <div className="p-2 bg-white rounded-lg shadow-sm mt-1">
                            <Info className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">
                              Title
                            </p>
                            <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                              {item.title || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Content Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Timestamp */}
                        <div className="group">
                          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-200">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">
                                Timestamp
                              </p>
                              <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                                {displayTime}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Channel Name */}
                        <div className="group">
                          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-200">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
                                Channel
                              </p>
                              <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                                {item.subtitlesName || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Video URL */}
                        <div className="group">
                          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-all duration-200">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <ExternalLink className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">
                                Video URL
                              </p>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-indigo-600 text-sm hover:text-indigo-800 transition-colors duration-200 truncate block hover:underline"
                                title={item.url}
                              >
                                {item.url || "N/A"}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Channel URL */}
                        <div className="group">
                          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                                Channel URL
                              </p>
                              <a
                                href={item.channelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-indigo-600 text-sm hover:text-indigo-800 transition-colors duration-200 truncate block hover:underline"
                                title={item.channelUrl}
                              >
                                {item.channelUrl || "N/A"}
                              </a>
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
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No watch history available.</p>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "transparent" && <WatchSection data={data} />}
      </div>
    </main>
  );
};

const SearchHistoryCharts = ({ report, onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchDays, setSearchDays] = useState(1);
  const [imSearchDays, setImSearchDays] = useState(1);
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

  // On mount, initialize slider
  useEffect(() => {
    if (!report) return;
    const maxS = Math.min(90, getMaxSpanDays(report.search));
    setSearchDays(maxS);
    setImSearchDays(maxS);
  }, [report]);

  useEffect(() => {
    setImSearchDays(searchDays);
  }, [searchDays]);

  // Compute heatmap data (only this uses the slider)
  const heatmapSearches = useMemo(
    () => generateHeatmapGrid(searchDays, report.search),
    [searchDays, report.search]
  );

  // Use entire dataset for everything else (not filtered by slider)
  const allSearchData = report.search;

  // WordCloud terms: full queries (strings, duplicates allowed) - using all data
  const queryTerms = useMemo(
    () => allSearchData.map((item) => item.title),
    [allSearchData]
  );

  // WordCloud terms: individual words (filtered, excluding numbers) - using all data
  const wordTerms = useMemo(() => {
    const allWords = [];
    allSearchData.forEach(({ title }) => {
      const words = (title.match(/\b\w+\b/g) || []).map((w) => w.toLowerCase());
      words.forEach((w) => {
        // Filter out stopwords and numbers
        if (!STOPWORDS.has(w) && !/^\d+$/.test(w)) {
          allWords.push(w);
        }
      });
    });
    return allWords;
  }, [allSearchData, STOPWORDS]);

  const activityStats = useMemo(() => {
    if (!allSearchData.length)
      return {
        peakHour: "00",
        maxViews: 0,
        mostActiveDay: "Monday",
        dayViews: 0,
        totalQueries: 0,
        avgWordsPerSearch: 0,
      };

    const hourCounts = {};
    allSearchData.forEach((item) => {
      const hour = new Date(item.time).getHours().toString().padStart(2, "0");
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    const maxViews = hourCounts[peakHour] || 0;

    const dayCounts = {};
    allSearchData.forEach((item) => {
      const day = DAYS[new Date(item.time).getDay()];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    const dayViews = dayCounts[mostActiveDay] || 0;

    // Calculate average words per search using all data
    const totalWords = allSearchData.reduce((acc, item) => {
      const wordCount = (item.title.match(/\b\w+\b/g) || []).length;
      return acc + wordCount;
    }, 0);
    const avgWordsPerSearch =
      allSearchData.length > 0
        ? Math.round((totalWords / allSearchData.length) * 10) / 10
        : 0;

    return {
      peakHour,
      maxViews,
      mostActiveDay,
      dayViews,
      totalQueries: allSearchData.length,
      avgWordsPerSearch,
    };
  }, [allSearchData]);

  // Raw data: entire dataset for Raw Data tab
  const rawDataList = allSearchData;

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
            {/* Stats Cards */}
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

            {/* Heatmap */}
            <motion.section variants={itemVariants}>
              <div className="mt-4 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      When do you search?
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
                              Number of searches by hour & day over selected period.
                            </div>
                          </div>
                          <div className="absolute z-10 top-[calc(100%+0.25rem)] left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                        </>
                      )}
                    </div>
                  </div>
                  <label className="text-sm text-gray-700 flex items-center">
                    Last <strong className="mx-1">{imSearchDays}</strong> day
                    {imSearchDays > 1 && "s"}:
                    <input
                      type="range"
                      min="1"
                      max={getMaxSpanDays(report.search)}
                      value={imSearchDays}
                      onChange={(e) => {
                        const v = +e.currentTarget.value;
                        setImSearchDays(v);
                        debounce((val) => setSearchDays(val), 100)(v);
                      }}
                      className="w-32 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </label>
                </div>
                <HeatmapSVG data={heatmapSearches} />
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    Over the last {searchDays} day{searchDays > 1 && "s"}, you
                    performed{" "}
                    <strong>
                      {filterByDays(report.search, searchDays).length}
                    </strong>{" "}
                    searches.
                  </p>
                  {report.search.length > 0 && (
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

            {/* Word Clouds */}
            <motion.section variants={itemVariants}>
              <div className="grid grid-cols-1 gap-6">
                {/* Full-Query Cloud */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">
                    What do you search? Top search queries (all time)
                  </h4>
                  {queryTerms.length ? (
                    <Suspense fallback={<p>Loading...</p>}>
                      <SearchWordCloud terms={queryTerms} />
                    </Suspense>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No searches available.
                    </p>
                  )}
                  <div
                    className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      lineHeight: "1.6",
                    }}
                  >
                    <p>
                      You have searched for{" "}
                      <strong>{new Set(queryTerms).size}</strong> unique queries
                      in total.
                    </p>
                    {queryTerms.length > 0 && (
                      <p>
                        Your average search query contains{" "}
                        <strong>{activityStats.avgWordsPerSearch}</strong>{" "}
                        words.
                      </p>
                    )}
                    <p>
                      Total search activity:{" "}
                      <strong>{activityStats.totalQueries}</strong> searches
                      across all time periods.
                    </p>
                  </div>
                </div>
                {/* Individual-Words Cloud */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">
                    What do you search? Top search words (all time)
                  </h4>
                  {wordTerms.length ? (
                    <Suspense fallback={<p>Loading...</p>}>
                      <SearchWordCloud terms={wordTerms} />
                    </Suspense>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No words to display.
                    </p>
                  )}
                  <div
                    className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      lineHeight: "1.6",
                    }}
                  >
                    <p>
                      After filtering out common stop words, you used{" "}
                      <strong>{new Set(wordTerms).size}</strong> unique search
                      terms.
                    </p>
                    <p>
                      This analysis excludes common stopwords and numbers to
                      highlight your main search interests and topics.
                    </p>
                  </div>
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
                          <Video className="w-6 h-6 text-indigo-600" />
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
                          {item.title}
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
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No search history available.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "transparent" && <SearchSection data={rawDataList} />}
      </div>
    </main>
  );
};

const CommentsCharts = ({ report, onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pieDays, setPieDays] = useState(1);
  const [imPieDays, setImPieDays] = useState(1);
  const [channelEntries, setChannelEntries] = useState(5);
  const [imChannelEntries, setImChannelEntries] = useState(5);
  const [videoTopN, setVideoTopN] = useState(5);
  const [imVideoTopN, setImVideoTopN] = useState(5);

  const [showPieTooltip, setShowPieTooltip] = useState(false);

  // On mount, initialize sliders based on data
  useEffect(() => {
    if (!report || !report.comments) return;
    const maxDays = Math.min(365, getMaxSpanDays(report.comments));
    setPieDays(maxDays);
    setImPieDays(maxDays);

    const uniqueChannels = new Set(report.comments.map((c) => c.channelId));
    setChannelEntries(Math.min(5, uniqueChannels.size));
    setImChannelEntries(Math.min(5, uniqueChannels.size));

    const uniqueVideos = new Set(report.comments.map((c) => c.videoId));
    setVideoTopN(Math.min(5, uniqueVideos.size));
    setImVideoTopN(Math.min(5, uniqueVideos.size));
  }, [report]);

  useEffect(() => {
    setImPieDays(pieDays);
  }, [pieDays]);
  useEffect(() => {
    setImChannelEntries(channelEntries);
  }, [channelEntries]);
  useEffect(() => {
    setImVideoTopN(videoTopN);
  }, [videoTopN]);

  const debouncedSet = useCallback(
    debounce((setter, value) => {
      setter(value);
    }, 100),
    []
  );

  // Only filter for pie chart
  const filteredCommentsPie = useMemo(() => {
    if (!report.comments) return [];
    return filterByDays(report.comments, pieDays);
  }, [report.comments, pieDays]);

  // Aggregate for Pie: comments per channel (using filteredCommentsPie)
  const channelPieData = useMemo(() => {
    return aggregateBy(filteredCommentsPie, (c) => c.channelId).map(
      (entry) => ({
        id: entry.key,
        url: `https://www.youtube.com/channel/${entry.key}`,
        value: entry.value,
      })
    );
  }, [filteredCommentsPie]);

  const limitedChannelPieData = useMemo(
    () => channelPieData.slice(0, channelEntries),
    [channelPieData, channelEntries]
  );

  // Use all-year data (no slider) for cards, top videos, monthly, raw
  const allComments = report.comments || [];

  // Video counts: comments per video (full year)
  const videoCounts = useMemo(() => {
    const map = {};
    allComments.forEach((c) => {
      const key = c.videoId;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([vid, count]) => ({ videoId: vid, count }))
      .sort((a, b) => b.count - a.count);
  }, [allComments]);

  // Monthly aggregation: last year by month (full year)
  const monthlyData = useMemo(() => {
    const now = new Date();
    const monthsArr = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthsArr.push({ key, count: 0 });
    }
    const monthIndex = {};
    monthsArr.forEach((m, idx) => {
      monthIndex[m.key] = idx;
    });
    allComments.forEach((c) => {
      const d = new Date(c.time);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (key in monthIndex) {
        monthsArr[monthIndex[key]].count += 1;
      }
    });
    return monthsArr;
  }, [allComments]);

  // Distribution: replies vs direct (full year)
  const distributionData = useMemo(() => {
    const direct = allComments.filter((c) => !c.parentId).length;
    const replies = allComments.filter((c) => c.parentId).length;
    return [
      { key: "Direct Comments", value: direct },
      { key: "Replies", value: replies },
    ];
  }, [allComments]);

  // Total comments (full year)
  const totalComments = allComments.length;

  // Tooltip for pie chart: show both channel URL and ID
  const CustomTooltipComments = ({ active, payload, total }) => {
    if (active && payload?.length && total > 0) {
      const { id, key, value } = payload[0].payload;
      const pct = ((value / total) * 100).toFixed(1);
      return (
        <div className="bg-white shadow-lg rounded-lg p-4 text-sm border border-gray-200">
          <p className="font-bold text-gray-900 mb-1">Channel URL:</p>
          <a
            href={key}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline text-sm mb-2 block"
          >
            {key}
          </a>
          <p className="text-gray-900 mb-2">
            <span className="font-semibold">Channel ID:</span> {id}
          </p>
          <p className="text-gray-700">{`${value} comments (${pct}%)`}</p>
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
          <h2 className="text-3xl font-bold text-gray-800">Comments</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-indigo-100">
                        Total Comments
                      </h5>
                      <p className="text-3xl font-bold mt-2">{totalComments}</p>
                    </div>
                    <div className="bg-indigo-400 bg-opacity-30 p-2 rounded-lg">
                      <Users size={24} className="text-indigo-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-indigo-100">
                    Comments in the last year
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-emerald-100">
                        Replies vs Direct
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {distributionData.reduce((a, c) => a + c.value, 0) === 0
                          ? 0
                          : `${Math.round(
                              (distributionData[0].value /
                                (distributionData[0].value +
                                  distributionData[1].value)) *
                                100
                            )}%`}
                      </p>
                    </div>
                    <div className="bg-emerald-400 bg-opacity-30 p-2 rounded-lg">
                      <Users size={24} className="text-emerald-100" />
                    </div>
                  </div>
                  <p className="mt-4 text-emerald-100">
                    Percentage of direct comments
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Pie Chart: Comments per Channel */}
            {/* <motion.section
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <div className="mt-4 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Comments by Channel
                    </h4>
                    <div
                      className="relative ml-2"
                      onMouseEnter={() => setShowPieTooltip(true)}
                      onMouseLeave={() => setShowPieTooltip(false)}
                    >
                      <Info
                        size={18}
                        className="text-gray-500 cursor-pointer"
                      />
                      {showPieTooltip && (
                        <>
                          <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2">
                            <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm">
                              Distribution of comments across channels.
                            </div>
                          </div>
                          <div className="absolute z-10 top-[calc(100%+0.25rem)] left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <label className="text-sm text-gray-700">
                      Last {imPieDays} day
                      {imPieDays > 1 && "s"}:
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={getMaxSpanDays(allComments)}
                      value={imPieDays}
                      onChange={(e) => {
                        const v = +e.currentTarget.value;
                        setImPieDays(v);
                        debouncedSet(setPieDays, v);
                      }}
                      className="w-40"
                    />
                    <label className="text-sm text-gray-700">
                      Channels: {imChannelEntries}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={channelPieData.length}
                      value={imChannelEntries}
                      onChange={(e) => {
                        const v = +e.currentTarget.value;
                        setImChannelEntries(v);
                        debouncedSet(setChannelEntries, v);
                      }}
                      className="w-40"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="w-full md:w-1/2 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={limitedChannelPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          nameKey="key"
                          dataKey="value"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          paddingAngle={2}
                        >
                          {limitedChannelPieData.map((entry, idx) => (
                            <Cell
                              key={idx}
                              fill={COLORS[idx % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={
                            <CustomTooltipComments
                              total={limitedChannelPieData.reduce(
                                (a, c) => a + c.value,
                                0
                              )}
                            />
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="grid grid-cols-2 gap-3">
                      {limitedChannelPieData.map((entry, idx) => (
                        <div
                          key={idx}
                          className="flex items-center p-2 rounded-lg bg-gray-50"
                        >
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          />
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {entry.key}
                            </p>
                            <p className="text-xs text-gray-500">
                              {entry.value} comments
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section> */}

            {/* Top Videos Table */}
            <motion.section
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <div className="mt-6 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-8 py-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-3xl font-bold text-black ">
                        Top Videos Commented
                      </h4>
                    </div>
                    {videoCounts.length > 0 && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 ">
                        <label className="flex items-center space-x-3 text-black">
                          <span className="text-sm font-medium">Show Top</span>
                          <div className=" py-1 rounded-lg">
                            <strong className="text-lg">{videoTopN}</strong>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max={videoCounts.length}
                            value={imVideoTopN}
                            onChange={(e) => {
                              const v = +e.currentTarget.value;
                              setImVideoTopN(v);
                              debouncedSet(setVideoTopN, v);
                            }}
                            className="w-32 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                            // style={{
                            //   background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                            //     (videoTopN / videoCounts.length) * 100
                            //   }%, rgba(255,255,255,0.3) ${
                            //     (videoTopN / videoCounts.length) * 100
                            //   }%, rgba(255,255,255,0.3) 100%)`,
                            // }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8">
                  {videoCounts.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <Play className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-xl text-gray-500 font-medium">
                        No comments to display
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
                                  <Play className="w-4 h-4" />
                                  <span>Video URL</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <Eye className="w-4 h-4" />
                                  <span>Comments</span>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {videoCounts
                              .slice(0, videoTopN)
                              .map((video, idx) => {
                                const videoURL = `https://www.youtube.com/watch?v=${video.videoId}`;

                                const truncateUrl = (url) => {
                                  if (url.length > 35) {
                                    return url.substring(0, 35) + "...";
                                  }
                                  return url;
                                };
                                const getRowBgColor = (index) => {
                                  if (index === 0)
                                    return "bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-yellow-400";
                                  if (index === 1)
                                    return "bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-l-gray-400";
                                  if (index === 2)
                                    return "bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-400";
                                  return "bg-white hover:bg-gray-50";
                                };
                                const getRankIcon = (index) => {
                                  if (index === 0)
                                    return (
                                      <Crown className="w-5 h-5 text-yellow-500" />
                                    );
                                  if (index === 1)
                                    return (
                                      <Medal className="w-5 h-5 text-gray-500" />
                                    );
                                  if (index === 2)
                                    return (
                                      <Award className="w-5 h-5 text-orange-500" />
                                    );
                                  return (
                                    <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">
                                      #{index + 1}
                                    </span>
                                  );
                                };
                                const getBadgeColor = (count) => {
                                  if (count >= 40)
                                    return "bg-red-50 text-red-700 border border-red-200";
                                  if (count >= 30)
                                    return "bg-orange-50 text-orange-700 border border-orange-200";
                                  if (count >= 20)
                                    return "bg-yellow-50 text-yellow-700 border border-yellow-200";
                                  return "bg-blue-50 text-blue-700 border border-blue-200";
                                };
                                return (
                                  <tr
                                    key={idx}
                                    className={`${getRowBgColor(
                                      idx
                                    )} transition-all duration-200 hover:shadow-md`}
                                  >
                                    <td className="px-6 py-5">
                                      <div className="flex items-center justify-center">
                                        {getRankIcon(idx)}
                                      </div>
                                    </td>
                                    <td className="px-3 py-5">
                                      <a
                                        href={videoURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all duration-200 font-mono text-sm group"
                                        title={videoURL}
                                      >
                                        <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span>{truncateUrl(videoURL)}</span>
                                      </a>
                                    </td>
                                    <td className="px-3 py-5">
                                      <div className="flex items-center space-x-3">
                                        <div
                                          className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold ${getBadgeColor(
                                            video.count
                                          )}`}
                                        >
                                          <Eye className="w-4 h-4" />
                                          <span>{video.count}</span>
                                        </div>
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                            style={{
                                              width: `${
                                                (video.count /
                                                  Math.max(
                                                    ...videoCounts.map(
                                                      (v) => v.count
                                                    )
                                                  )) *
                                                100
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
                  className="mb-4 mx-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  {videoCounts.length > 0 ? (
                    <>
                      <p>
                        You have commented on{" "}
                        <strong>{videoCounts.length}</strong> different videos.
                      </p>
                      <p>
                        Your most commented video received{" "}
                        <strong>{videoCounts[0].count}</strong> of your
                        comments.
                      </p>
                      <p>
                        The top {Math.min(videoTopN, videoCounts.length)} videos
                        account for{" "}
                        <strong>
                          {videoCounts
                            .slice(0, videoTopN)
                            .reduce((sum, video) => sum + video.count, 0)}
                        </strong>{" "}
                        total comments.
                      </p>
                    </>
                  ) : (
                    <p>No comment data available to analyze.</p>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Comments Over Time */}
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
              <div className="mt-6 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-3xl shadow-2xl border border-slate-200/50 backdrop-blur-sm">
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-xl"></div>

                <div className="relative p-8">
                  {/* Enhanced header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                        Comments Over Time
                      </h4>
                      <p className="text-slate-500 font-medium">
                        Monthly Comments
                      </p>
                    </div>
                  </div>

                  {/* Enhanced chart container */}
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-inner border border-slate-100/50">
                    {/* Chart background grid effect */}
                    <div className="absolute inset-0 opacity-30 pointer-events-none">
                      <div className="w-full h-full bg-gradient-to-t from-slate-50/50 to-transparent rounded-2xl"></div>
                    </div>

                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 30, right: 40, bottom: 30, left: 40 }}
                        barCategoryGap="25%"
                      >
                        <defs>
                          <linearGradient
                            id="barGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#3b82f6"
                              stopOpacity={1}
                            />
                            <stop
                              offset="50%"
                              stopColor="#1d4ed8"
                              stopOpacity={0.9}
                            />
                            <stop
                              offset="100%"
                              stopColor="#1e40af"
                              stopOpacity={0.8}
                            />
                          </linearGradient>
                          <filter id="dropShadow">
                            <feDropShadow
                              dx="0"
                              dy="4"
                              stdDeviation="3"
                              floodColor="#3b82f6"
                              floodOpacity="0.2"
                            />
                          </filter>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="2 4"
                          stroke="#e2e8f0"
                          strokeOpacity={0.6}
                          horizontal={true}
                          vertical={false}
                        />

                        <XAxis
                          dataKey="key"
                          tickFormatter={(v) => v}
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#64748b",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                          dy={10}
                        />

                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#64748b",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                          dx={-10}
                        />

                        <Tooltip
                          cursor={{
                            fill: "rgba(59, 130, 246, 0.08)",
                            radius: 8,
                          }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-2xl">
                                  <p className="font-semibold text-slate-800 mb-2">
                                    {label}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                                    <span className="text-slate-600 font-medium">
                                      {payload[0].value} comments
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        <Bar
                          dataKey="count"
                          name="Comments"
                          fill="url(#barGradient)"
                          radius={[6, 6, 0, 0]}
                          filter="url(#dropShadow)"
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Subtle bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-b-2xl"></div>
                  </div>
                </div>
                <div
                  className="mb-4 mx-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    Over the past year, you posted{" "}
                    <strong>{totalComments}</strong> comments total.
                  </p>
                  {monthlyData.length > 0 && (
                    <>
                      <p>
                        Your most active commenting month was{" "}
                        <strong>
                          {
                            monthlyData.reduce((max, curr) =>
                              curr.count > max.count ? curr : max
                            ).key
                          }
                        </strong>{" "}
                        with{" "}
                        <strong>
                          {
                            monthlyData.reduce((max, curr) =>
                              curr.count > max.count ? curr : max
                            ).count
                          }
                        </strong>{" "}
                        comments.
                      </p>
                      <p>
                        You averaged{" "}
                        <strong>
                          {Math.round(
                            (totalComments /
                              monthlyData.filter((m) => m.count > 0).length) *
                              10
                          ) / 10 || 0}
                        </strong>{" "}
                        comments per active month.
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
            className="space-y-6 mt-8"
          >
            {allComments.length > 0 ? (
              allComments.map((item, index) => {
                const displayTime = item.timestampString;

                // Extract text from JSON string format with double quotes
                let commentText = item.text;
                try {
                  // Replace double quotes with single quotes first
                  const cleanedText = item.text.replace(/""/g, '"');
                  const parsed = JSON.parse(cleanedText);
                  commentText = parsed.text || item.text;
                } catch (e) {
                  // If parsing fails, try alternative parsing or use original text
                  try {
                    // Try to extract text between the double quotes manually
                    const match = item.text.match(/""text"":""(.+?)""/);
                    if (match && match[1]) {
                      commentText = match[1];
                    } else {
                      commentText = item.text;
                    }
                  } catch (e2) {
                    commentText = item.text;
                  }
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-gray-200 hover:border-gray-300"
                  >
                    <div className="p-6 space-y-4">
                      {/* Entry Number Header */}

                      <div className="flex items-center p-4 rounded-xl shadow-lg border-2 border-blue-200/50 relative overflow-hidden bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/80">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30 backdrop-blur-sm"></div>
                        <div className="relative flex items-center bg-gradient-to-r from-blue-50/60 via-purple-50/40 to-pink-50/60 backdrop-blur-sm space-x-3 pl-8 rounded-lg py-2 pr-4">
                          <div className="p-2 bg-gradient-to-r from-blue-100/60 to-purple-100/60 backdrop-blur-sm rounded-lg border border-blue-200/40 shadow-sm">
                            <MessageCircleMore className="w-6 h-6 text-blue-700" />
                          </div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
                            Comment #{index + 1}
                          </h3>
                        </div>
                      </div>

                      {/* Comment Text - Full Width */}
                      <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-200">
                        <div className="p-2 bg-white rounded-lg shadow-sm mt-1">
                          <Info className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">
                            Comment Text
                          </p>
                          <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                            {commentText}
                          </p>
                        </div>
                      </div>

                      {/* Two columns layout for remaining fields */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Comment ID */}
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-200">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Info className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">
                              Comment ID
                            </p>
                            <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                              {item.commentId}
                            </p>
                          </div>
                        </div>

                        {/* Channel ID */}
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-200">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">
                              Channel ID
                            </p>
                            <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                              {item.channelId}
                            </p>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-200">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
                              Timestamp
                            </p>
                            <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                              {displayTime}
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100 hover:border-yellow-200 transition-all duration-200">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <CircleDollarSign className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wider mb-1">
                              Price
                            </p>
                            <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                              {item.price}
                            </p>
                          </div>
                        </div>

                        {/* Parent Comment ID */}
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Info className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                              Parent Comment ID
                            </p>
                            <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                              {item.parentId || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Video ID */}
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-all duration-200">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Video className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">
                              Video ID
                            </p>
                            <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                              {item.videoId}
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
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No comments available.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "transparent" && <CommentsSection data={allComments} />}
      </div>
    </main>
  );
};

// Utility: parse comments CSV string into full objects with all fields
const parseCommentsCSV = (csvString, oneYearAgo) => {
  const lines = csvString.split("\n");
  const parsed = [];
  if (lines.length < 2) return parsed;

  // Extract header to know columns
  const header = lines[0].split(",");
  // Expected header: ["Comment ID", "Channel ID", "Comment Create Timestamp", "Price", "Parent Comment ID", "Video ID", "Comment Text"]
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Split exactly 6 commas, the 7th column may contain commas inside JSON
    let parts = [];
    let start = 0;
    let commaCount = 0;
    for (let j = 0; j < line.length; j++) {
      if (line[j] === "," && commaCount < 6) {
        parts.push(line.substring(start, j));
        start = j + 1;
        commaCount++;
      }
    }
    parts.push(line.substring(start));
    if (parts.length !== 7) continue;

    const [
      commentId,
      channelId,
      timestamp,
      price,
      parentId,
      videoId,
      textJson,
    ] = parts.map((p) => p.trim());
    const time = Date.parse(timestamp);
    if (isNaN(time) || time < oneYearAgo) continue;

    let text = "";
    try {
      const obj = JSON.parse(textJson);
      text = obj.text || "";
    } catch {
      text = textJson.replace(/^"{/, "{").replace(/}"$/, "}");
      // Fallback to raw string if JSON parse fails
    }

    parsed.push({
      commentId,
      channelId,
      timestampString: timestamp,
      time,
      price,
      parentId: parentId || "",
      videoId,
      text,
    });
  }
  return parsed;
};
function parseWatchLaterCSV(csvString) {
  const lines = csvString.split("\n");
  const parsed = [];
  if (lines.length < 2) return parsed;
  // Header: ["Video ID", "Playlist Video Creation Timestamp"]
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(",");
    if (parts.length < 2) continue;
    const videoId = parts[0];
    const ts = parts.slice(1).join(","); // in case timestamp contains commas
    const addedTime = Date.parse(ts);
    if (!isNaN(addedTime)) {
      parsed.push({ videoId, addedTime });
    }
  }
  return parsed;
}

function parseSubscriptionsCSV(csvString) {
  const lines = csvString.split("\n");
  const parsed = [];
  if (lines.length < 2) return parsed;
  // Header: ["Channel Id","Channel Url","Channel Title"]
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(",");
    if (parts.length < 3) continue;
    const channelId = parts[0];
    const channelUrl = parts[1];
    const channelTitle = parts.slice(2).join(",");
    parsed.push({ channelId, channelUrl, channelTitle });
  }
  return parsed;
}

const UploadYoutube = () => {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(true);
  const [report, setReport] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const toggleSidebar = () => {
    setOpenSidebarToggle((prev) => !prev);
  };

  // useEffect(() => {
  //   const generateReportData = async () => {
  //     const loadJson = async (path) => {
  //       try {
  //         const response = await fetch(encodeURI(path));
  //         if (!response.ok) return [];
  //         return await response.json();
  //       } catch {
  //         return [];
  //       }
  //     };

  //     const loadText = async (path) => {
  //       try {
  //         const response = await fetch(encodeURI(path));
  //         if (!response.ok) return "";
  //         return await response.text();
  //       } catch {
  //         return "";
  //       }
  //     };

  //     const base = "/Takeout/YouTube and YouTube Music";
  //     const rawWatchPath = `${base}/history/watch-history.json`;
  //     const rawSearchPath = `${base}/history/search-history.json`;
  //     const rawCommentsPath = `${base}/comments/comments.csv`;
  //     const rawWatchLaterPath = `${base}/playlists/Watch later-videos.csv`;
  //     const rawSubscriptionsPath = `${base}/subscriptions/subscriptions.csv`;

  //     const rawWatch = await loadJson(rawWatchPath);
  //     const rawSearch = await loadJson(rawSearchPath);
  //     const rawCommentsCsv = await loadText(rawCommentsPath);
  //     const rawWatchLaterCsv = await loadText(rawWatchLaterPath);
  //     const rawSubscriptionsCsv = await loadText(rawSubscriptionsPath);

  //     const processedWatchLater = parseWatchLaterCSV(rawWatchLaterCsv);
  //     const processedSubscriptions = parseSubscriptionsCSV(rawSubscriptionsCsv);

  //     const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

  //     const processedWatch = rawWatch
  //       .map((item) => {
  //         const time = Date.parse(item.time);
  //         const isAd =
  //           Array.isArray(item.details) &&
  //           item.details.some((d) => d.name.includes("Google Ads"));
  //         const rawTitle = item.title || "";
  //         const title = rawTitle.replace(/^Watched\s*/i, "").trim();
  //         const subtitlesName = (item.subtitles?.[0]?.name || "Unknown").trim();
  //         const url = item.titleUrl || "";
  //         const channelUrl = item.subtitles?.[0]?.url || "";
  //         return {
  //           time,
  //           type: isAd ? "ad" : "video",
  //           subtitlesName,
  //           title,
  //           url,
  //           channelUrl,
  //         };
  //       })
  //       .filter((item) => item.time >= oneYearAgo);

  //     const processedSearch = rawSearch
  //       .filter((item) => /^Searched for\s+/i.test(item.title))
  //       .map((item) => {
  //         const time = Date.parse(item.time);
  //         const title = item.title.replace(/^Searched for\s*/i, "").trim();
  //         return { time, title };
  //       })
  //       .filter((item) => item.time >= oneYearAgo);

  //     const processedComments = parseCommentsCSV(rawCommentsCsv, oneYearAgo);

  //     setReport({
  //       watch: processedWatch,
  //       search: processedSearch,
  //       comments: processedComments,
  //       watchLater: processedWatchLater,
  //       subscriptions: processedSubscriptions,
  //     });
  //     setLoading(false);
  //   };

  //   generateReportData();
  // }, []);

  const handleTitleClick = (title) => {
    setActiveCard(title);
  };

  const handleBack = () => {
    setActiveCard(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a ZIP file.");
      return;
    }
    setLoading(true);
    setReport(null);
    try {
      const zip = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const zipData = new JSZip();
          zipData.loadAsync(event.target.result).then(resolve).catch(reject);
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsArrayBuffer(file);
      });
      const reportData = await generateReportDataFromZip(zip);
      setReport(reportData);
    } catch (err) {
      console.error("Upload or processing failed:", err);
      alert("Upload or processing failed. Please check the file and console.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };
  const generateReportDataFromZip = async (zip) => {
    const loadJsonFromZip = async (z, filePath) => {
      try {
        const entry = z.file(filePath);
        if (!entry) return [];
        const text = await entry.async("string");
        return JSON.parse(text);
      } catch {
        return [];
      }
    };

    const loadTextFromZip = async (z, filePath) => {
      try {
        const entry = z.file(filePath);
        if (!entry) return "";
        return await entry.async("string");
      } catch {
        return "";
      }
    };

    const base = "Takeout/YouTube and YouTube Music";
    const rawWatchPath = `${base}/history/watch-history.json`;
    const rawSearchPath = `${base}/history/search-history.json`;
    const rawCommentsPath = `${base}/comments/comments.csv`;
    const rawWatchLaterPath = `${base}/playlists/Watch later-videos.csv`;
    const rawSubscriptionsPath = `${base}/subscriptions/subscriptions.csv`;

    const rawWatch = await loadJsonFromZip(zip, rawWatchPath);
    const rawSearch = await loadJsonFromZip(zip, rawSearchPath);
    const rawCommentsCsv = await loadTextFromZip(zip, rawCommentsPath);
    const rawWatchLaterCsv = await loadTextFromZip(zip, rawWatchLaterPath);
    const rawSubscriptionsCsv = await loadTextFromZip(
      zip,
      rawSubscriptionsPath
    );

    const processedWatchLater = parseWatchLaterCSV(rawWatchLaterCsv);
    const processedSubscriptions = parseSubscriptionsCSV(rawSubscriptionsCsv);

    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

    const processedWatch = (rawWatch || [])
      .map((item) => {
        const time = Date.parse(item.time);
        const isAd =
          Array.isArray(item.details) &&
          item.details.some((d) => d.name && d.name.includes("Google Ads"));
        const rawTitle = item.title || "";
        const title = rawTitle.replace(/^Watched\s*/i, "").trim();
        const subtitlesName = (item.subtitles?.[0]?.name || "Unknown").trim();
        const url = item.titleUrl || "";
        const channelUrl = item.subtitles?.[0]?.url || "";
        return {
          time,
          type: isAd ? "ad" : "video",
          subtitlesName,
          title,
          url,
          channelUrl,
        };
      })
      .filter((i) => Number.isFinite(i.time) && i.time >= oneYearAgo);

    const processedSearch = (rawSearch || [])
      .filter((item) => /^Searched for\s+/i.test(item.title || ""))
      .map((item) => {
        const time = Date.parse(item.time);
        const title = (item.title || "")
          .replace(/^Searched for\s*/i, "")
          .trim();
        return { time, title };
      })
      .filter((i) => Number.isFinite(i.time) && i.time >= oneYearAgo);

    const processedComments = parseCommentsCSV(rawCommentsCsv, oneYearAgo);

    return {
      watch: processedWatch,
      search: processedSearch,
      comments: processedComments,
      watchLater: processedWatchLater,
      subscriptions: processedSubscriptions,
    };
  };

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
              Upload Youtube Data
            </h2>

            <label
              htmlFor="youtube-upload"
              className="block mb-4 text-lg font-semibold text-gray-700 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg py-6 text-center hover:border-blue-500 transition-colors"
            >
              {file ? file.name : "Choose a .zip file to upload"}
              <input
                id="youtube-upload"
                type="file"
                accept=".zip"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
                className="hidden"
              />
            </label>
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 mb-8 rounded-lg text-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Submit"}
            </button>

            {loading ? (
              <div className="text-center text-lg text-gray-600">
                Loading data...
              </div>
            ) : report ? (
              activeCard === "Watch History" ? (
                <YoutubeBrowsingCharts report={report} onBack={handleBack} />
              ) : activeCard === "Search History" ? (
                <SearchHistoryCharts report={report} onBack={handleBack} />
              ) : activeCard === "Comments" ? (
                <CommentsCharts report={report} onBack={handleBack} />
              ) : activeCard === "Watch Later" ? (
                <WatchLaterCharts report={report} onBack={handleBack} />
              ) : activeCard === "Subscriptions" ? (
                <SubscriptionsCharts report={report} onBack={handleBack} />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 justify-center gap-8">
                  <DataCard
                      title="Watch History"
                      description="List of videos and advertisements you viewed on YouTube."
                      whyCollectedAnswer="To customize YouTube services to you, including providing recommendations, personalized content, and customized search results. More about this can be found <a 
                                                                                                                                                                                                              href='https://policies.google.com/privacy#whycollect' 
                                                                                                                                                                                                              class='text-blue-600 underline'
                                                                                                                                                                                                              target='_blank'
                                                                                                                                                                                                              rel='noopener noreferrer'
                                                                                                                                                                                                            > here.</a>"
                      sharedWithAnswer="Your raw data is not shared with anyone else and is visible only to you. But the interests infered from your usage could be shared to target advertisements."
                      howToControlAnswer="You can delete the watch history - <a href='https://www.youtube.com/feed/history' class='text-blue-600 underline'target='_blank'rel='noopener noreferrer'> here</a> and choose whether your watch history is on or paused - <a href='https://myactivity.google.com/product/youtube?hl=en&utm_medium=web&utm_source=youtube' class='text-blue-600 underline'target='_blank'rel='noopener noreferrer'> here</a>."
                      howLongStoredAnswer="Your watch history is typically retained for the entire time you use the platform, unless you choose to turn it off or delete it. More about this can be found <a 
                                                                                                                                                                                                              href='https://policies.google.com/privacy#inforetaining' 
                                                                                                                                                                                                              class='text-blue-600 underline'
                                                                                                                                                                                                              target='_blank'
                                                                                                                                                                                                              rel='noopener noreferrer'
                                                                                                                                                                                                            > here</a>"
                      onTitleClick={handleTitleClick}
                    />
                  <DataCard
                    title="Search History"
                    description="Record of all the queries/terms you've typed into the YouTube search."
                    whyCollectedAnswer="To understand which search terms are most frequently misspelled helps to improve spell-check features used across our services. More about this can be found <a 
                                                                                                                                                                                                              href='https://policies.google.com/privacy#whycollect' 
                                                                                                                                                                                                              class='text-blue-600 underline'
                                                                                                                                                                                                              target='_blank'
                                                                                                                                                                                                              rel='noopener noreferrer'
                                                                                                                                                                                                            > here.</a>"
                    sharedWithAnswer="Your raw data is not shared with anyone else and is visible only to you. But the interests infered from your usage could be shared to target advertisements."
                    howToControlAnswer="You can delete the search history - <a href='https://www.youtube.com/feed/history' class='text-blue-600 underline'target='_blank'rel='noopener noreferrer'> here</a> and choose whether your search history is on or paused - <a href='https://myactivity.google.com/product/youtube?hl=en&utm_medium=web&utm_source=youtube' class='text-blue-600 underline'target='_blank'rel='noopener noreferrer'> here</a>."
                    howLongStoredAnswer="Your search history is typically retained for the entire time you use the platform, unless you choose to turn it off or delete it. More about this can be found <a 
                                                                                                                                                                                                              href='https://policies.google.com/privacy#inforetaining' 
                                                                                                                                                                                                              class='text-blue-600 underline'
                                                                                                                                                                                                              target='_blank'
                                                                                                                                                                                                              rel='noopener noreferrer'
                                                                                                                                                                                                            > here</a>"
                    onTitleClick={handleTitleClick}
                  />
                  <DataCard
                    title="Comments"
                    description="Record of the comments you've posted on YouTube videos while signed in."
                    whyCollectedAnswer="To support community engagement, personalize your experience, and enforce YouTube’s Community Guidelines. More about this can be found <a 
                                                                                                                                                                                                              href='https://policies.google.com/privacy#whycollect' 
                                                                                                                                                                                                              class='text-blue-600 underline'
                                                                                                                                                                                                              target='_blank'
                                                                                                                                                                                                              rel='noopener noreferrer'
                                                                                                                                                                                                            > here.</a>"
                    sharedWithAnswer="Comments are publicly visible to others who view the video."
                    howToControlAnswer="You can delete the comments you made - <a href='https://myactivity.google.com/page?hl=en&utm_medium=web&utm_source=youtube&page=youtube_comments' class='text-blue-600 underline'target='_blank'rel='noopener noreferrer'> here</a>."
                    howLongStoredAnswer="Your comments are stored as long as your account exists, or until the videos are deleted, the content creator removes them, or you manually delete them."
                    onTitleClick={handleTitleClick}
                  />

                  <DataCard
                    title="Watch Later"
                    description="List of videos you've saved to your 'Watch Later' playlist on YouTube."
                    whyCollectedAnswer="To help you keep track of videos you intend to view later."
                    sharedWithAnswer="Your 'Watch Later' playlist is private by default and not shared with others unless you explicitly make it public."
                    howToControlAnswer="You can manage your 'Watch Later' list by visiting <a href='https://www.youtube.com/feed/playlists' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>this page</a>, where you can add or remove videos at any time."
                    howLongStoredAnswer="Videos remain in your 'Watch Later' list until you manually remove them or the video is taken down from YouTube. More about this can be found <a 
                      href='https://policies.google.com/privacy#inforetaining' 
                      class='text-blue-600 underline'
                      target='_blank'
                      rel='noopener noreferrer'
                    >here</a>"
                    onTitleClick={handleTitleClick}
                  />
                  <DataCard
                    title="Subscriptions"
                    description="List of YouTube channels you've subscribed to using your account."
                    whyCollectedAnswer="To help you keep track of channels you are currently subscribed to."
                    sharedWithAnswer="Your subscriptions are private by default, but you can choose to make them public in your privacy settings. Channel owners can see your subscription."
                    howToControlAnswer="You can unsubscribe to channels - <a href='https://www.youtube.com/feed/channels' class='text-blue-600 underline'target='_blank'rel='noopener noreferrer'> here</a>."
                    howLongStoredAnswer="Your subscriptions are retained for as long as your account exists or until you choose to unsubscribe from a channel. More about this can be found <a 
                          href='https://policies.google.com/privacy#inforetaining' 
                          class='text-blue-600 underline'
                          target='_blank'
                          rel='noopener noreferrer'
                        >here</a>"
                    onTitleClick={handleTitleClick}
                  />
                </div>
              )
            ) : (
              <div className="text-center ">Please Upload zip file.</div>
            )}
          </main>
        </div>
      </div>
    </Router>
  );
};

export default UploadYoutube;
