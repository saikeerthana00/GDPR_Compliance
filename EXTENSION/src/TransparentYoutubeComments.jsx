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
  MessageCircleMore,
  CircleDollarSign,
} from "lucide-react";

const CommentsSection = ({ data }) => {
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const explanationRef = useRef(null);
  const placeholderRef = useRef(null);
  const sentinelRef = useRef(null);

  // Get all comments from data
  const allComments = data || [];

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

  const firstEntry = allComments[0] || {};

  // Extract comment text from JSON format
  const extractCommentText = (text) => {
    try {
      const cleanedText = text.replace(/""/g, '"');
      const parsed = JSON.parse(cleanedText);
      return parsed.text || text;
    } catch (e) {
      try {
        const match = text.match(/""text"":""(.+?)""/);
        return match && match[1] ? match[1] : text;
      } catch (e2) {
        return text;
      }
    }
  };
  const firstVideoUrl = firstEntry.videoId
    ? `https://www.youtube.com/watch?v=${firstEntry.videoId}`
    : "N/A";
  const firstChannelUrl = firstEntry.channelId
    ? `https://www.youtube.com/channel/${firstEntry.channelId}`
    : "N/A";

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
          bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50
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
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-xl" />
        </div>

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <MessageCircleMore className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Understanding Your Comments History
                </h3>
                <p className="text-sm text-gray-600">
                  Each field’s actual value and a brief description
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
                <div className="flex items-center p-4 rounded-xl shadow-lg border-2 border-blue-200/50 relative overflow-hidden bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/80">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30 backdrop-blur-sm"></div>
                  <div className="relative flex items-center bg-gradient-to-r from-blue-50/60 via-purple-50/40 to-pink-50/60 backdrop-blur-sm space-x-3 pl-8 rounded-lg py-2 pr-4">
                    <div className="p-2 bg-gradient-to-r from-blue-100/60 to-purple-100/60 backdrop-blur-sm rounded-lg border border-blue-200/40 shadow-sm">
                      <MessageCircleMore className="w-6 h-6 text-blue-700" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
                      Comment #{1}
                    </h3>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Comment Text */}
                    <motion.div
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="p-2 bg-purple-100 rounded-full flex items-center justify-center">
                        <MessageCircleMore className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-purple-800">
                          Comment Text:
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                          {firstEntry.text
                            ? extractCommentText(firstEntry.text)
                            : "N/A"}
                        </p>
                        <p className="mt-2 text-xs text-purple-600">
                          The actual content of the comment left by the user.
                        </p>
                      </div>
                    </motion.div>

                    {/* Comment ID */}
                    <motion.div
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="p-2 bg-blue-100 rounded-full flex items-center justify-center">
                        <Info className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">
                          Comment ID:
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                          {firstEntry.commentId || "N/A"}
                        </p>
                        <p className="mt-2 text-xs text-blue-600">
                          A unique identifier for this specific comment entry.
                        </p>
                      </div>
                    </motion.div>

                    {/* Channel ID */}
                    <motion.div
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="p-2 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          Channel ID:
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                          {firstEntry.channelId || "N/A"}
                        </p>
                        <p className="mt-2 text-xs text-green-600">
                          The identifier of the YouTube channel who posted the
                          comment.You can visit the channel by going to
                          {" www.youtube.com/channel/{channelId}"}.
                        </p>
                      </div>
                    </motion.div>

                    {/* Timestamp */}
                    <motion.div
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="p-2 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">
                          Timestamp:
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                          {firstEntry.timestampString || "N/A"}
                        </p>
                        <p className="mt-2 text-xs text-blue-600">
                          The date and time when the comment was posted.
                        </p>
                      </div>
                    </motion.div>

                    {/* Price */}
                    <motion.div
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="p-2 bg-yellow-100 rounded-full flex items-center justify-center">
                        <CircleDollarSign className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800">
                          Price:
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                          {firstEntry.price || "N/A"}
                        </p>
                        <p className="mt-2 text-xs text-yellow-600">
                          The price associated with the item discussed in the
                          comment, if available.
                        </p>
                      </div>
                    </motion.div>

                    {/* Parent Comment ID */}
                    <motion.div
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <div className="p-2 bg-gray-100 rounded-full flex items-center justify-center">
                        <Info className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          Parent Comment ID:
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                          {firstEntry.parentId || "N/A"}
                        </p>
                        <p className="mt-2 text-xs text-gray-600">
                          If this comment is a reply, this is the ID of the
                          parent comment.
                        </p>
                      </div>
                    </motion.div>

                    {/* Video ID + URL */}
                    <motion.div
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="p-2 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-indigo-800">
                          Video ID:
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                          {firstEntry.videoId || "N/A"}
                        </p>
                        <p className="mt-2 text-xs text-indigo-600">
                          <span className="font-medium">Video URL:</span>{" "}
                          {firstVideoUrl !== "N/A" ? (
                            <a
                              href={firstVideoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {firstVideoUrl}
                            </a>
                          ) : (
                            "N/A"
                          )}{" "}
                          {"www.youtube.com/watch?v={videoId}"}
                        </p>
                      </div>
                    </motion.div>

                    {/* Channel URL */}
                    <motion.div
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <div className="p-2 bg-teal-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-teal-800">
                          Channel URL:
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                          {firstChannelUrl !== "N/A" ? (
                            <a
                              href={firstChannelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {firstChannelUrl}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </p>
                        <p className="mt-2 text-xs text-teal-600">
                          A clickable link to the YouTube channel that posted
                          the comment.
                        </p>
                      </div>
                    </motion.div>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 mt-8"
      >
        {allComments.length > 0 ? (
          allComments.map((item, index) => {
            const displayTime = item.timestampString;
            item.videoUrl =
              item.videoUrl ||
              `https://www.youtube.com/watch?v=${item.videoId}`;
            item.channelUrl =
              item.channelUrl ||
              `https://www.youtube.com/channel/${item.channelId}`;

            // Extract text from JSON string format with double quotes
            let commentText = item.text;
            try {
              // Replace double quotes with single quotes first
              const cleanedText = item.text.replace(/""/g, '"');
              const parsed = JSON.parse(cleanedText);
              commentText = parsed.text || item.text;
            } catch (e) {
              // If parsing fails, try alternative parsing or use original text
              try {
                // Try to extract text between the double quotes manually
                const match = item.text.match(/""text"":""(.+?)""/);
                if (match && match[1]) {
                  commentText = match[1];
                } else {
                  commentText = item.text;
                }
              } catch (e2) {
                commentText = item.text;
              }
            }

            const isFirst = index === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`
                  bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-gray-200 hover:border-gray-300
                  ${isFirst ? "hidden" : ""}
                `}
              >
                <div className="p-6 space-y-4">
                  {/* Entry Number Header */}
                  <div className="flex items-center p-4 rounded-xl shadow-lg border-2 border-blue-200/50 relative overflow-hidden bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/80">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30 backdrop-blur-sm"></div>
                    <div className="relative flex items-center bg-gradient-to-r from-blue-50/60 via-purple-50/40 to-pink-50/60 backdrop-blur-sm space-x-3 pl-8 rounded-lg py-2 pr-4">
                      <div className="p-2 bg-gradient-to-r from-blue-100/60 to-purple-100/60 backdrop-blur-sm rounded-lg border border-blue-200/40 shadow-sm">
                        <MessageCircleMore className="w-6 h-6 text-blue-700" />
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
                        Comment #{index + 1}
                      </h3>
                    </div>
                  </div>

                  {/* Comment Text - Full Width */}
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-200">
                    <div className="p-2 bg-white rounded-lg shadow-sm mt-1">
                      <Info className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">
                        Comment Text
                      </p>
                      <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                        {commentText}
                      </p>
                    </div>
                  </div>

                  {/* Grid layout for all fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Comment ID */}
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-200">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Info className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">
                          Comment ID
                        </p>
                        <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                          {item.commentId}
                        </p>
                      </div>
                    </div>

                    {/* Channel ID */}
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-200">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">
                          Channel ID
                        </p>
                        <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                          {item.channelId}
                        </p>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-200">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
                          Timestamp
                        </p>
                        <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                          {displayTime}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100 hover:border-yellow-200 transition-all duration-200">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CircleDollarSign className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wider mb-1">
                          Price
                        </p>
                        <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                          {item.price || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Parent Comment ID */}
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Info className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">
                          Parent Comment ID
                        </p>
                        <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                          {item.parentId || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Video ID */}
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-all duration-200">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Video className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">
                          Video ID
                        </p>
                        <p className="font-semibold text-gray-800 text-xs leading-relaxed truncate">
                          {item.videoId}
                        </p>
                      </div>
                    </div>

                    {/* Video URL */}
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 hover:border-red-200 transition-all duration-200">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <ExternalLink className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-red-600 font-semibold uppercase tracking-wider mb-1">
                          Video URL
                        </p>
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-red-600 text-xs hover:text-red-800 transition-colors duration-200 truncate block hover:underline"
                          title={item.videoUrl}
                        >
                          {item.videoUrl || "N/A"}
                        </a>
                      </div>
                    </div>

                    {/* Channel URL */}
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100 hover:border-teal-200 transition-all duration-200">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Users className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider mb-1">
                          Channel URL
                        </p>
                        <a
                          href={item.channelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-teal-600 text-xs hover:text-teal-800 transition-colors duration-200 truncate block hover:underline"
                          title={item.channelUrl}
                        >
                          {item.channelUrl || "N/A"}
                        </a>
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
            <MessageCircleMore className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No comments history available.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CommentsSection;
