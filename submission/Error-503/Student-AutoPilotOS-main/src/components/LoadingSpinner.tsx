import React from "react";
import { motion } from "motion/react";

interface LoadingSpinnerProps {
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label = "Synthesizing AI Environment..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-16 h-16">
        {/* Glowing pulse ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl"
        />

        {/* Outer neon spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 rounded-full border-t-2 border-r-2 border-indigo-500 border-b border-l border-transparent"
        />

        {/* Inner reverse spinning ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-2 rounded-full border-t border-l border-violet-500 border-b-2 border-r border-transparent"
        />

        {/* Center dot */}
        <div className="absolute inset-[18px] rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs font-mono tracking-widest text-slate-400 capitalize"
      >
        {label}
      </motion.p>
    </div>
  );
};
