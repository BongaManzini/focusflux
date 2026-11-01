import React, { useState, useEffect, useCallback } from "react";
import { GameState } from "../types";
import { motion } from "motion/react";

interface FlankerTaskProps {
  onGameEnd: (state: GameState) => void;
}

const DIRECTIONS = ["LEFT", "RIGHT"];

export const FlankerTask: React.FC<FlankerTaskProps> = ({ onGameEnd }) => {
  const [center, setCenter] = useState(DIRECTIONS[0]);
  const [flankers, setFlankers] = useState(DIRECTIONS[0]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [rounds, setRounds] = useState(0);

  const generateNewRound = useCallback(() => {
    if (rounds >= 10) {
      onGameEnd({ score, errors, currentRule: "shape", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 });
      return;
    }
    const centerDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const flankerDir = Math.random() > 0.5 ? centerDir : (centerDir === "LEFT" ? "RIGHT" : "LEFT");
    setCenter(centerDir);
    setFlankers(flankerDir);
    setRounds((prev) => prev + 1);
  }, [rounds, score, errors, onGameEnd]);

  useEffect(() => {
    generateNewRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = (direction: string) => {
    if (direction === center) {
      setScore((prev) => prev + 10);
    } else {
      setErrors((prev) => prev + 1);
    }
    generateNewRound();
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
      <div className="flex justify-between mb-8 font-black uppercase text-sm">
        <div>Score: {score}</div>
      </div>
      
      <motion.div 
        key={center + flankers}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-6xl font-black mb-12 flex justify-center gap-4"
      >
        <span>{flankers === "LEFT" ? "←" : "→"}</span>
        <span>{center === "LEFT" ? "←" : "→"}</span>
        <span>{flankers === "LEFT" ? "←" : "→"}</span>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAction("LEFT")}
          className="bg-stone-100 p-6 rounded-2xl border-2 border-black font-black uppercase hover:bg-stone-200 transition-all"
        >
          ← LEFT
        </button>
        <button
          onClick={() => handleAction("RIGHT")}
          className="bg-stone-100 p-6 rounded-2xl border-2 border-black font-black uppercase hover:bg-stone-200 transition-all"
        >
          RIGHT →
        </button>
      </div>
    </div>
  );
};
