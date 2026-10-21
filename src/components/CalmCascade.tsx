import React, { useState, useEffect } from "react";
import { GameState } from "../types";
import { motion } from "motion/react";
import { Wind, Heart } from "lucide-react";

interface CalmCascadeProps {
  onGameEnd: (state: GameState) => void;
}

export const CalmCascade: React.FC<CalmCascadeProps> = ({ onGameEnd }) => {
  const [breathState, setBreathState] = useState<"in" | "out">("in");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathState(prev => prev === "in" ? "out" : "in");
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-blue-50 p-12 rounded-[40px] border-4 border-blue-200 shadow-2xl text-center min-h-[500px] flex flex-col items-center justify-center">
      <motion.div
        animate={{
          scale: breathState === "in" ? 1.5 : 1,
          opacity: breathState === "in" ? 0.8 : 0.4,
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="w-48 h-48 bg-blue-400 rounded-full flex items-center justify-center text-white"
      >
        <Wind size={64} />
      </motion.div>

      <div className="mt-12 space-y-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-blue-900">
          {breathState === "in" ? "Breathe In" : "Breathe Out"}
        </h2>
        <p className="text-blue-600 font-medium">Focus on the rhythm of the cascade.</p>
      </div>

      <div className="mt-12 flex items-center gap-2 text-blue-400 font-bold uppercase text-xs">
        <Heart size={16} /> Emotional Regulation
      </div>

      <button 
        onClick={() => onGameEnd({ score: timer * 10, errors: 0, currentRule: "color", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 })}
        className="mt-12 bg-blue-900 text-white px-12 py-4 rounded-3xl font-black uppercase tracking-widest"
      >
        Finish Session
      </button>
    </div>
  );
};
