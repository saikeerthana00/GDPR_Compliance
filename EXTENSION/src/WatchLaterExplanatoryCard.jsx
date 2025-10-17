import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  Clock,
  Hash,
  Calendar,
  Eye,
  ChevronDown,
  ChevronUp,
  Play,
  ExternalLink,
} from "lucide-react";

const WatchLaterExplanatoryCard = ({ tableRows }) => {
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

  // Get first entry for example data
  const firstEntry = tableRows?.[0] || {
    videoId: "dQw4w9WgXcQ",
    added: "2024-01-15",
    watched: "2024-01-20",
    isWatched: true,
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

      <div
        ref={explanationRef}
        className={`
          ${isSticky ? "fixed top-0 left-0 right-0 z-50" : "relative"}
          bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50
          rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm
          transition-all duration-300 ease-out
          ${isSticky ? "scale-98" : "scale-100"}
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
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-xl" />
        </div>

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Watch Later Guide
                </h3>
                <p className="text-sm text-gray-600">
                  Understanding your saved videos
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

          <div
            className={`transition-all duration-300 overflow-hidden ${
              isExplanationExpanded
                ? "max-h-screen opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Example Card */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-lg font-semibold text-gray-900">
                        Video #1
                      </p>
                      <div
                        className={`p-1 rounded-lg ${
                          firstEntry.isWatched
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {firstEntry.isWatched ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div className="flex items-center space-x-3 mb-20">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Hash className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Video ID:
                          </p>
                          <p className="text-gray-900 text-sm font-mono break-all">
                            {firstEntry.videoId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Added:
                          </p>
                          <p className="text-gray-900 text-sm">
                            {firstEntry.added}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            firstEntry.isWatched ? "bg-blue-100" : "bg-gray-100"
                          }`}
                        >
                          <Eye
                            className={`w-4 h-4 ${
                              firstEntry.isWatched
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Status:
                          </p>
                          <p className="text-gray-900 text-sm">
                            {firstEntry.isWatched
                              ? `Watched on ${firstEntry.watched}`
                              : "Not watched yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanations */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 min-h-[100px]">
                    <div className="flex-shrink-0">
                      <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
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
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 flex-1">
                      <p className="text-sm font-medium text-purple-800 mb-1">
                        Video Id & URL
                      </p>
                      <p className="text-xs text-purple-600 mb-2">
                        Unique ID from the video URL - use to construct full
                        YouTube link
                      </p>
                      <div className="bg-white/70 rounded p-2 text-xs space-y-1">
                        <div>
                          <span className="font-medium text-gray-700">
                            Generic format:
                          </span>
                          <br />
                          <code className="text-purple-700 bg-purple-50 px-1 rounded text-xs">
                            https://youtube.com/watch?v=VIDEO_ID
                          </code>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Example:
                          </span>
                          <br />
                          <a
                            href={`https://youtube.com/watch?v=${firstEntry.videoId}`}
                            className="text-blue-600 hover:text-blue-800 underline text-xs break-all inline-flex items-center gap-1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            youtube.com/watch?v={firstEntry.videoId}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 min-h-[64px]">
                    <div className="flex-shrink-0">
                      <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
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
                        Save Date
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Date and time when you added this video to your Watch
                        Later list
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 min-h-[64px]">
                    <div className="flex-shrink-0">
                      <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
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
                        Watch Status
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        <span className="text-green-600">✓ Watched</span> (with
                        date) or{" "}
                        <span className="text-red-600">⏳ Pending</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      <p className="text-sm font-medium text-orange-800">
                        Color Coding
                      </p>
                    </div>
                    <p className="text-xs text-orange-700">
                      <span className="text-green-700 font-medium">
                        Green cards
                      </span>{" "}
                      = Watched videos
                      <br />
                      <span className="text-red-700 font-medium">
                        Red cards
                      </span>{" "}
                      = Still pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return <ExplanationCard isSticky={isSticky} />;
};

export default WatchLaterExplanatoryCard;
