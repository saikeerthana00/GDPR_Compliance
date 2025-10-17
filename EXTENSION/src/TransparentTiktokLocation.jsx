import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  Signal,
} from "lucide-react";

const TransparentTiktokLocation = ({ logins }) => {
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
          console.log(
            `[IntersectionObserver] Setting sticky: ${shouldBeSticky}`
          );
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

  const firstEntry = logins[0] || {};

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
          bg-gradient-to-r from-green-50 via-blue-50 to-purple-50
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
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
        </div>

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Understanding Your Login Data
                </h3>
                <p className="text-sm text-gray-600">
                  Here's how we break down each login entry
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
                        <p className="text-lg font-semibold text-gray-900 mb-4">
                          Login 1
                        </p>
                        <div className="space-y-14">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-700">
                                IP Address:
                              </p>
                              <p className="text-gray-900 text-sm break-all">
                                {firstEntry.IP || "192.168.1.1"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Login Time:
                              </p>
                              <p className="text-gray-900 text-sm">
                                {new Date(
                                  firstEntry.Date || Date.now()
                                ).toUTCString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Smartphone className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Device Model:
                              </p>
                              <p className="text-gray-900 text-sm">
                                {firstEntry.DeviceModel || "iPhone14,6"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Monitor className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Operating System:
                              </p>
                              <p className="text-gray-900 text-sm">
                                {firstEntry.DeviceSystem || "iOS 17.6.1"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                              <Wifi className="w-4 h-4 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Network Type:
                              </p>
                              <p className="text-gray-900 text-sm">
                                {firstEntry.NetworkType || "Wi-Fi"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                              <Signal className="w-4 h-4 text-pink-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Carrier:
                              </p>
                              <p className="text-gray-900 text-sm">
                                {firstEntry.Carrier || "Not Specified"}
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
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-blue-800">
                            Network Identity (IP Address)
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Your unique network identifier that reveals your
                            approximate geographic location and internet
                            provider
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
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-purple-800">
                            Access Timestamp (Login Time)
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Precise date and time when you accessed TikTok,
                            helping track usage patterns and login frequency
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
                                <stop offset="0%" stopColor="#06b6d4" />
                                <stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-green-800">
                            Device Hardware (Device Model)
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Your specific device model (e.g., iPhone14,6) used
                            for hardware-specific optimizations and analytics
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
                                <stop offset="0%" stopColor="#f97316" />
                                <stop offset="100%" stopColor="#ef4444" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-orange-800">
                            Operating System (Device System)
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            Your device's OS version (e.g., iOS 17.6.1) for
                            compatibility checks and feature availability
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
                                <stop offset="0%" stopColor="#14b8a6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-teal-800">
                            Connection Type (Network Type)
                          </p>
                          <p className="text-xs text-teal-600 mt-1">
                            How you connected to the internet (Wi-Fi, 4G, 5G)
                            affecting video quality and data usage patterns
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center space-x-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="flex-shrink-0">
                          <svg
                            className="w-12 h-8"
                            viewBox="0 0 48 32"
                            fill="none"
                          >
                            <path
                              d="M2 16 L38 16 M30 8 L38 16 L30 24"
                              stroke="url(#gradient6)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <defs>
                              <linearGradient
                                id="gradient6"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#ec4899" />
                                <stop offset="100%" stopColor="#f43f5e" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-pink-800">
                            Mobile Carrier (Carrier)
                          </p>
                          <p className="text-xs text-pink-600 mt-1">
                            Your cellular service provider information, used for
                            network optimization and regional analytics
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
    <div className="space-y-6 pb-20">
      <ExplanationCard isSticky={isSticky} />

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
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">
                          Login {idx + 1}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Globe className="w-3.5 h-3.5 mr-1.5" />
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
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No login data available.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TransparentTiktokLocation;
