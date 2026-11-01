import React, { useState, useEffect } from "react";
import { GameState } from "../types";
import { motion } from "motion/react";

interface ReactionSpeedProps {
  onGameEnd: (state: GameState) => void;
}

export const ReactionSpeed: React.FC<ReactionSpeedProps> = ({ onGameEnd }) => {
  const [target, setTarget] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    if (clicks >= 5) {
      onGameEnd({ score, errors, currentRule: "shape", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 });
      return;
    }
    const timer = setTimeout(() => setTarget(Math.floor(Math.random() * 4)), 1000);
    return () => clearTimeout(timer);
  }, [target, clicks, score, errors, onGameEnd]);

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-black uppercase mb-4">Reaction Speed ({clicks}/5)</h2>
      <div className="grid grid-cols-2 gap-4 aspect-square">
        {[0, 1, 2, 3].map(i => (
          <button
            key={i}
            onClick={() => {
              if (i === target) {
                setScore(s => s + 10);
                setTarget(null);
              } else {
                setErrors(e => e + 1);
              }
              setClicks(c => c + 1);
            }}
            className={`rounded-3xl border-4 border-black ${i === target ? 'bg-red-500' : 'bg-stone-200'}`}
          />
        ))}
      </div>
    </div>
  );
};
