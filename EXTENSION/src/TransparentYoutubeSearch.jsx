import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  Hash,
} from "lucide-react";

const SearchSection = ({ data }) => {
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

  const firstEntry = data && data.length > 0 ? data[0] : {};

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
          bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50
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
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-xl" />
        </div>

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Understanding Your Search History
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
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <Hash className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Query:
                              </p>
                              <p className="text-gray-900 text-sm">
                                {firstEntry.title || "Unknown"}
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
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <motion.div
                        className="flex items-center space-x-4"
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
                                <stop offset="0%" stopColor="#9810fa" />
                                <stop offset="100%" stopColor="#cfa1d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-purple-800">
                            Search Query
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Shows the exact terms you searched for on YouTube
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
                            Shows the date and time when you made the search
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
        {data && data.length > 0 ? (
          data.map((item, index) => {
            const displayTime = new Date(item.time).toUTCString();
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
                    isFirst ? "hidden" : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div className="p-6">
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl border bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
                        <Search className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xl font-bold text-gray-800">
                            Search {index + 1}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          Search Record
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Query */}
                  <div className="group md:col-span-2">
                    <div className="flex items-start mb-4 space-x-4 p-4 rounded-xl border transition-all duration-200 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100 hover:border-purple-200">
                      <div className="p-2 bg-white rounded-lg shadow-sm mt-1">
                        <Hash className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-purple-600">
                          Search Query
                        </p>
                        <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                          {item.title || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 gap-5">
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

export default SearchSection;
