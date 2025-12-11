import React, { useEffect, useState } from 'react';
import './WireLoadingAnimation.css';

/**
 * Wire Loading Animation Component
 * Shows 2 blue wires with sparks jumping between them during loading
 * When loading completes, wires connect and fade out
 */
const WireLoadingAnimation = ({ isLoading = true, onComplete = null }) => {
  const [sparks, setSparks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Generate random sparks between the wires
  useEffect(() => {
    if (!isLoading) {
      setIsConnected(true);
      // Hide animation after connection completes
      const timer = setTimeout(() => {
        setSparks([]);
      }, 600);
      return () => clearTimeout(timer);
    }

    // Create sparks while loading
    const sparkInterval = setInterval(() => {
      const newSpark = {
        id: Math.random(),
        delay: Math.random() * 0.3,
        duration: 0.4 + Math.random() * 0.2,
      };
      setSparks((prev) => [...prev, newSpark]);

      // Remove spark after animation completes
      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
      }, (newSpark.duration + newSpark.delay) * 1000);
    }, 300);

    return () => clearInterval(sparkInterval);
  }, [isLoading]);

  // Handle completion
  useEffect(() => {
    if (!isLoading && onComplete) {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onComplete]);

  return (
    <div className={`wire-loading-container ${isLoading ? 'loading' : 'complete'}`}>
      {/* SVG Container */}
      <svg
        className="wire-svg"
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Left Wire */}
        <g className="wire-group">
          <path
            className="wire wire-left"
            d="M 30 60 Q 50 40, 70 60"
            stroke="#3B82F6"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Left Wire Glow */}
          <path
            className="wire-glow wire-glow-left"
            d="M 30 60 Q 50 40, 70 60"
            stroke="#60A5FA"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.3"
          />
        </g>

        {/* Right Wire */}
        <g className="wire-group">
          <path
            className="wire wire-right"
            d="M 130 60 Q 150 40, 170 60"
            stroke="#3B82F6"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Right Wire Glow */}
          <path
            className="wire-glow wire-glow-right"
            d="M 130 60 Q 150 40, 170 60"
            stroke="#60A5FA"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.3"
          />
        </g>

        {/* Connection Line (appears when connected) */}
        {isConnected && (
          <line
            className="connection-line"
            x1="70"
            y1="60"
            x2="130"
            y2="60"
            stroke="#3B82F6"
            strokeWidth="2"
          />
        )}

        {/* Sparks */}
        {sparks.map((spark) => (
          <g
            key={spark.id}
            className="spark-group"
            style={{
              animation: `spark-jump ${spark.duration}s ease-in-out ${spark.delay}s forwards`,
            }}
          >
            {/* Spark particle 1 */}
            <circle
              cx="100"
              cy="60"
              r="2"
              fill="#FBBF24"
              className="spark-particle"
              style={{
                animation: `spark-fade ${spark.duration}s ease-out ${spark.delay}s forwards`,
              }}
            />
            {/* Spark particle 2 */}
            <circle
              cx="100"
              cy="60"
              r="1.5"
              fill="#FCD34D"
              className="spark-particle"
              style={{
                animation: `spark-fade ${spark.duration}s ease-out ${spark.delay}s forwards`,
              }}
            />
            {/* Spark glow */}
            <circle
              cx="100"
              cy="60"
              r="3"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="1"
              className="spark-glow"
              style={{
                animation: `spark-glow-fade ${spark.duration}s ease-out ${spark.delay}s forwards`,
              }}
            />
          </g>
        ))}

        {/* Left Terminal */}
        <circle
          cx="30"
          cy="60"
          r="4"
          fill="#1F2937"
          stroke="#3B82F6"
          strokeWidth="1.5"
          className="terminal"
        />

        {/* Right Terminal */}
        <circle
          cx="170"
          cy="60"
          r="4"
          fill="#1F2937"
          stroke="#3B82F6"
          strokeWidth="1.5"
          className="terminal"
        />
      </svg>

      {/* Loading Text */}
      {isLoading && (
        <div className="loading-text">
          <p>Loading Products...</p>
          <div className="dots-animation">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      {/* Connected Text */}
      {isConnected && !isLoading && (
        <div className="connected-text">
          <p>Connected! ✓</p>
        </div>
      )}
    </div>
  );
};

export default WireLoadingAnimation;
