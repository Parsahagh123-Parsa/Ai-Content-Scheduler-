"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AmbientGradientBackgroundProps {
  creatorType?: string;
  className?: string;
}

const creatorTypeGradients = {
  fitness: {
    primary: "from-emerald-500/20 via-green-500/20 to-teal-500/20",
    secondary: "from-lime-500/10 via-emerald-500/10 to-green-500/10",
    accent: "from-green-400/30 via-emerald-400/30 to-teal-400/30",
  },
  tech: {
    primary: "from-blue-500/20 via-cyan-500/20 to-indigo-500/20",
    secondary: "from-sky-500/10 via-blue-500/10 to-indigo-500/10",
    accent: "from-blue-400/30 via-cyan-400/30 to-indigo-400/30",
  },
  beauty: {
    primary: "from-pink-500/20 via-rose-500/20 to-purple-500/20",
    secondary: "from-fuchsia-500/10 via-pink-500/10 to-rose-500/10",
    accent: "from-pink-400/30 via-rose-400/30 to-purple-400/30",
  },
  gaming: {
    primary: "from-purple-500/20 via-violet-500/20 to-indigo-500/20",
    secondary: "from-violet-500/10 via-purple-500/10 to-indigo-500/10",
    accent: "from-purple-400/30 via-violet-400/30 to-indigo-400/30",
  },
  cooking: {
    primary: "from-orange-500/20 via-red-500/20 to-yellow-500/20",
    secondary: "from-amber-500/10 via-orange-500/10 to-red-500/10",
    accent: "from-orange-400/30 via-red-400/30 to-yellow-400/30",
  },
  travel: {
    primary: "from-cyan-500/20 via-blue-500/20 to-teal-500/20",
    secondary: "from-sky-500/10 via-cyan-500/10 to-blue-500/10",
    accent: "from-cyan-400/30 via-blue-400/30 to-teal-400/30",
  },
  business: {
    primary: "from-slate-500/20 via-gray-500/20 to-zinc-500/20",
    secondary: "from-gray-500/10 via-slate-500/10 to-zinc-500/10",
    accent: "from-slate-400/30 via-gray-400/30 to-zinc-400/30",
  },
  education: {
    primary: "from-indigo-500/20 via-blue-500/20 to-purple-500/20",
    secondary: "from-blue-500/10 via-indigo-500/10 to-purple-500/10",
    accent: "from-indigo-400/30 via-blue-400/30 to-purple-400/30",
  },
  default: {
    primary: "from-blue-500/20 via-purple-500/20 to-pink-500/20",
    secondary: "from-purple-500/10 via-blue-500/10 to-pink-500/10",
    accent: "from-blue-400/30 via-purple-400/30 to-pink-400/30",
  },
};

export default function AmbientGradientBackground({
  creatorType = "default",
  className = "",
}: AmbientGradientBackgroundProps) {
  const [isVisible, setIsVisible] = useState(true);
  const gradients = creatorTypeGradients[creatorType as keyof typeof creatorTypeGradients] || creatorTypeGradients.default;

  useEffect(() => {
    // Smooth transition when creator type changes
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [creatorType]);

  return (
    <motion.div
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Primary gradient layer */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradients.primary}`}
        animate={{
          background: [
            `linear-gradient(45deg, ${gradients.primary.split(' ')[0]}, ${gradients.primary.split(' ')[2]}, ${gradients.primary.split(' ')[4]})`,
            `linear-gradient(135deg, ${gradients.primary.split(' ')[2]}, ${gradients.primary.split(' ')[4]}, ${gradients.primary.split(' ')[0]})`,
            `linear-gradient(225deg, ${gradients.primary.split(' ')[4]}, ${gradients.primary.split(' ')[0]}, ${gradients.primary.split(' ')[2]})`,
            `linear-gradient(315deg, ${gradients.primary.split(' ')[0]}, ${gradients.primary.split(' ')[2]}, ${gradients.primary.split(' ')[4]})`,
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Secondary gradient layer */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-tl ${gradients.secondary}`}
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Accent gradient layer */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradients.accent}`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Floating orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-32 h-32 rounded-full bg-gradient-to-r ${gradients.accent} blur-xl`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [0.5, 1.2, 0.5],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}
      
      {/* Subtle noise texture */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        animate={{
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
