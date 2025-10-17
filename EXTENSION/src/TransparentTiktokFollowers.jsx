import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Eye,
  Shield,
} from "lucide-react";

const TransparentTiktokFollowers = ({
  followersList = [],
  followingList = [],
}) => {
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

  const firstFollower = followersList[0] || {};
  const firstFollowing = followingList[0] || {};

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return new Date().toISOString();

    const date = new Date(dateString);
    return {
      fullDateTime: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      shortDateTime: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      dateOnly: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      timeOnly: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      isoDateTime: date.toISOString().replace("T", " ").substring(0, 19),
    };
  };

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
          bg-gradient-to-r from-blue-50 via-purple-50 to-green-50
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
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-xl" />
        </div>

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Understanding Your Social Activity
                </h3>
                <p className="text-sm text-gray-600">
                  Here's how we analyze each follower and following entry
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
                            Sample Activity Entry
                          </p>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Activity Type:
                              </p>
                              <p className="text-gray-900 text-sm">
                                {followersList.length > 0
                                  ? "Follower"
                                  : "Following"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Date & Time:
                              </p>
                              <p className="text-gray-900 text-xs">
                                {
                                  formatDateTime(
                                    firstFollower.Date || firstFollowing.Date
                                  ).isoDateTime
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Action:
                              </p>
                              <p className="text-gray-900 text-sm">
                                {followersList.length > 0
                                  ? "Gained Follower"
                                  : "Followed User"}
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
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-blue-800">
                            Activity Type
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Whether you gained a follower or followed someone
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
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#34d399" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-green-800">
                            Date & Time
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            The exact date and time when the activity occurred
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
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#a855f7" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-purple-800">
                            Action Taken
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            The specific social action that was performed
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
    <div className="space-y-8 mt-8 max-w-6xl mx-auto p-6">
      <ExplanationCard isSticky={isSticky} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8">
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
                const dateTimeInfo = formatDateTime(item.Date);
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
                                ? `Follower Activity #${index + 1}`
                                : `Following Activity #${index + 1}`}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1.5" />
                              {dateTimeInfo.fullDateTime}
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
                            <Calendar
                              className={`w-4 h-4 text-${
                                isFollower ? "blue" : "purple"
                              }-600 mt-0.5 flex-shrink-0`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Activity Date
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                {dateTimeInfo.dateOnly}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                            <Clock className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Activity Time
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                {dateTimeInfo.timeOnly}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                          <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                              Action Performed
                            </p>
                            <p className="font-medium text-gray-900 text-sm">
                              {isFollower ? "Gained Follower" : "Followed User"}
                            </p>
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
  );
};

export default TransparentTiktokFollowers;
