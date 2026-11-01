import React, { useState, useEffect, useCallback } from "react";
import { GameState } from "../types";
import { motion } from "motion/react";

interface GoNoGoProps {
  onGameEnd: (state: GameState) => void;
}

const SHAPES = ["CIRCLE", "SQUARE"];

export const GoNoGo: React.FC<GoNoGoProps> = ({ onGameEnd }) => {
  const [shape, setShape] = useState(SHAPES[0]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [rounds, setRounds] = useState(0);

  const generateNewRound = useCallback(() => {
    if (rounds >= 10) {
      onGameEnd({ score, errors, currentRule: "shape", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 });
      return;
    }
    setShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    setRounds((prev) => prev + 1);
  }, [rounds, score, errors, onGameEnd]);

  useEffect(() => {
    generateNewRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = (action: "TAP" | "WAIT") => {
    if (shape === "CIRCLE") {
      if (action === "TAP") setScore((prev) => prev + 10);
      else setErrors((prev) => prev + 1);
    } else {
      if (action === "TAP") setErrors((prev) => prev + 1);
      else setScore((prev) => prev + 5); // Reward for waiting
    }
    generateNewRound();
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
      <div className="flex justify-between mb-8 font-black uppercase text-sm">
        <div>Score: {score}</div>
      </div>
      
      <motion.div 
        key={shape}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-8xl font-black mb-12"
      >
        {shape === "CIRCLE" ? "●" : "■"}
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAction("TAP")}
          className="bg-green-400 p-6 rounded-2xl border-2 border-black font-black uppercase hover:bg-green-500 transition-all"
        >
          TAP (GO)
        </button>
        <button
          onClick={() => handleAction("WAIT")}
          className="bg-red-400 p-6 rounded-2xl border-2 border-black font-black uppercase hover:bg-red-500 transition-all"
        >
          WAIT (NO-GO)
        </button>
      </div>
    </div>
  );
};
