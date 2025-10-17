import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar,
  Type,
} from "lucide-react";

const TransparentTiktokSearch = ({ rawDataList }) => {
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

  const firstEntry = rawDataList[0] || {};

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
          bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50
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
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-xl" />
        </div>

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Understanding Your Search Data
                </h3>
                <p className="text-sm text-gray-600">
                  Here's how we analyze each search entry
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
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-lg font-semibold text-gray-900">
                            Search 1
                          </p>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <Type className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Query:
                              </p>
                              <p className="text-gray-900 text-sm">
                                {firstEntry.query || "No query available"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Time:
                              </p>
                              <p className="text-gray-900 text-xs">
                                {firstEntry.timeString ||
                                  new Date().toUTCString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Raw Time:
                              </p>
                              <p className="text-gray-900 text-xs">
                                {firstEntry.time || Date.now()}
                              </p>
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
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#06d6a0" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-emerald-800">
                            Search Query
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            The exact terms you searched for
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
                                <stop offset="0%" stopColor="#059669" />
                                <stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-green-800">
                            Date and Time
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            The exact date and time of the search in a
                            human-readable format
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
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-indigo-800">
                            Raw Timestamp
                          </p>
                          <p className="text-xs text-indigo-600 mt-1">
                            Unix timestamp for precise time tracking
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
        {rawDataList.length > 0 ? (
          rawDataList.map((item, index) => {
            const displayTime =
              item.timeString || new Date(item.time).toUTCString();

            return (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-gray-200 hover:border-gray-300"
              >
                <div className="p-6">
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                        <Search className="w-6 h-6 text-emerald-600" />
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
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Query */}
                    <div className="group">
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all duration-200">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Type className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">
                            Query
                          </p>
                          <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                            {item.query || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="group">
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-200">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">
                            Time
                          </p>
                          <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                            {displayTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Raw Time - Spans full width */}
                    <div className="group md:col-span-2">
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-all duration-200">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">
                            Raw Timestamp
                          </p>
                          <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                            {item.time || "N/A"}
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
    </div>
  );
};

export default TransparentTiktokSearch;
