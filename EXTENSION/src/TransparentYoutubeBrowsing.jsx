import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Clock,
  Users,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

const WatchSection = ({ data }) => {
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const explanationRef = useRef(null);
  const placeholderRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const shouldBeSticky =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;

        if (shouldBeSticky !== isSticky) {
          setIsSticky(shouldBeSticky);
        }
      },
      {
        rootMargin: "0px 0px 0px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
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

  const firstEntry = data.watch[0] || {};
  const isFirstEntryAd = firstEntry.subtitlesName === "Unknown";

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
                            ${
                              isSticky
                                ? "fixed top-0 left-0 right-0 z-50"
                                : "relative"
                            }
                            bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50
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
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
        </div>

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Understanding Your Watch History
                </h3>
                <p className="text-sm text-gray-600">
                  Analysis of each watch history entry
                </p>
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
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg ">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div
                        className={`bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 shadow-sm border ${
                          isFirstEntryAd ? "border-orange-200" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-lg font-semibold text-gray-900">
                            Video 1
                          </p>
                          {isFirstEntryAd && (
                            <div className="flex items-center space-x-1 bg-orange-100 px-2 py-1 rounded-full">
                              <AlertTriangle className="w-3 h-3 text-orange-600" />
                              <span className="text-xs font-medium text-orange-600">
                                AD
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-8">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <Info className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Title:
                              </p>
                              <p className="text-gray-900 text-sm">
                                {firstEntry.title || "Unknown"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Channel:
                              </p>
                              <p
                                className={`text-sm ${
                                  isFirstEntryAd
                                    ? "text-orange-600 font-medium"
                                    : "text-gray-900"
                                }`}
                              >
                                {firstEntry.subtitlesName || "Unknown"}
                                {isFirstEntryAd && " (Advertisement)"}
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
                              <p className="text-gray-900 text-xs">
                                {new Date(
                                  firstEntry.time || Date.now()
                                ).toUTCString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-700">
                                Video URL:
                              </p>
                              <a
                                href={firstEntry.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 text-xs hover:text-indigo-800 transition-colors duration-200 truncate block hover:underline"
                                title={firstEntry.url}
                              >
                                {firstEntry.url || "N/A"}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-700">
                                Channel URL:
                              </p>
                              <a
                                href={firstEntry.channelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 text-xs hover:text-indigo-800 transition-colors duration-200 truncate block hover:underline"
                                title={firstEntry.channelUrl}
                              >
                                {firstEntry.channelUrl || "N/A"}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <motion.div
                        className="flex items-center space-x-4 mt-8"
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
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#3b82f6" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-purple-800">
                            Video Title
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Shows the title of the video you watched
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center space-x-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
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
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-blue-800">
                            Channel Name
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Creator behind the content
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center space-x-4"
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
                                <stop offset="0%" stopColor="#00a63e" />
                                <stop offset="100%" stopColor="#02e858" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-green-800">
                            Date and Time
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            The exact date and time you watched the video
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center space-x-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex-shrink-0">
                          <svg
                            className="w-12 h-8"
                            viewBox="0 0 48 32"
                            fill="none"
                          >
                            <path
                              d="M2 16 L38 16 M30 8 L38 16 L30 24"
                              stroke="url(#gradient4)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <defs>
                              <linearGradient
                                id="gradient4"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-indigo-800">
                            Video URL
                          </p>
                          <p className="text-xs text-indigo-600 mt-1">
                            Direct link to the video you watched
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center space-x-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="flex-shrink-0">
                          <svg
                            className="w-12 h-8"
                            viewBox="0 0 48 32"
                            fill="none"
                          >
                            <path
                              d="M2 16 L38 16 M30 8 L38 16 L30 24"
                              stroke="url(#gradient5)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <defs>
                              <linearGradient
                                id="gradient5"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#6b7280" />
                                <stop offset="100%" stopColor="#9ca3af" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            Channel URL
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Link to the channel that created the content
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

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto p-6">
      <ExplanationCard isSticky={isSticky} />

      <div className="space-y-6 mt-8">
        {data.watch.length > 0 ? (
          data.watch.map((item, index) => {
            const displayTime = new Date(item.time).toUTCString();
            const isAd = item.subtitlesName === "Unknown";
            const isFirst = index === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`
                                            bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] 
                                            ${
                                              isFirst
                                                ? "hidden"
                                                : "border-gray-200 hover:border-gray-300"
                                            }
                                            ${
                                              isAd
                                                ? "border-l-4 border-l-orange-400"
                                                : ""
                                            }
                                        `}
              >
                <div className="p-6">
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-xl border ${
                          isAd
                            ? "bg-gradient-to-br from-orange-50 to-red-50 border-orange-100"
                            : "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100"
                        }`}
                      >
                        {isAd ? (
                          <AlertTriangle className="w-6 h-6 text-orange-600" />
                        ) : (
                          <Video className="w-6 h-6 text-indigo-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xl font-bold text-gray-800">
                            Video {index + 1}
                          </p>
                          {isAd && (
                            <div className="flex items-center space-x-1 bg-orange-100 px-2 py-1 rounded-full">
                              <AlertTriangle className="w-3 h-3 text-orange-600" />
                              <span className="text-xs font-bold text-orange-600">
                                ADVERTISEMENT
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          {isAd ? "Advertisement Record" : "Watch Record"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="group md:col-span-2">
                    <div
                      className={`flex items-start mb-4 space-x-4 p-4 rounded-xl border transition-all duration-200 ${
                        isAd
                          ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-100 hover:border-orange-200"
                          : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100 hover:border-purple-200"
                      }`}
                    >
                      <div className="p-2 bg-white rounded-lg shadow-sm mt-1">
                        <Info
                          className={`w-5 h-5 ${
                            isAd ? "text-orange-600" : "text-purple-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                            isAd ? "text-orange-600" : "text-purple-600"
                          }`}
                        >
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
                      <div
                        className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 ${
                          isAd
                            ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-100 hover:border-orange-200"
                            : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-200"
                        }`}
                      >
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {isAd ? (
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          ) : (
                            <Users className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                              isAd ? "text-orange-600" : "text-blue-600"
                            }`}
                          >
                            {isAd ? "Advertiser" : "Channel"}
                          </p>
                          <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                            {isAd
                              ? "Unknown (Advertisement)"
                              : item.subtitlesName || "Unknown"}
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
    </div>
  );
};
export default WatchSection;
