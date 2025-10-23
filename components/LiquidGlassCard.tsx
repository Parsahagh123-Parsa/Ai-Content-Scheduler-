"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface LiquidGlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: string;
  onClick?: () => void;
}

export default function LiquidGlassCard({
  children,
  className = "",
  hover = true,
  glow = false,
  gradient = "from-white/10 to-white/5",
  onClick,
}: LiquidGlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${gradient}
        backdrop-blur-xl border border-white/20
        shadow-2xl shadow-black/10
        ${hover ? "cursor-pointer" : ""}
        ${className}
      `}
      whileHover={hover ? {
        scale: 1.02,
        y: -2,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
            "linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))",
            "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 20px rgba(59, 130, 246, 0.3)",
              "0 0 40px rgba(59, 130, 246, 0.5)",
              "0 0 20px rgba(59, 130, 246, 0.3)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Subtle border animation */}
      <motion.div
        className="absolute inset-0 rounded-2xl border border-white/30"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
