import React, { useState, useEffect } from "react";
import { GameState } from "../types";
import { motion } from "motion/react";

interface BodyScanProps {
  onGameEnd: (state: GameState) => void;
}

export const BodyScan: React.FC<BodyScanProps> = ({ onGameEnd }) => {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onGameEnd({ score: 0, errors: 0, currentRule: "color", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 });
    }
  }, [timeLeft, onGameEnd]);

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
      <h2 className="text-2xl font-black uppercase mb-4">Body Scan ({timeLeft}s)</h2>
      <p className="text-lg font-medium text-stone-600 mb-8">
        Focus on your feet. Feel the ground beneath you. Slowly move your attention up to your legs, torso, and head.
      </p>
      <button 
        onClick={() => onGameEnd({ score: 0, errors: 0, currentRule: "color", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 })}
        className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase"
      >
        Finish
      </button>
    </div>
  );
};
