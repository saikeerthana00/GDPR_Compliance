import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { Info } from "lucide-react";
import "./App_main.css";
import Sidebar from "./Sidebar";
import { HiMenuAlt2 } from "react-icons/hi";

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

const HeatmapSVG = ({ heatmapData }) => {
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
};

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

export const Instagram = () => {
  const [rawData, setRawData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [interactionsData, setInteractionsData] = useState([]);
  const [contentPieData, setContentPieData] = useState([]);
  const [adsData, setAdsData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [heatmapDays, setHeatmapDays] = useState(90);
  const [contentDays, setContentDays] = useState(90);
  const [interactionsDays, setInteractionsDays] = useState(90);
  const [adsDays, setAdsDays] = useState(90);
  const [engagementDays, setEngagementDays] = useState(90);
  const [offPlatform, setOffPlatform] = useState([]);
  const [offEvents, setOffEvents] = useState([]);
  const [interactionsLimit, setInteractionsLimit] = useState(5);
  const [adsLimit, setAdsLimit] = useState(5);
  const [contentExpanded, setContentExpanded] = useState(false);
  const [adsExpanded, setAdsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showOffPlatformTooltip, setShowOffPlatformTooltip] = useState(false);
  const [showfeedPlatformTooltip, setShowfeedPlatformTooltip] = useState(false);
  const [showAdsTooltip, setShowAdsTooltip] = useState(false);
  const [showInteractionsTooltip, setShowInteractionsTooltip] = useState(false);
  const [showContentTooltip, setShowContentTooltip] = useState(false);
  const [showHeatmapTooltip, setShowHeatmapTooltip] = useState(false);


  const [openSidebarToggle, setOpenSidebarToggle] = useState(true);

  const toggleSidebar = () => {
    setOpenSidebarToggle((prev) => !prev);
  };


  var api_url = "./Report.json";
  useEffect(() => {
    fetch(api_url)
      .then((r) => r.json())
      .then((data) => setRawData(data))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!rawData) return;
    const postsVideos = [
      ...(rawData.posts_viewed || []),
      ...(rawData.video_viewed || []),
    ];
    const maxHeat = getMaxDays(postsVideos);
    const maxComments = getMaxDays([
      ...(rawData.comments || []),
      ...(rawData.reactions || []),
    ]);
    const maxAds = getMaxDays(rawData.ads_viewed || []);
    const maxEng = Math.max(maxHeat, maxAds);

    setHeatmapDays(Math.min(90, maxHeat));
    setContentDays(Math.min(90, maxHeat));
    setInteractionsDays(Math.min(90, maxComments));
    setAdsDays(Math.min(90, maxAds));
    setEngagementDays(Math.min(90, maxEng));
    setOffPlatform(rawData.off_platform || []);
    setOffEvents(rawData.offEvents || []);
  }, [rawData]);

  useEffect(() => {
    if (!rawData) return;
    const postsVideos = [
      ...(rawData.posts_viewed || []),
      ...(rawData.video_viewed || []),
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
      rawData.comments || [],
      interactionsDays
    );
    const filteredReacts = filterByDateRange(
      rawData.reactions || [],
      interactionsDays
    );
    setInteractionsData(
      aggregateInteractionsByAuthor({
        comments: filteredComments,
        reactions: filteredReacts,
      })
    );

    const filteredAds = filterByDateRange(rawData.ads_viewed || [], adsDays);
    setAdsData(aggregateByAuthor(filteredAds));

    const filtPostEng = filterByDateRange(postsVideos, engagementDays);
    const filtAdsEng = filterByDateRange(
      rawData.ads_viewed || [],
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
    rawData,
    heatmapDays,
    contentDays,
    interactionsDays,
    adsDays,
    engagementDays,
  ]);

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
  const interactionsChartHeight =
    interactionsLimit * BAR_HEIGHT + EXTRA_PADDING;

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

    // average ratios
    const avgPostsRatio =
      engagementData.reduce((sum, d) => sum + d.regular, 0) / totalHours;
    const avgAdsRatio = 1 - avgPostsRatio;

    // find peaks
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


  return (
    <Router>
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          <div
            className={`transition-all duration-300 ${
              openSidebarToggle ? "w-64" : "w-0"
            }`}
          >
            <Sidebar
              openSidebarToggle={openSidebarToggle}
              OpenSidebar={toggleSidebar}
            />
          </div>
  
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            {/* <Header OpenSidebar={toggleSidebar} /> */}
  
            {/* Toggle Button - Only visible when sidebar is closed */}
            {!openSidebarToggle && (
              <button
                onClick={toggleSidebar}
                className="fixed left-4 top-4 z-50 bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
              >
                <HiMenuAlt2 className="w-6 h-6 text-gray-700" />
              </button>
            )}
    
        
    <main className="flex-1 overflow-y-auto">

      
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            What Does Instagram Data Tell About You?
          </h2>
        </motion.header>
        <div className="mb-8">
          <nav className="flex justify-center space-x-1 p-1 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "content", label: "Browsing Pattern" },
              { id: "interactions", label: "Your Interactions" },
              { id: "ads", label: "Advertisements" },
              { id: "other", label: "Other Activities (On Instagram)" },
              { id: "other_off", label: "Other Activities (Off Instagram)" },
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          <motion.section
            variants={itemVariants}
            className={`${activeTab !== "overview" && "hidden"}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-lg font-medium text-blue-100">Posts</h5>
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

          <motion.section
            variants={itemVariants}
            className={`${
              activeTab !== "content" && activeTab !== "overview" && "hidden"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
              {/* HEADER */}
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
                    <Info size={18} className="text-gray-500 cursor-pointer" />
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

                {/* SLIDER */}
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
                    max={getMaxDays([
                      ...(rawData?.posts_viewed || []),
                      ...(rawData?.video_viewed || []),
                    ])}
                    step="1"
                    value={heatmapDays}
                    onChange={(e) => setHeatmapDays(parseInt(e.target.value))}
                    className="w-40 ml-2"
                  />
                </div>
              </div>

              {/* HEATMAP */}
              <HeatmapSVG heatmapData={heatmapData} />

              {/* STATS BOX */}
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
                  <strong>{heatmapStats.mostViewedDay}</strong> with
                  <strong> {heatmapStats.mostViewedDayCount}</strong> views.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className={`${
              activeTab !== "content" && activeTab !== "overview" && "hidden"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                {/* LEFT: title + info icon */}
                <div className="flex items-center">
                  <h4 className="text-2xl font-bold text-gray-800">
                    Where do your views go?
                  </h4>
                  <div
                    className="relative ml-2"
                    onMouseEnter={() => setShowContentTooltip(true)}
                    onMouseLeave={() => setShowContentTooltip(false)}
                  >
                    <Info size={18} className="text-gray-500 cursor-pointer" />

                    {showContentTooltip && (
                      <>
                        {/* Tooltip box */}
                        <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2">
                          <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                            <p className="text-sm">
                              Breaks down how many views went to posts vs.
                              videos during the selected period.
                            </p>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="absolute z-10 top-[calc(100%+0.25rem)] left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                      </>
                    )}
                  </div>
                </div>

                {/* RIGHT: date slider */}
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
                    max={getMaxDays([
                      ...(rawData?.posts_viewed || []),
                      ...(rawData?.video_viewed || []),
                    ])}
                    step="1"
                    value={contentDays}
                    onChange={(e) => setContentDays(parseInt(e.target.value))}
                    className="w-40 ml-2"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                {/* Pie chart */}
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
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
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

                {/* Legend/list */}
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
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className={`${
              activeTab !== "interactions" &&
              activeTab !== "overview" &&
              "hidden"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                {/* LEFT: title + info icon */}
                <div className="flex items-center">
                  <h4 className="text-2xl font-bold text-gray-800">
                    Your interactions with top creators
                  </h4>
                  <div
                    className="relative ml-2"
                    onMouseEnter={() => setShowInteractionsTooltip(true)}
                    onMouseLeave={() => setShowInteractionsTooltip(false)}
                  >
                    <Info size={18} className="text-gray-500 cursor-pointer" />

                    {showInteractionsTooltip && (
                      <>
                        {/* Tooltip box */}
                        <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2">
                          <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                            <p className="text-sm">
                              Shows how many reactions and comments you’ve made
                              on each creator’s content over the selected
                              period.
                            </p>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="absolute z-10 top-[calc(100%+0.25rem)] left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                      </>
                    )}
                  </div>
                </div>

                {/* RIGHT: sliders */}
                <div className="flex items-center space-x-6">
                  <div>
                    <label
                      htmlFor="interactionsRange"
                      className="text-sm text-gray-700"
                    >
                      Last {interactionsDays} day{interactionsDays > 1 && "s"}
                    </label>
                    <input
                      id="interactionsRange"
                      type="range"
                      min="1"
                      max={getMaxDays([
                        ...(rawData?.comments || []),
                        ...(rawData?.reactions || []),
                      ])}
                      step="1"
                      value={interactionsDays}
                      onChange={(e) =>
                        setInteractionsDays(parseInt(e.target.value))
                      }
                      className="w-40 ml-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="interactionsLimitRange"
                      className="text-sm text-gray-700"
                    >
                      Showing Top {interactionsLimit} creators
                    </label>
                    <input
                      id="interactionsLimitRange"
                      type="range"
                      min="1"
                      max={interactionsData.length}
                      step="1"
                      value={interactionsLimit}
                      onChange={(e) =>
                        setInteractionsLimit(parseInt(e.target.value))
                      }
                      className="w-40 ml-2"
                    />
                  </div>
                </div>
              </div>

              <div style={{ width: "100%", height: interactionsChartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={interactionsData.slice(0, interactionsLimit)}
                    margin={{ top: 20, right: 30, bottom: 20, left: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="author"
                      tickMargin={10}
                      width={200}
                    />
                    <Tooltip />
                    <Legend
                      verticalAlign="top"
                      align="center"
                      wrapperStyle={{ marginBottom: 10 }}
                    />
                    {reactionTypes.map((r) => (
                      <Bar
                        key={r}
                        dataKey={r}
                        stackId="a"
                        fill={interactionColors[r]}
                        name={r}
                        barSize={BAR_HEIGHT - 4}
                      />
                    ))}
                    <Bar
                      dataKey="comments"
                      stackId="a"
                      fill={interactionColors.comments}
                      name="Comments"
                      barSize={BAR_HEIGHT - 4}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className={`${
              activeTab !== "ads" && activeTab !== "overview" ? "hidden" : ""
            }`}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
              {/* Header with Info Tooltip */}
              <div className="flex items-center justify-between mb-4">
                {/* LEFT: title + icon */}
                <div className="flex items-center">
                  <h4 className="text-2xl font-bold text-gray-800">
                    Your recent advertisements exposure
                  </h4>

                  <div
                    className="relative ml-2"
                    onMouseEnter={() => setShowAdsTooltip(true)}
                    onMouseLeave={() => setShowAdsTooltip(false)}
                  >
                    <Info size={18} className="text-gray-500 cursor-pointer" />

                    {showAdsTooltip && (
                      <>
                        {/* Tooltip box */}
                        <div className="absolute z-10 top-full left-1/2 mt-2 w-64 -translate-x-1/2">
                          <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                            <p className="text-sm">
                              This shows the top brands you’ve seen ads from
                              over the past {adsDays} day
                              {adsDays > 1 ? "s" : ""}.
                            </p>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="absolute z-10 top-[calc(100%+0.25rem)] left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 bg-gray-800" />
                      </>
                    )}
                  </div>
                </div>

                {/* RIGHT: date label */}
                <p className="text-gray-700">
                  Brands shown over last {adsDays} day{adsDays > 1 && "s"}
                </p>
              </div>

              {/* Ads Limit Slider */}
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

              {/* Pie + List */}
              {adsData.length ? (
                (() => {
                  const chartAds = adsData.slice(0, adsLimit);
                  const maxCollapsed = Math.min(DEFAULT_VISIBLE, adsLimit);
                  const listAds = adsExpanded
                    ? adsData.slice(0, adsLimit)
                    : adsData.slice(0, maxCollapsed);

                  return (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                      {/* PIE CHART */}
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

                      {/* LIST */}
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
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className={`${
              activeTab !== "ads" && activeTab !== "overview" && "hidden"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
              <div className="flex items-center mb-4 relative">
                <h4 className="text-2xl font-bold text-gray-800">
                  What did your feed look like?
                </h4>

                <div className="relative ml-2">
                  <div
                    className="cursor-help"
                    onMouseEnter={() => setShowfeedPlatformTooltip(true)}
                    onMouseLeave={() => setShowfeedPlatformTooltip(false)}
                  >
                    <Info size={18} className="text-gray-500" />
                  </div>

                  {showfeedPlatformTooltip && (
                    <div className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-2 w-64">
                      <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                        <p className="text-sm">
                          Shows proportion of ads vs posts on your feed
                        </p>
                      </div>
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-gray-800"></div>
                    </div>
                  )}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={engagementData}
                  margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip content={<CustomTooltipDaily />} />
                  <Legend />
                  <Bar
                    dataKey="regular"
                    stackId="a"
                    name="Posts Ratio"
                    fill="#3b82f6"
                    radius={[2, 2, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="ads"
                    stackId="a"
                    name="Ads Ratio"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div
                className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}
              >
                <p>
                  Over the last {adsDays} day{adsDays > 1 && "s"}, about{" "}
                  <strong>{Math.round(feedStats.avgPostsRatio * 100)}%</strong>{" "}
                  of what you saw were posts, and{" "}
                  <strong>{Math.round(feedStats.avgAdsRatio * 100)}%</strong>{" "}
                  were ads.
                </p>
                <p>
                  You saw the highest share of ads around{" "}
                  <strong>{feedStats.peakAdsHour}:00</strong>, when ads made up
                  about{" "}
                  <strong>{Math.round(feedStats.peakAdsRatio * 100)}%</strong>{" "}
                  of your feed.
                </p>
                <p>
                  The hour with the most posts was{" "}
                  <strong>{feedStats.peakPostsHour}:00</strong>, when posts
                  accounted for roughly{" "}
                  <strong>{Math.round(feedStats.peakPostsRatio * 100)}%</strong>{" "}
                  of your feed.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className={`${
              activeTab !== "other_off" && activeTab !== "overview" && "hidden"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
              <div className="flex items-center mb-4 relative">
                <h4 className="text-2xl font-bold text-gray-800">
                  Off platform activity
                </h4>

                <div className="relative ml-2">
                  <div
                    className="cursor-help"
                    onMouseEnter={() => setShowOffPlatformTooltip(true)}
                    onMouseLeave={() => setShowOffPlatformTooltip(false)}
                  >
                    <Info size={18} className="text-gray-500" />
                  </div>

                  {showOffPlatformTooltip && (
                    <div className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-2 w-64">
                      <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                        <p className="text-sm">
                          Shows your interactions outside Meta platforms (app
                          visits, purchases, etc.)
                        </p>
                      </div>
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-gray-800"></div>
                    </div>
                  )}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={offPlatform}
                  margin={{ top: 20, right: 50, left: 50, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="key"
                    stroke="#4b5563"
                    height={150}
                    tick={{
                      angle: -45,
                      textAnchor: "end",
                      fontSize: 10,
                      fill: "#4b5563",
                    }}
                    interval={0}
                  />
                  <YAxis stroke="#4b5563" />
                  <Tooltip content={<CustomTooltipOff />} />
                  <Bar dataKey="value" fill="#1f77b4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <motion.footer
            variants={itemVariants}
            className="mt-16 text-center text-gray-500 text-sm"
          >
            <p>Analytics data filtered by the selected date ranges.</p>
          </motion.footer>
        </motion.div>
      </div>
    </main>
      </div>
      </div>
    </Router>
  );
};





// export const Instagram = () => {
//   const [openSidebarToggle, setOpenSidebarToggle] = useState(true);

//   const toggleSidebar = () => {
//       setOpenSidebarToggle((prev) => !prev);
//   };

//   const [file, setFile] = useState(null);

//   const handleUpload = async () => {
//     if (!file) return alert("Please select a ZIP file.");

//     // Simulate Report.json generation
//     // In practice, you might use a backend or WebAssembly
//     const dummyReport = { status: "generated from zip" };
//     const blob = new Blob([JSON.stringify(dummyReport)], { type: 'application/json' });

//     // Save Report.json locally (simulate server-side)
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'Report.json';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     // After saving, signal success
//     onUploadSuccess();
//   };

//   return (
//   <Router>
//         <div className="flex h-screen bg-gray-50">
//           {/* Sidebar */}
//           <div
//             className={`transition-all duration-300 ${
//               openSidebarToggle ? "w-64" : "w-0"
//             }`}
//           >
//             <Sidebar
//               openSidebarToggle={openSidebarToggle}
//               OpenSidebar={toggleSidebar}
//             />
//           </div>
  
//           {/* Main Content */}
//           <div className="flex-1 flex flex-col overflow-hidden">
//             {/* Header */}
//             {/* <Header OpenSidebar={toggleSidebar} /> */}
  
//             {/* Toggle Button - Only visible when sidebar is closed */}
//             {!openSidebarToggle && (
//               <button
//                 onClick={toggleSidebar}
//                 className="fixed left-4 top-4 z-50 bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
//               >
//                 <HiMenuAlt2 className="w-6 h-6 text-gray-700" />
//               </button>
//             )}
//   <main className ="flex-1 overflow-y-auto">
//     <h1>Upload the data</h1>
//     <input type="file" accept=".zip" onChange={(e) => setFile(e.target.files[0])} />
//     <button onClick={handleUpload}>Submit</button>
//   </main>
//   </div>
//   </div>
//   </Router>
//   )
// };
export default Instagram;
