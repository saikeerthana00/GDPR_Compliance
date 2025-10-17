import React, { useMemo, useState, useEffect, useRef } from "react";
import ReactWordCloud from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

/**
 * @param {{ terms: string[] }} props
 * terms: array of search‐query strings, e.g. ["apple", "banana", "apple", "cherry"]
 */
export default function SearchWordCloud({ terms }) {
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const cloudRef = useRef(null);

  // Compute raw frequencies
  const rawWords = useMemo(() => {
    const freq = terms.reduce((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, /** @type Record<string, number> */ ({}));
    return Object.entries(freq).map(([text, value]) => ({ text, value }));
  }, [terms]);

  // Take top 100 most frequent terms to speed up rendering
  const words = useMemo(() => {
    const sorted = rawWords.slice().sort((a, b) => b.value - a.value);
    return sorted.slice(0, 100);
  }, [rawWords]);

  const options = {
    rotations: 2,
    rotationAngles: [0, 90],
    fontSizes: [20, 80],
    padding: 2,
    tooltipOptions: {
      animation: null,
    },
    maxWords: 100,
    transitionDuration: 0, // disable animations
    onWordCloudSuccess: () => {
      // Callback when word cloud is successfully rendered
      setLoading(false);
      setIsInitialLoad(false);
    },
  };

  useEffect(() => {
    // Show loading when words change (but not on initial load)
    if (!isInitialLoad) {
      setLoading(true);
    }

    // Fallback timeout in case onWordCloudSuccess doesn't fire
    const timeout = setTimeout(() => {
      setLoading(false);
      setIsInitialLoad(false);
    }, 2000); // 2 second fallback

    return () => clearTimeout(timeout);
  }, [words, isInitialLoad]);

  // Additional check using Intersection Observer to detect when content is visible
  useEffect(() => {
    if (!cloudRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Give a small delay to ensure rendering is complete
            setTimeout(() => {
              const svgElement = entry.target.querySelector("svg");
              if (svgElement && svgElement.children.length > 0) {
                setLoading(false);
                setIsInitialLoad(false);
              }
            }, 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(cloudRef.current);

    return () => observer.disconnect();
  }, []);

  // Show loading if no words to display
  if (words.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md text-center text-gray-600">
        No words to display
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md" ref={cloudRef}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-gray-600">Loading word cloud...</div>
          </div>
        </div>
      )}
      <div className="h-[450px] relative">
        <ReactWordCloud words={words} options={options} />
      </div>
    </div>
  );
}
