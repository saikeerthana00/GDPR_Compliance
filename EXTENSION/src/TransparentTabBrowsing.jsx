import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  Target,
} from "lucide-react";

const TransparentTab = ({ report }) => {
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const explanationRef = useRef(null);
  const placeholderRef = useRef(null);
  const sentinelRef = useRef(null);

  // Combine videos, posts, and ads into one list, tagging each entry with its type
  const combinedData = [];
  (report.video_viewed || []).forEach((e) => {
    combinedData.push({ ...e, type: "Video" });
  });
  (report.posts_viewed || []).forEach((e) => {
    combinedData.push({ ...e, type: "Post" });
  });
  (report.ads_viewed || []).forEach((e) => {
    combinedData.push({ ...e, type: "Ad" });
  });
  // Sort descending by timestamp
  combinedData.sort((a, b) => b.timestamp - a.timestamp);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const shouldBeSticky =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (shouldBeSticky !== isSticky) {
          setIsSticky(shouldBeSticky);
        }
      },
      { rootMargin: "0px", threshold: 0 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isSticky]);

  useEffect(() => {
    if (placeholderRef.current && explanationRef.current) {
      if (isSticky) {
        const height = explanationRef.current.getBoundingClientRect().height;
        placeholderRef.current.style.height = `${height}px`;
      } else {
        placeholderRef.current.style.height = "0px";
      }
    }
  }, [isSticky, isExplanationExpanded]);

  // Explanation card shows the most recent entry (any type)
  const firstEntry = combinedData[0] || {};

  // Get content type styling and descriptions
  const getContentTypeInfo = (type) => {
    switch (type) {
      case "Video":
        return {
          bgGradient: "from-purple-500 to-pink-500",
          lightBg: "from-purple-50 to-pink-50",
          icon: Play,
          iconColor: "text-purple-600",
          badgeColor: "bg-purple-100",
          description:
            "Instagram Reels, IGTV videos, or video posts you watched",
          title: "Video Content",
        };
      case "Post":
        return {
          bgGradient: "from-blue-500 to-cyan-500",
          lightBg: "from-blue-50 to-cyan-50",
          icon: FileText,
          iconColor: "text-blue-600",
          badgeColor: "bg-blue-100",
          description: "Photo posts and carousels you viewed",
          title: "Posts",
        };
      case "Ad":
        return {
          bgGradient: "from-red-500 to-orange-500",
          lightBg: "from-red-50 to-orange-50",
          icon: Target,
          iconColor: "text-red-600",
          badgeColor: "bg-red-100",
          description: "Sponsored content and advertisements shown to you",
          title: "Advertisements",
        };
      default:
        return {
          bgGradient: "from-gray-500 to-gray-600",
          lightBg: "from-gray-50 to-gray-100",
          icon: Eye,
          iconColor: "text-gray-600",
          badgeColor: "bg-gray-100",
          description: "Unknown content type",
          title: "Unknown",
        };
    }
  };

  const currentTypeInfo = getContentTypeInfo(firstEntry.type);

  const ExplanationCard = ({ isSticky }) => (
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
        className={`
          ${isSticky ? "fixed top-0 left-0 right-0 z-50" : "relative"}
          bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50
          rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm
          transition-all duration-300 ease-out
        `}
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
        animate={{
          opacity: 1,
          y: 0,
          scale: isSticky ? 0.98 : 1,
        }}
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
                  Understanding Your Instagram Data
                </h3>
                {/* <p className="text-sm text-gray-600">
                  Here's the most recent item (type: {firstEntry.type || "N/A"})
                </p> */}
              </div>
            </div>

            <button
              onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
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
                  {/* Content Types Explanation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-purple-800">
                          Videos
                        </h4>
                      </div>
                      <p className="text-sm text-purple-700">
                        Reels, IGTV, and video posts you watched on Instagram
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-blue-800">Posts</h4>
                      </div>
                      <p className="text-sm text-blue-700">
                        Photo posts and carousels you viewed
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-red-800">Ads</h4>
                      </div>
                      <p className="text-sm text-red-700">
                        Sponsored content and advertisements shown to you
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 shadow-sm border">
                        <p className="text-lg font-semibold text-gray-900 mb-4">
                          Latest Entry
                        </p>
                        <div className="space-y-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Author:
                              </p>
                              <p className="text-gray-900">
                                {firstEntry.author || "Unknown"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Timestamp:
                              </p>
                              <p className="text-gray-900 text-sm">
                                {firstEntry.timestamp
                                  ? new Date(
                                      firstEntry.timestamp * 1000
                                    ).toUTCString()
                                  : "N/A"}
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
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-blue-800">
                            Creator Identity
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            The Instagram user who created this content
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
                            Viewing Time
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            The exact date and time you viewed this content at
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

  // Main render: show ExplanationCard, then list all entries with their type
  return (
    <div className="space-y-6 pb-20">
      <ExplanationCard isSticky={isSticky} />

      <div className="space-y-6 mt-8">
        {combinedData.length > 0 ? (
          combinedData.map((item, index) => {
            const utcTime = new Date(item.timestamp * 1000).toUTCString();
            const typeInfo = getContentTypeInfo(item.type);
            const IconComponent = typeInfo.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`bg-gradient-to-r ${
                  typeInfo.lightBg
                } rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                  item.type === "Video"
                    ? "border-purple-200"
                    : item.type === "Post"
                    ? "border-blue-200"
                    : "border-red-200"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Enhanced type indicator with gradient background */}
                      <div
                        className={`p-3 bg-gradient-to-r ${typeInfo.bgGradient} rounded-xl shadow-lg`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-xl font-bold text-gray-900">
                            {typeInfo.title} #{index + 1}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${typeInfo.badgeColor} ${typeInfo.iconColor}`}
                          >
                            {item.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {typeInfo.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                          Author
                        </p>
                        <p className="font-medium text-gray-900 text-md">
                          @{item.author || "unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                          Timestamp
                        </p>
                        <p className="font-medium text-gray-900 text-sm">
                          {utcTime}
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
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No Instagram data available.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TransparentTab;
