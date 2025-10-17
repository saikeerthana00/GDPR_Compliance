import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Code, ChevronDown, ChevronUp } from "lucide-react";

const LocationTab = ({ report }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const locationData = report?.login_history || [];
  const firstEntry = locationData[0] || {};

  const ExplanationCard = () => (
    <motion.div
      className={`${
        isSticky
          ? "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl"
          : "relative w-full"
      } bg-gradient-to-r from-green-50 via-cyan-50 to-blue-50 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400/20 to-cyan-400/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-full blur-xl" />
      </div>

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Understanding Location Data
              </h3>
              <p className="text-sm text-gray-600">
                Here's how we interpret each location entry
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 shadow-sm border">
                      <p className="text-lg font-semibold text-gray-900 mb-4">
                        Location 1
                      </p>
                      <div className="space-y-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700">
                              IP Address:
                            </p>
                            <p className="text-gray-900 break-words">
                              {firstEntry.IP || "0.0.0.0"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700">
                              Timestamp:
                            </p>
                            <p className="text-gray-900 text-sm break-words">
                              {new Date(
                                firstEntry.Date || Date.now()
                              ).toUTCString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Code className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700">
                              User Agent:
                            </p>
                            <p className="text-gray-900 text-sm break-words">
                              {firstEntry.UserAgent || "Unknown Agent"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-10">
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
                            stroke="url(#gradA1)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <defs>
                            <linearGradient
                              id="gradA1"
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
                          IP Address
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Pinpoints the location of the user during login
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
                            stroke="url(#gradA2)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <defs>
                            <linearGradient
                              id="gradA2"
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
                      <div className="bg-gradient-to-r from-blue-50 to-purple-100 rounded-lg p-3 flex-1">
                        <p className="text-sm font-medium text-blue-800">
                          Date and Time
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Records exact date and time of access attempt
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
                            stroke="url(#gradA3)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <defs>
                            <linearGradient
                              id="gradA3"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="bg-gradient-to-r from-cyan-50 to-indigo-100 rounded-lg p-3 flex-1">
                        <p className="text-sm font-medium text-cyan-800">
                          User Agent Info
                        </p>
                        <p className="text-xs text-cyan-600 mt-1">
                          Details about browser and device sending the request
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
  );

  return (
    <div className="space-y-6 pb-20">
      <div ref={wrapperRef}>
        <ExplanationCard />
      </div>
      {isSticky && <div className="h-[280px]" />}
      <div className="space-y-6 mt-8">
        {locationData.length > 0 ? (
          locationData.map((item, index) => {
            const displayTime = new Date(item.Date).toUTCString();
            const isFirst = index === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                  isFirst ? "hidden" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <MapPin className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p
                          className={`text-lg font-semibold ${
                            isFirst
                              ? "text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text"
                              : "text-gray-900"
                          }`}
                        >
                          Location {index + 1}
                        </p>
                        <p className="text-sm text-gray-500">Access Record</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            IP
                          </p>
                          <p className="font-medium text-gray-900">
                            {item.IP || "0.0.0.0"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Time
                          </p>
                          <p className="font-medium text-gray-900 text-sm">
                            {displayTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg break-words">
                        <Code className="w-4 h-4 text-cyan-600" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            User Agent
                          </p>
                          <p className="font-medium text-gray-900 text-sm">
                            {item.UserAgent || "Unknown Agent"}
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
            <p className="text-gray-500">No location data available.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LocationTab;
