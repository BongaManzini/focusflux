import React, { useState, useEffect, useCallback } from "react";
import { GameState } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface StroopEffectProps {
  onGameEnd: (state: GameState) => void;
}

const COLORS = [
  { name: "RED", color: "text-red-500" },
  { name: "BLUE", color: "text-blue-500" },
  { name: "GREEN", color: "text-green-500" },
  { name: "YELLOW", color: "text-yellow-500" },
];

export const StroopEffect: React.FC<StroopEffectProps> = ({ onGameEnd }) => {
  const [word, setWord] = useState(COLORS[0]);
  const [inkColor, setInkColor] = useState(COLORS[1]);
  const [options, setOptions] = useState(COLORS);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [rounds, setRounds] = useState(0);

  const generateNewRound = useCallback(() => {
    if (rounds >= 10) {
      onGameEnd({ score, errors, currentRule: "color", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 });
      return;
    }
    const wordIdx = Math.floor(Math.random() * COLORS.length);
    let inkIdx = Math.floor(Math.random() * COLORS.length);
    while (inkIdx === wordIdx) {
      inkIdx = Math.floor(Math.random() * COLORS.length);
    }
    setWord(COLORS[wordIdx]);
    setInkColor(COLORS[inkIdx]);
    setTimeLeft(5);
    setRounds((prev) => prev + 1);
  }, [rounds, score, errors, onGameEnd]);

  useEffect(() => {
    generateNewRound();
  }, [generateNewRound]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setErrors((prev) => prev + 1);
      generateNewRound();
    }
  }, [timeLeft, generateNewRound]);

  const handleOptionClick = (selectedColor: typeof COLORS[0]) => {
    if (selectedColor.name === inkColor.name) {
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
        <div>Time: {timeLeft}s</div>
      </div>
      
      <motion.div 
        key={word.name + inkColor.name}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-6xl font-black mb-12 ${inkColor.color}`}
      >
        {word.name}
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.name}
            onClick={() => handleOptionClick(option)}
            className="bg-stone-100 p-6 rounded-2xl border-2 border-black font-black uppercase hover:bg-stone-200 transition-all"
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
};
