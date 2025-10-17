import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Hash,
  ExternalLink,
  Type,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SubscriptionComponent = ({ subscriptions = [] }) => {
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

  const firstSubscription = subscriptions[0] || {
    channelId: "UCexample123",
    channelUrl: "https://www.youtube.com/channel/UCexample123",
    channelTitle: "Example Channel",
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Understanding Your Subscriptions
                </h3>
                <p className="text-sm text-gray-600">
                  Here's how we break down each subscription entry
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
                          Subscription 1
                        </p>
                        <div className="space-y-8">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <Hash className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Channel ID:
                              </p>
                              <p className="text-gray-900 text-sm break-all">
                                {firstSubscription.channelId}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Channel URL:
                              </p>
                              <a
                                href={firstSubscription.channelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-700 text-sm hover:text-purple-700 hover:underline break-all"
                              >
                                {firstSubscription.channelUrl}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Type className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Channel Title:
                              </p>
                              <p className="text-gray-900">
                                {firstSubscription.channelTitle}
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
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-purple-800">
                            Channel Id
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Unique identifier for each YouTube channel
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
                            Channel URL
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Direct link derived from Channel ID
                            (youtube.com/channel/[ID])
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center space-x-4 mt-2"
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
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1d4ed8" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 flex-1">
                          <p className="text-sm font-medium text-blue-800">
                            Channel Title
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Name of the channel
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 mt-8"
      >
        {subscriptions.length > 0 ? (
          subscriptions.map((sub, idx) => {
            const isFirst = idx === 0;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.03 }}
                className={`
                  bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                  ${
                    isFirst ? "hidden" : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center p-4 rounded-xl shadow-lg border-2 border-blue-200/50 relative overflow-hidden bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/80">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30 backdrop-blur-sm"></div>
                    <div className="relative flex items-center bg-gradient-to-r from-blue-50/60 via-purple-50/40 to-pink-50/60 backdrop-blur-sm space-x-3 pl-8 rounded-lg py-2 pr-4">
                      <div className="p-2 bg-gradient-to-r from-blue-100/60 to-purple-100/60 backdrop-blur-sm rounded-lg border border-blue-200/40 shadow-sm">
                        <Users className="w-6 h-6 text-blue-700" />
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
                        Subscription #{idx + 1}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-r from-purple-100/70 to-blue-100/70 backdrop-blur-sm rounded-lg border border-purple-200/40">
                          <Hash className="w-4 h-4 text-purple-700" />
                        </div>
                        <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                          Channel ID
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50/60 to-blue-50/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                        <p className="font-semibold text-gray-800 text-sm break-all">
                          {sub.channelId}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-r from-green-100/70 to-emerald-100/70 backdrop-blur-sm rounded-lg border border-green-200/40">
                          <ExternalLink className="w-4 h-4 text-green-700" />
                        </div>
                        <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
                          Channel URL
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50/60 to-emerald-50/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/30">
                        <a
                          href={sub.channelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-indigo-700 text-sm hover:text-purple-700 hover:underline transition-colors duration-200 break-all"
                        >
                          {sub.channelUrl}
                        </a>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-r from-blue-100/70 to-indigo-100/70 backdrop-blur-sm rounded-lg border border-blue-200/40">
                          <Type className="w-4 h-4 text-blue-700" />
                        </div>
                        <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">
                          Channel Title
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30">
                        <p className="font-semibold text-gray-800 text-sm">
                          {sub.channelTitle}
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
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No subscriptions available.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SubscriptionComponent;
