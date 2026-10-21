import React, { useState, useEffect } from "react";
import { GameState } from "../types";
import { motion } from "motion/react";

interface PatternMatchProps {
  onGameEnd: (state: GameState) => void;
}

export const PatternMatch: React.FC<PatternMatchProps> = ({ onGameEnd }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);

  const startNextLevel = () => {
    const next = Math.floor(Math.random() * 4);
    setSequence(prev => [...prev, next]);
    setUserSequence([]);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      // Play sequence logic (simplified for demo)
      const timer = setTimeout(() => setIsPlaying(false), sequence.length * 600);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, sequence]);

  const handlePadClick = (index: number) => {
    if (isPlaying) return;
    
    const nextUserSeq = [...userSequence, index];
    setUserSequence(nextUserSeq);

    if (index !== sequence[userSequence.length]) {
      setErrors(prev => prev + 1);
      setSequence([]);
      setUserSequence([]);
      return;
    }

    if (nextUserSeq.length === sequence.length) {
      setScore(prev => prev + 10);
      setTimeout(startNextLevel, 1000);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between mb-8 font-black uppercase text-sm">
        <div>Score: {score}</div>
        <div>Level: {sequence.length}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 aspect-square">
        {[0, 1, 2, 3].map(i => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePadClick(i)}
            onTouchStart={() => handlePadClick(i)}
            className={cn(
              "rounded-3xl border-4 border-black transition-colors",
              i === 0 && "bg-red-400",
              i === 1 && "bg-blue-400",
              i === 2 && "bg-green-400",
              i === 3 && "bg-yellow-400",
              isPlaying && sequence[userSequence.length] === i && "brightness-125 scale-105"
            )}
          />
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button 
          onClick={startNextLevel}
          className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase"
        >
          {sequence.length === 0 ? "Start" : "Next"}
        </button>
        <button 
          onClick={() => onGameEnd({ score, errors, currentRule: "color", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 })}
          className="bg-stone-200 px-6 py-4 rounded-2xl font-black uppercase"
        >
          Quit
        </button>
      </div>
    </div>
  );
};

// Helper for internal use since we can't import from lib/utils easily in this block without full path
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
