"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface NeuralPulseAnimationProps {
  isActive: boolean;
  intensity?: "low" | "medium" | "high";
  color?: string;
  className?: string;
}

export default function NeuralPulseAnimation({
  isActive,
  intensity = "medium",
  color = "blue",
  className = "",
}: NeuralPulseAnimationProps) {
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setPulseCount(prev => prev + 1);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  const getIntensityValues = () => {
    switch (intensity) {
      case "low":
        return { scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] };
      case "medium":
        return { scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] };
      case "high":
        return { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] };
      default:
        return { scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] };
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "from-blue-500/20 via-purple-500/20 to-blue-500/20";
      case "purple":
        return "from-purple-500/20 via-pink-500/20 to-purple-500/20";
      case "green":
        return "from-green-500/20 via-emerald-500/20 to-green-500/20";
      case "pink":
        return "from-pink-500/20 via-rose-500/20 to-pink-500/20";
      default:
        return "from-blue-500/20 via-purple-500/20 to-blue-500/20";
    }
  };

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {/* Main pulse ring */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-transparent"
        animate={{
          scale: getIntensityValues().scale,
          opacity: getIntensityValues().opacity,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: `radial-gradient(circle, ${getColorClasses().split(' ')[0].replace('from-', '').replace('/20', '')} 0%, transparent 70%)`,
        }}
      />
      
      {/* Secondary pulse rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-transparent"
          animate={{
            scale: [1, 1.5 + i * 0.3, 1],
            opacity: [0, 0.3 - i * 0.1, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
          style={{
            background: `radial-gradient(circle, ${getColorClasses().split(' ')[0].replace('from-', '').replace('/20', '')} 0%, transparent 60%)`,
          }}
        />
      ))}
      
      {/* Neural network lines */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              height: `${Math.random() * 200 + 100}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scaleY: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>
      
      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
