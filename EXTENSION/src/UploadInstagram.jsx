import React, { useState, useEffect, useMemo, memo } from "react";
import JSZip from "jszip";
import { BrowserRouter as Router } from "react-router-dom";
import MapPlotter from "./components/MapPlotter";
import {
  Eye,
  User,
  Clock,
  MapPin,
  Code,
  Info,
  ExternalLink,
  Users,
  PlayCircle,
  Smartphone,
  Monitor,
  Wifi,
  Signal,
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
import InstagramSearchHistory from "./InstagramSearchHistory";
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
import "./App_main.css";
import Sidebar from "./Sidebar";
import { HiMenuAlt2 } from "react-icons/hi";
import DataCard from "./components/DataCard";
import TransarentTab from "./TransparentTabBrowsing";
import LocationTab from "./TransparentTabLocation";
import OffPlatformActivity from "./OffPlatformActivity";
import Comments from "./Comments";

const jsDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const renderDayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getDayName = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return jsDays[date.getDay()];
};

const getHourString = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.getHours().toString().padStart(2, "0");
};

const reactionTypes = ["Like", "Love", "Haha", "Wow", "Sad", "Angry"];
const interactionColors = {
  Like: "#1f77b4",
  Love: "#d62728",
  Haha: "#2ca02c",
  Wow: "#ff7f0e",
  Sad: "#9467bd",
  Angry: "#8c564b",
  comments: "#FF8C00",
};

const generateColors = () =>
  Array.from({ length: 20 }, (_, i) => `hsl(${(i * 25) % 360}, 80%, 65%)`);
const COLORS = generateColors();
const DEFAULT_VISIBLE = 6;

const filterByDateRange = (dataArray, days) => {
  const now = Date.now() / 1000;
  const cutoff = now - days * 86400;
  return dataArray.filter((entry) => entry.timestamp >= cutoff);
};

const getMaxDays = (dataArray) => {
  if (!dataArray || dataArray.length === 0) return 1;
  const now = Date.now() / 1000;
  const minTimestamp = Math.min(...dataArray.map((e) => e.timestamp));
  return Math.max(Math.floor((now - minTimestamp) / 86400), 1);
};

const CustomTooltipPie = ({ active, payload, total }) => {
  if (active && payload && payload.length && total > 0) {
    const { key, value } = payload[0].payload;
    const percent = ((value / total) * 100).toFixed(1);
    return (
      <div className="bg-white shadow-lg rounded-lg p-4 text-sm border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{key}</p>
        <p className="text-gray-700">{`${value} views (${percent}%)`}</p>
      </div>
    );
  }
  return null;
};

const CustomTooltipDaily = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const nextHour = `${Number(label) + 1}`;
    const organicViews = payload[0].payload.regularCount;
    const adsViews = payload[0].payload.adsCount;
    const organicPercent = payload[0].payload.regular;
    const adsPercent = payload[0].payload.ads;
    return (
      <div className="bg-white shadow-lg rounded-lg p-4 text-sm border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{`${label}:00 - ${nextHour}:00`}</p>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <p className="text-gray-700">{`Post: ${organicViews} views (${(
              organicPercent * 100
            ).toFixed(2)}%)`}</p>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <p className="text-gray-700">{`Ads: ${adsViews} views (${(
              adsPercent * 100
            ).toFixed(2)}%)`}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTooltipOff = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { key, value } = payload[0].payload;
    return (
      <div className="custom-tooltip bg-white p-3 rounded shadow-lg border border-gray-200 text-gray-800">
        <p>{`Events by ${key}: ${value}`}</p>
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
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
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

const HeatmapSVG = memo(({ heatmapData }) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const cellMap = {};
  heatmapData.forEach((cell) => {
    cellMap[`${cell.day}_${cell.hour}`] = cell.count;
  });

  const maxCount = Math.max(...heatmapData.map((c) => c.count), 0);
  const cellWidth = 40;
  const cellHeight = 40;
  const marginLeft = 80;
  const marginTop = 40;
  const svgWidth = marginLeft + hours.length * cellWidth;
  const svgHeight = marginTop + renderDayOrder.length * cellHeight + 40;

  const getColor = (count) => {
    if (maxCount === 0) return "#ffffd9";
    const ratio = count / maxCount;
    if (ratio === 0) return "#ffffd9";
    else if (ratio < 0.2) return "#edf8b1";
    else if (ratio < 0.4) return "#c7e9b4";
    else if (ratio < 0.6) return "#7fcdbb";
    else if (ratio < 0.8) return "#41b6c4";
    else if (ratio < 0.9) return "#1d91c0";
    else return "#225ea8";
  };

  const showTooltip = (day, hour, count, rowIdx, colIdx) => {
    setTooltip({
      visible: true,
      x: marginLeft + colIdx * cellWidth,
      y: marginTop + rowIdx * cellHeight,
      content: `Posts viewed ${hour}:00–${
        parseInt(hour) + 1
      }:00 on ${day}: ${count}`,
    });
  };
  const hideTooltip = () => setTooltip({ ...tooltip, visible: false });

  return (
    <div style={{ position: "relative" }}>
      <svg width={svgWidth} height={svgHeight}>
        {hours.map((hour, i) => (
          <text
            key={hour}
            x={marginLeft + i * cellWidth + cellWidth / 2}
            y={marginTop - 10}
            textAnchor="middle"
            fontSize="12"
            fill="#333"
            fontWeight="bold"
          >
            {hour}
          </text>
        ))}
        {renderDayOrder.map((day, i) => (
          <text
            key={day}
            x={marginLeft - 10}
            y={marginTop + i * cellHeight + cellHeight / 2 + 4}
            textAnchor="end"
            fontSize="12"
            fill="#333"
            fontWeight="bold"
          >
            {day}
          </text>
        ))}
        {renderDayOrder.map((day, rowIdx) =>
          hours.map((hour, colIdx) => {
            const count = cellMap[`${day}_${hour}`] || 0;
            return (
              <g key={`${day}_${hour}`}>
                <rect
                  x={marginLeft + colIdx * cellWidth}
                  y={marginTop + rowIdx * cellHeight}
                  width={cellWidth}
                  height={cellHeight}
                  fill={getColor(count)}
                  stroke="#fff"
                  onMouseEnter={() =>
                    showTooltip(day, hour, count, rowIdx, colIdx)
                  }
                  onMouseLeave={hideTooltip}
                />
                {count > 0 && (
                  <text
                    x={marginLeft + colIdx * cellWidth + cellWidth / 2}
                    y={marginTop + rowIdx * cellHeight + cellHeight / 2 + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fill="black"
                  >
                    {count}
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>
      {tooltip.visible && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + cellWidth + 5,
            top: tooltip.y - cellHeight / 2,
            backgroundColor: "rgba(0,0,0,0.75)",
            color: "#fff",
            padding: "6px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
});

const aggregateByAuthor = (dataArray) => {
  const map = {};
  dataArray.forEach((entry) => {
    const author = entry.author || "Unknown";
    map[author] = (map[author] || 0) + 1;
  });
  return Object.entries(map)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);
};

const aggregateInteractionsByAuthor = (data) => {
  const interactions = {};
  const init = { comments: 0, total: 0 };
  reactionTypes.forEach((r) => (init[r] = 0));
  (data.comments || []).forEach((e) => {
    const a = e.author || "Unknown";
    if (!interactions[a])
      interactions[a] = { author: a, ...JSON.parse(JSON.stringify(init)) };
    interactions[a].comments += 1;
    interactions[a].total += 1;
  });
  (data.reactions || []).forEach((e) => {
    const a = e.author || "Unknown";
    if (!interactions[a])
      interactions[a] = { author: a, ...JSON.parse(JSON.stringify(init)) };
    if (reactionTypes.includes(e.reaction)) {
      interactions[a][e.reaction] += 1;
      interactions[a].total += 1;
    }
  });
  return Object.values(interactions)
    .sort((a, b) => b.total - a.total)
    .slice(0, 20);
};

const BrowsingHistoryCard = ({ report, onBack }) => {
  const [activeTab, setActiveTab] = useState("concise");
  const [heatmapDays, setHeatmapDays] = useState(90);
  const [contentDays, setContentDays] = useState(90);
  const [interactionsDays, setInteractionsDays] = useState(90);
  const [adsDays, setAdsDays] = useState(90);
  const [engagementDays, setEngagementDays] = useState(90);
  const [interactionsLimit, setInteractionsLimit] = useState(5);
  const [adsLimit, setAdsLimit] = useState(5);

  const [heatmapData, setHeatmapData] = useState([]);
  const [contentPieData, setContentPieData] = useState([]);
  const [interactionsData, setInteractionsData] = useState([]);
  const [adsData, setAdsData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const videoData = report?.video_viewed || [];

  const [showHeatmapTooltip, setShowHeatmapTooltip] = useState(false);
  const [showContentTooltip, setShowContentTooltip] = useState(false);
  const [showInteractionsTooltip, setShowInteractionsTooltip] = useState(false);
  const [showAdsTooltip, setShowAdsTooltip] = useState(false);
  const [showFeedTooltip, setShowfeedPlatformTooltip] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);
  const [adsExpanded, setAdsExpanded] = useState(false);

  const heatmapStats = useMemo(() => {
    if (!heatmapData.length)
      return {
        mostViewedHour: null,
        mostViewedHourCount: 0,
        mostViewedDay: null,
        mostViewedDayCount: 0,
        totalViews: 0,
      };
    const hourCounts = {};
    const dayCounts = {};
    let totalViews = 0;
    heatmapData.forEach(({ day, hour, count }) => {
      totalViews += count;
      hourCounts[hour] = (hourCounts[hour] || 0) + count;
      dayCounts[day] = (dayCounts[day] || 0) + count;
    });
    const [mh, mhc] = Object.entries(hourCounts).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ["", 0]
    );
    const [md, mdc] = Object.entries(dayCounts).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ["", 0]
    );
    return {
      mostViewedHour: mh,
      mostViewedHourCount: mhc,
      mostViewedDay: md,
      mostViewedDayCount: mdc,
      totalViews,
    };
  }, [heatmapData]);

  const feedStats = useMemo(() => {
    if (!engagementData.length) {
      return {
        avgPostsRatio: 0,
        avgAdsRatio: 0,
        peakAdsHour: "00",
        peakAdsRatio: 0,
        peakPostsHour: "00",
        peakPostsRatio: 0,
      };
    }
    const totalHours = engagementData.length;
    const avgPostsRatio =
      engagementData.reduce((sum, d) => sum + d.regular, 0) / totalHours;
    const avgAdsRatio = 1 - avgPostsRatio;
    let peakAdsHour = engagementData[0].hour;
    let peakAdsRatio = engagementData[0].ads;
    let peakPostsHour = engagementData[0].hour;
    let peakPostsRatio = engagementData[0].regular;
    engagementData.forEach(({ hour, ads, regular }) => {
      if (ads > peakAdsRatio) {
        peakAdsRatio = ads;
        peakAdsHour = hour;
      }
      if (regular > peakPostsRatio) {
        peakPostsRatio = regular;
        peakPostsHour = hour;
      }
    });
    return {
      avgPostsRatio,
      avgAdsRatio,
      peakAdsHour,
      peakAdsRatio,
      peakPostsHour,
      peakPostsRatio,
    };
  }, [engagementData]);

  const contentStats = useMemo(() => {
    if (!contentPieData.length) {
      return {
        totalViews: 0,
        topCreator: null,
        topCreatorViews: 0,
        creatorCount: 0,
      };
    }
    const totalViews = contentPieData.reduce(
      (sum, item) => sum + item.value,
      0
    );
    const topCreator = contentPieData[0];
    return {
      totalViews,
      topCreator: topCreator?.key || null,
      topCreatorViews: topCreator?.value || 0,
      creatorCount: contentPieData.length,
    };
  }, [contentPieData]);

  const adsStats = useMemo(() => {
    if (!adsData.length) {
      return {
        totalAds: 0,
        topBrand: null,
        topBrandViews: 0,
        brandCount: 0,
      };
    }
    const totalAds = adsData.reduce((sum, item) => sum + item.value, 0);
    const topBrand = adsData[0];
    return {
      totalAds,
      topBrand: topBrand?.key || null,
      topBrandViews: topBrand?.value || 0,
      brandCount: adsData.length,
    };
  }, [adsData]);

  useEffect(() => {
    if (!report) return;
    const postsVideos = [
      ...(report.posts_viewed || []),
      ...(report.video_viewed || []),
    ];
    const maxHeat = getMaxDays(postsVideos);
    const maxComments = getMaxDays([
      ...(report.comments || []),
      ...(report.reactions || []),
    ]);
    const maxAds = getMaxDays(report.ads_viewed || []);
    const maxEng = Math.max(maxHeat, maxAds);

    setHeatmapDays(Math.min(90, maxHeat));
    setContentDays(Math.min(90, maxHeat));
    setInteractionsDays(Math.min(90, maxComments));
    setAdsDays(Math.min(90, maxAds));
    setEngagementDays(Math.min(90, maxEng));
  }, [report]);

  useEffect(() => {
    if (!report) return;
    const postsVideos = [
      ...(report.posts_viewed || []),
      ...(report.video_viewed || []),
    ];

    const filteredHeat = filterByDateRange(postsVideos, heatmapDays);
    const grid = [];
    const hours = Array.from({ length: 24 }, (_, i) =>
      i.toString().padStart(2, "0")
    );
    renderDayOrder.forEach((day) =>
      hours.forEach((hour) => grid.push({ day, hour, count: 0 }))
    );
    filteredHeat.forEach((e) => {
      const day = getDayName(e.timestamp);
      const hour = getHourString(e.timestamp);
      const idx = grid.findIndex((c) => c.day === day && c.hour === hour);
      if (idx !== -1) grid[idx].count++;
    });
    setHeatmapData(grid);

    const filteredContent = filterByDateRange(postsVideos, contentDays);
    setContentPieData(aggregateByAuthor(filteredContent));

    const filteredComments = filterByDateRange(
      report.comments || [],
      interactionsDays
    );
    const filteredReacts = filterByDateRange(
      report.reactions || [],
      interactionsDays
    );
    setInteractionsData(
      aggregateInteractionsByAuthor({
        comments: filteredComments,
        reactions: filteredReacts,
      })
    );

    const filteredAds = filterByDateRange(report.ads_viewed || [], adsDays);
    setAdsData(aggregateByAuthor(filteredAds));

    const filtPostEng = filterByDateRange(postsVideos, engagementDays);
    const filtAdsEng = filterByDateRange(
      report.ads_viewed || [],
      engagementDays
    );
    const hourly = [];
    for (let h = 0; h < 24; h++) {
      const hr = h.toString().padStart(2, "0");
      const regCnt = filtPostEng.filter(
        (e) => getHourString(e.timestamp) === hr
      ).length;
      const adsCnt = filtAdsEng.filter(
        (e) => getHourString(e.timestamp) === hr
      ).length;
      const total = regCnt + adsCnt;
      hourly.push({
        hour: hr,
        regular: total ? regCnt / total : 0,
        ads: total ? adsCnt / total : 0,
        regularCount: regCnt,
        adsCount: adsCnt,
      });
    }
    setEngagementData(hourly);
  }, [
    report,
    heatmapDays,
    contentDays,
    interactionsDays,
    adsDays,
    engagementDays,
  ]);

  const maxHeatmapDays = useMemo(() => {
    const postsVideos = [
      ...(report.posts_viewed || []),
      ...(report.video_viewed || []),
    ];
    return getMaxDays(postsVideos);
  }, [report]);

  const maxInteractionsDays = useMemo(() => {
    return getMaxDays([
      ...(report.comments || []),
      ...(report.reactions || []),
    ]);
  }, [report]);

  const maxAdsDays = useMemo(() => {
    return getMaxDays(report.ads_viewed || []);
  }, [report]);

  const maxEngagementDays = useMemo(() => {
    const postsVideos = [
      ...(report.posts_viewed || []),
      ...(report.video_viewed || []),
    ];
    const maxHeat = getMaxDays(postsVideos);
    const maxAds = getMaxDays(report.ads_viewed || []);
    return Math.max(maxHeat, maxAds);
  }, [report]);

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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            <motion.section
              variants={itemVariants}
              className={activeTab === "concise" ? "" : "hidden"}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-blue-100">
                        Posts
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {engagementData.reduce(
                          (acc, i) => acc + i.regularCount,
                          0
                        )}{" "}
                        views
                      </p>
                    </div>
                    <div className="bg-blue-400 bg-opacity-30 p-2 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0-01-2-2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-4 text-blue-100">
                    Content from your followed creators
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-green-100">
                        Ad Content
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {engagementData.reduce((acc, i) => acc + i.adsCount, 0)}{" "}
                        views
                      </p>
                    </div>
                    <div className="bg-green-400 bg-opacity-30 p-2 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 3.055A9 9 0 1020.945 13H11V3.055z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-4 text-green-100">
                    Advertisement content you've viewed
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-medium text-purple-100">
                        Peak Activity
                      </h5>
                      <p className="text-3xl font-bold mt-2">
                        {engagementData.length
                          ? engagementData.reduce(
                              (max, i) =>
                                i.regularCount + i.adsCount > max.value
                                  ? {
                                      hour: i.hour,
                                      value: i.regularCount + i.adsCount,
                                    }
                                  : max,
                              { hour: "00", value: 0 }
                            ).hour + ":00"
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-purple-400 bg-opacity-30 p-2 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-4 text-purple-100">Your most active hour</p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      When are you browsing?
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
                                This chart shows at which hours and days you
                                viewed content over the selected period.
                              </p>
                            </div>
                          </div>
                          <div className="absolute z-10 top-[calc(100%+0.25rem)] left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="heatmapRange"
                      className="text-sm text-gray-700"
                    >
                      Last {heatmapDays} day{heatmapDays > 1 && "s"}
                    </label>
                    <input
                      id="heatmapRange"
                      type="range"
                      min="1"
                      max={maxHeatmapDays}
                      step="1"
                      value={heatmapDays}
                      onChange={(e) => setHeatmapDays(parseInt(e.target.value))}
                      className="w-40 ml-2"
                    />
                  </div>
                </div>
                <HeatmapSVG heatmapData={heatmapData} />
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    Over the last {heatmapDays} day{heatmapDays > 1 && "s"}, you
                    viewed a total of <strong>{heatmapStats.totalViews}</strong>{" "}
                    posts.
                  </p>
                  <p>
                    You were most active around{" "}
                    <strong>{heatmapStats.mostViewedHour}:00</strong>, when you
                    made <strong>{heatmapStats.mostViewedHourCount}</strong>{" "}
                    views.
                  </p>
                  <p>
                    Your busiest day was{" "}
                    <strong>{heatmapStats.mostViewedDay}</strong> with{" "}
                    <strong>{heatmapStats.mostViewedDayCount}</strong> views.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Where do your views go?
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
                                Breaks down how many views went to posts vs.
                                videos during the selected period.
                              </p>
                            </div>
                          </div>
                          <div className="absolute z-10 top-[calc(100%+0.25rem)] left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="contentRange"
                      className="text-sm text-gray-700"
                    >
                      Last {contentDays} day{contentDays > 1 && "s"}
                    </label>
                    <input
                      id="contentRange"
                      type="range"
                      min="1"
                      max={maxHeatmapDays}
                      step="1"
                      value={contentDays}
                      onChange={(e) => setContentDays(parseInt(e.target.value))}
                      className="w-40 ml-2"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="w-full md:w-1/2 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contentPieData}
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
                          {contentPieData.map((entry, idx) => (
                            <Cell
                              key={idx}
                              fill={COLORS[idx % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={
                            <CustomTooltipPie
                              total={contentPieData.reduce(
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
                      {contentPieData
                        .slice(
                          0,
                          contentExpanded
                            ? contentPieData.length
                            : DEFAULT_VISIBLE
                        )
                        .map((entry, idx) => (
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
                    {contentPieData.length > DEFAULT_VISIBLE && (
                      <button
                        onClick={() => setContentExpanded(!contentExpanded)}
                        className="mt-2 text-blue-600 hover:underline text-sm"
                      >
                        {contentExpanded ? "View Less" : "View More"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Summary Section */}
                <div
                  className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
                >
                  <p>
                    Over the last {contentDays} day{contentDays > 1 && "s"}, you
                    viewed content from{" "}
                    <strong>{contentStats.creatorCount}</strong> different
                    creator{contentStats.creatorCount !== 1 && "s"}, with a
                    total of <strong>{contentStats.totalViews}</strong> views.
                  </p>
                  {contentStats.topCreator && (
                    <p>
                      Your most viewed creator was{" "}
                      <strong>{contentStats.topCreator}</strong> with{" "}
                      <strong>{contentStats.topCreatorViews}</strong> views,
                      accounting for{" "}
                      <strong>
                        {Math.round(
                          (contentStats.topCreatorViews /
                            contentStats.totalViews) *
                            100
                        )}
                        %
                      </strong>{" "}
                      of your total content consumption.
                    </p>
                  )}
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Your recent advertisements exposure
                    </h4>
                    <div
                      className="relative ml-2"
                      onMouseEnter={() => setShowAdsTooltip(true)}
                      onMouseLeave={() => setShowAdsTooltip(false)}
                    >
                      <Info
                        size={18}
                        className="text-gray-500 cursor-pointer"
                      />
                      {showAdsTooltip && (
                        <>
                          <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2">
                            <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                              <p className="text-sm">
                                This shows the top brands you've seen ads from
                                over the past {adsDays} day{adsDays > 1 && "s"}.
                              </p>
                            </div>
                          </div>
                          <div className="absolute z-10 top-[calc(100%+0.25rem)] left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="adsRange" className="text-sm text-gray-700">
                      Last {adsDays} day{adsDays > 1 && "s"}
                    </label>
                    <input
                      id="adsRange"
                      type="range"
                      min="1"
                      max={maxAdsDays}
                      step="1"
                      value={adsDays}
                      onChange={(e) => setAdsDays(parseInt(e.target.value))}
                      className="w-40 ml-2"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="adsLimitRange"
                    className="text-sm text-gray-700"
                  >
                    Top {adsLimit} brands
                  </label>
                  <input
                    id="adsLimitRange"
                    type="range"
                    min="1"
                    max={adsData.length}
                    step="1"
                    value={adsLimit}
                    onChange={(e) => setAdsLimit(parseInt(e.target.value))}
                    className="w-40 ml-2"
                  />
                </div>
                {adsData.length ? (
                  (() => {
                    const chartAds = adsData.slice(0, adsLimit);
                    const maxCollapsed = Math.min(DEFAULT_VISIBLE, adsLimit);
                    const listAds = adsExpanded
                      ? adsData.slice(0, adsLimit)
                      : adsData.slice(0, maxCollapsed);

                    return (
                      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <div className="w-full md:w-1/2 h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartAds}
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
                                {chartAds.map((_, idx) => (
                                  <Cell
                                    key={idx}
                                    fill={COLORS[(idx * 2) % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                content={
                                  <CustomTooltipPie
                                    total={chartAds.reduce(
                                      (sum, e) => sum + e.value,
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
                            {listAds.map((entry, idx) => (
                              <div
                                key={idx}
                                className="flex items-center p-2 rounded-lg bg-gray-50"
                              >
                                <div
                                  className="w-4 h-4 rounded-full mr-2"
                                  style={{
                                    backgroundColor:
                                      COLORS[(idx * 2) % COLORS.length],
                                  }}
                                />
                                <div className="overflow-hidden">
                                  <p className="text-sm font-medium text-gray-700 truncate">
                                    {entry.key}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {entry.value} impressions
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {adsLimit > DEFAULT_VISIBLE && (
                            <button
                              onClick={() => setAdsExpanded(!adsExpanded)}
                              className="mt-2 text-blue-600 hover:underline text-sm"
                            >
                              {adsExpanded ? "View Less" : "View More"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-gray-600">No ad data available.</p>
                )}

                {/* Ads Summary Section */}
                {adsData.length > 0 && (
                  <div
                    className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      lineHeight: "1.6",
                    }}
                  >
                    <p>
                      Over the last {adsDays} day{adsDays > 1 && "s"}, you were
                      exposed to ads from <strong>{adsStats.brandCount}</strong>{" "}
                      different brand{adsStats.brandCount !== 1 && "s"}, with a
                      total of <strong>{adsStats.totalAds}</strong> ad
                      impressions.
                    </p>
                    {adsStats.topBrand && (
                      <p>
                        The brand you saw most often was{" "}
                        <strong>{adsStats.topBrand}</strong> with{" "}
                        <strong>{adsStats.topBrandViews}</strong> impressions,
                        representing{" "}
                        <strong>
                          {Math.round(
                            (adsStats.topBrandViews / adsStats.totalAds) * 100
                          )}
                          %
                        </strong>{" "}
                        of your total ad exposure.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.section>
          </motion.div>
        )}

        {activeTab === "rawdata" && (
          <div className="space-y-6 mt-8">
            {videoData.length > 0 ? (
              videoData.map((item, index) => {
                const utcTime = new Date(item.timestamp * 1000).toUTCString();
                const isFirst = index === 0;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={
                      "bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-gray-200 hover:border-gray-300"
                    }
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <Eye className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              Entry {index + 1}
                            </p>
                            <p className="text-sm text-gray-500">
                              Viewing Record
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <User className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Author
                              </p>
                              <p className="font-medium text-gray-900">
                                {item.author || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Clock className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Timestamp
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                {utcTime}
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
                <p className="text-gray-500">
                  No video processing data available.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "transparent" && <TransarentTab report={report} />}
      </div>
    </main>
  );
};

const LocationHistoryCard = ({ report, onBack }) => {
  const [activeTab, setActiveTab] = useState("concise");
  const [sortOrder, setSortOrder] = useState("descending"); // "ascending" or "descending"

  const logins = report?.login_history || [];
  const extractDeviceFromUserAgent = (userAgent) => {
    if (!userAgent || userAgent === "Unknown Agent") return "Unknown Device";

    // Simple device detection logic
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("iPad")) return "iPad";
    if (userAgent.includes("Android")) return "Android Device";
    if (userAgent.includes("Windows")) return "Windows Device";
    if (userAgent.includes("Macintosh")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux Device";
    if (userAgent.includes("Chrome")) return "Chrome Browser";
    if (userAgent.includes("Firefox")) return "Firefox Browser";
    if (userAgent.includes("Safari")) return "Safari Browser";

    return "Unknown Device";
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const deviceCounts = {};
    const locationCounts = {};
    const userAgentCounts = {};

    logins.forEach((login) => {
      // Extract device from UserAgent (simplified approach)
      const userAgent = login.UserAgent || "Unknown Agent";
      const device = extractDeviceFromUserAgent(userAgent);
      const ip = login.IP || "Unknown Location";

      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      locationCounts[ip] = (locationCounts[ip] || 0) + 1;
      userAgentCounts[userAgent] = (userAgentCounts[userAgent] || 0) + 1;
    });

    const uniqueDevices = Object.keys(deviceCounts).length;
    const uniqueLocations = Object.keys(locationCounts).length;
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
      uniqueLocations,
      pieData,
      sortedDevices,
      frequentLocations,
      mostUsedDevice,
      mostFrequentLocation,
    };
  }, [logins, sortOrder]);

  // Helper function to extract device info from UserAgent

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
            Location History
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-lg font-medium text-amber-100">
                    Unique Locations
                  </h5>
                  <p className="text-3xl font-bold mt-2">
                    {stats.uniqueLocations}
                  </p>
                </div>
                <div className="bg-amber-400 bg-opacity-30 p-2 rounded-lg">
                  <MapPin size={24} className="text-amber-100" />
                </div>
              </div>
              <p className="mt-4 text-amber-100">
                Different IP locations accessed
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
                    No location history available.
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
                      You have accessed from a total of{" "}
                      <strong>{stats.uniqueLocations}</strong> different
                      locations.
                    </p>
                    <p>
                      Your most frequently accessed location is{" "}
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
                      Logins by Device Type
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
                          <Tooltip content={<CustomTooltip />} />
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
                        different device types for login.
                      </p>
                      <p>
                        Your most frequently used device type is{" "}
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
                          {stats.sortedDevices.length >= 3
                            ? (
                                (stats.sortedDevices
                                  .slice(0, 3)
                                  .reduce((sum, d) => sum + d.count, 0) /
                                  stats.totalLogins) *
                                100
                              ).toFixed(1)
                            : "100"}
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

        {activeTab === "transparent" && <LocationTab report={report} />}

        <motion.footer
          variants={itemVariants}
          className="mt-16 text-center text-gray-500 text-sm"
        >
          <p>Location data filtered from the uploaded login history file.</p>
        </motion.footer>
      </div>
    </main>
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
const BAR_HEIGHT = 40;
const EXTRA_PADDING = 200;

const UploadInstagram = () => {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(true);
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const toggleSidebar = () => {
    setOpenSidebarToggle((prev) => !prev);
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
    } catch (error) {
      console.error("Upload or processing failed:", error);
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
        if (!entry) return {};
        const text = await entry.async("string");
        return JSON.parse(text);
      } catch {
        return {};
      }
    };

    const getProcessedData = (data, key) => {
      const items = data?.[key] || [];
      return items.map((item) => {
        const sm = item.string_map_data || {};
        return {
          timestamp: sm.Time?.timestamp ?? null,
          author: sm.Author?.value ?? null,
        };
      });
    };

    const processOffMeta = (data) => {
      const off = data?.apps_and_websites_off_meta_activity || [];
      const byPlatform = {};
      off.forEach((p) => {
        if (p?.name)
          byPlatform[p.name] =
            (byPlatform[p.name] || 0) + (p.events || []).length;
      });
      const offPlatform = Object.entries(byPlatform)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([key, value]) => ({ key, value }));

      const byEvent = {};
      off.forEach((p) => {
        (p.events || []).forEach((e) => {
          if (e?.type && e.type !== "CUSTOM")
            byEvent[e.type] = (byEvent[e.type] || 0) + 1;
        });
      });
      const offEvents = Object.entries(byEvent)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([key, value]) => ({ key, value }));

      const offPlatformActivity =
        off
          .flatMap((site) =>
            (site.events || []).map((e) => ({
              name: site?.name ?? null,
              type: e?.type ?? null,
              id: e?.id ?? null,
              timestamp: e?.timestamp ?? null,
            }))
          )
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) || [];

      return { offPlatform, offEvents, offPlatformActivity };
    };

    const normalizeCommentEntry = (entry) => {
      const sm = entry?.string_map_data || {};
      return {
        timestamp: sm?.Time?.timestamp ?? null,
        author: sm?.["Media Owner"]?.value ?? null,
        text: sm?.Comment?.value ?? null,
      };
    };

    const videosWatchedPath =
      "ads_information/ads_and_topics/videos_watched.json";
    const postsViewedPath = "ads_information/ads_and_topics/posts_viewed.json";
    const adsViewedPath = "ads_information/ads_and_topics/ads_viewed.json";
    const offMetaActivityPath =
      "apps_and_websites_off_of_instagram/apps_and_websites/your_activity_off_meta_technologies.json";
    const loginActivityPath =
      "security_and_login_information/login_and_profile_creation/login_activity.json";
    const searchHistoryPath =
      "logged_information/recent_searches/profile_searches.json";

    const commentsStoryPath = "your_instagram_activity/comments/hype.json";
    const commentsPosts1Path =
      "your_instagram_activity/comments/post_comments_1.json";
    const commentsReelsPath =
      "your_instagram_activity/comments/reels_comments.json";

    const videosData = await loadJsonFromZip(zip, videosWatchedPath);
    const postsData = await loadJsonFromZip(zip, postsViewedPath);
    const adsData = await loadJsonFromZip(zip, adsViewedPath);
    const offMetaData = await loadJsonFromZip(zip, offMetaActivityPath);
    const loginData = await loadJsonFromZip(zip, loginActivityPath);
    const searchData = await loadJsonFromZip(zip, searchHistoryPath);

    const storyCommentsData = await loadJsonFromZip(zip, commentsStoryPath);
    const postComments1Data = await loadJsonFromZip(zip, commentsPosts1Path);
    const reelsCommentsData = await loadJsonFromZip(zip, commentsReelsPath);

    const videoViewed = getProcessedData(
      videosData,
      "impressions_history_videos_watched"
    );
    const postsViewed = getProcessedData(
      postsData,
      "impressions_history_posts_seen"
    );
    const adsViewed = getProcessedData(adsData, "impressions_history_ads_seen");

    const { offPlatform, offEvents, offPlatformActivity } =
      processOffMeta(offMetaData);

    const loginHistory = (loginData?.account_history_login_history || []).map(
      (entry) => {
        const sm = entry?.string_map_data || {};
        return {
          IP: sm?.["IP Address"]?.value || "",
          Date: sm?.Time?.timestamp
            ? new Date(sm.Time.timestamp * 1000).toISOString()
            : null,
          UserAgent: sm?.["User Agent"]?.value || "",
        };
      }
    );

    const searchHistory = (searchData?.searches_user || []).map((entry) => {
      const sm = entry?.string_map_data || {};
      return {
        timestamp: sm?.Time?.timestamp ?? null,
        query: sm?.Search?.value ?? null,
      };
    });

    const storyComments = (
      storyCommentsData?.comments_story_comments || []
    ).map(normalizeCommentEntry);
    const reelsComments = (
      reelsCommentsData?.comments_reels_comments || []
    ).map(normalizeCommentEntry);
    const postComments1 = (
      Array.isArray(postComments1Data) ? postComments1Data : []
    ).map(normalizeCommentEntry);

    const allComments = [...storyComments, ...postComments1, ...reelsComments]
      .filter((c) => c.timestamp || c.text)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    return {
      posts_viewed: postsViewed,
      video_viewed: videoViewed,
      ads_viewed: adsViewed,
      off_platform: offPlatform,
      off_events: offEvents,
      off_platform_activity: offPlatformActivity,
      login_history: loginHistory,
      search_history: searchHistory,
      comments: allComments,
      reactions: [],
    };
  };

  const handleTitleClick = (title) => {
    setActiveCard(title);
  };

  const handleBack = () => {
    setActiveCard(null);
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
              Upload Instagram Data
            </h2>

            <label
              htmlFor="instagram-upload"
              className="block mb-4 text-lg font-semibold text-gray-700 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg py-6 text-center hover:border-blue-500 transition-colors"
            >
              {file ? file.name : "Choose a .zip file to upload"}
              <input
                id="instagram-upload"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg text-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Submit"}
            </button>

            <div className="mt-8">
              {report ? (
                activeCard === "Off Platform Activity" ? (
                  <OffPlatformActivity report={report} onBack={handleBack} />
                ) : activeCard === "Comments" ? (
                  <Comments report={report} onBack={handleBack} />
                ) : activeCard === "Browsing History" ? (
                  <BrowsingHistoryCard report={report} onBack={handleBack} />
                ) : activeCard === "Location Information" ? (
                  <LocationHistoryCard report={report} onBack={handleBack} />
                ) : activeCard === "Search History" ? (
                  <InstagramSearchHistory report={report} onBack={handleBack} />
                ) : (
                  <div className="grid grid-cols-3 justify-center gap-4">
                  <DataCard
                    title="Browsing History"
                    description="Records of pages you open inside Instagram’s in-app browser and visits to websites that use Meta technologies."
                    whyCollectedAnswer="To personalize ads and content, improve recommendations, detect fraud, and measure services. More about this can be found <a href='https://privacycenter.instagram.com/policy#how-we-use-information' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    sharedWithAnswer="Shared with Meta systems and may be provided to partners/advertisers for measurement and personalization. See details <a href='https://privacycenter.instagram.com/policy#how-information-is-shared' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    howToControlAnswer="You can clear in-app browser data and manage off-Meta activity via Accounts Center. Learn more <a href='https://privacycenter.instagram.com/policy#how-to-control' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    howLongStoredAnswer="Kept as long as needed for service purposes unless you delete it. Retention policy explained <a href='https://privacycenter.instagram.com/policy#data-retention' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    onTitleClick={handleTitleClick}
                  />

                  <DataCard
                    title="Search History"
                    description="Your recent searches on Instagram (people, hashtags, places)."
                    whyCollectedAnswer="To improve content discovery and personalize recommendations. See more <a href='https://privacycenter.instagram.com/policy#how-we-use-information' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    sharedWithAnswer="Stored in Meta’s systems for personalization. See how it may be shared <a href='https://privacycenter.instagram.com/policy#how-information-is-shared' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    howToControlAnswer="You can clear or pause search history in Settings. Instructions <a href='https://help.instagram.com/460411108811350' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    howLongStoredAnswer="Retained until you clear it or per Meta’s retention policies. Explained <a href='https://privacycenter.instagram.com/policy#data-retention' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    onTitleClick={handleTitleClick}
                  />

                  <DataCard
                    title="Location Information"
                    description="Precise location if you enable it, plus inferred location from IP/Wi-Fi and photo metadata."
                    whyCollectedAnswer="To provide relevant content, ads, and safety features. Details <a href='https://privacycenter.instagram.com/policy#how-we-use-information' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    sharedWithAnswer="Shared with Meta services and may be visible to others if you tag a location. See more <a href='https://privacycenter.instagram.com/policy#how-information-is-shared' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    howToControlAnswer="Manage location permissions in your device or in Accounts Center. Controls explained <a href='https://privacycenter.instagram.com/policy#how-to-control' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    howLongStoredAnswer="Location data is retained as long as necessary for features, or until you remove it. Retention explained <a href='https://privacycenter.instagram.com/policy#data-retention' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    onTitleClick={handleTitleClick}
                  />

                  <DataCard
                    title="Off Platform Activity"
                    description="Information about your activity on other apps and websites that use Meta technologies."
                    whyCollectedAnswer="To measure ads, personalize experiences, and improve Meta products. More <a href='https://privacycenter.instagram.com/policy#how-we-use-information' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    sharedWithAnswer="Used within Meta’s systems and may be shared with advertisers/partners. Explained <a href='https://privacycenter.instagram.com/policy#how-information-is-shared' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    howToControlAnswer="You can manage and disconnect off-Meta activity in Accounts Center. Guide <a href='https://www.facebook.com/help/2207256696182627' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    howLongStoredAnswer="Retained according to Meta’s retention rules unless you clear it. Policy <a href='https://privacycenter.instagram.com/policy#data-retention' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    onTitleClick={handleTitleClick}
                  />

                  <DataCard
                    title="Comments"
                    description="Text and metadata of comments you post on Instagram."
                    whyCollectedAnswer="To enable engagement, enforce community standards, and personalize your experience. See more <a href='https://privacycenter.instagram.com/policy#how-we-use-information' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    sharedWithAnswer="Visible to others based on the post’s visibility and stored in Meta’s systems. See sharing policy <a href='https://privacycenter.instagram.com/policy#how-information-is-shared' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    howToControlAnswer="You can delete or hide comments, or turn off comments on posts. Guide <a href='https://help.instagram.com/289098941190483' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
                    howLongStoredAnswer="Kept until you delete them or per retention rules. Retention info <a href='https://privacycenter.instagram.com/policy#data-retention' class='text-blue-600 underline' target='_blank' rel='noopener noreferrer'>here</a>."
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

export default UploadInstagram;
