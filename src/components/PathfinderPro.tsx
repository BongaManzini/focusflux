import React, { useState, useEffect, useRef } from "react";
import { GameState } from "../types";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface PathfinderProProps {
  onGameEnd: (state: GameState) => void;
}

interface Dot {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "number" | "letter";
}

export const PathfinderPro: React.FC<PathfinderProProps> = ({ onGameEnd }) => {
  const [dots, setDots] = useState<Dot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [latencies, setLatencies] = useState<number[]>([]);
  const lastClickTimeRef = useRef(performance.now());

  const sequence = ["1", "A", "2", "B", "3", "C", "4", "D", "5", "E"];

  useEffect(() => {
    const newDots: Dot[] = sequence.map((label, i) => ({
      id: label,
      label,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      type: i % 2 === 0 ? "number" : "letter",
    }));
    setDots(newDots);
  }, []);

  const handleDotClick = (dot: Dot) => {
    const now = performance.now();
    const latency = now - lastClickTimeRef.current;

    if (dot.label === sequence[currentIndex]) {
      setScore(s => s + 10);
      setLatencies(prev => [...prev, latency]);
      setCurrentIndex(prev => prev + 1);
      lastClickTimeRef.current = now;

      if (currentIndex === sequence.length - 1) {
        // Game complete
        onGameEnd({ score: score + 10, errors, currentRule: "color", lastRuleChange: 0, inhibitionLatency: latencies, fidgetMetric: 0 });
      }
    } else {
      setErrors(e => e + 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-stone-50 h-[600px] rounded-[40px] border-4 border-black relative overflow-hidden shadow-2xl">
      <div className="absolute top-6 left-6 flex gap-4 z-10">
        <div className="bg-black text-white px-4 py-2 rounded-full font-black text-xs border-2 border-black">SCORE: {score}</div>
        <div className="bg-red-500 px-4 py-2 rounded-full font-black text-xs border-2 border-black text-white">ERRORS: {errors}</div>
        <div className="bg-yellow-400 px-4 py-2 rounded-full font-black text-xs border-2 border-black">NEXT: {sequence[currentIndex]}</div>
      </div>

      <div className="absolute inset-0">
        {dots.map((dot, i) => (
          <motion.button
            key={dot.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDotClick(dot)}
            onTouchStart={() => handleDotClick(dot)}
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-4 border-black flex items-center justify-center font-black text-lg transition-colors",
              dots.indexOf(dot) < currentIndex ? "bg-green-400 text-white" : "bg-white text-black"
            )}
          >
            {dot.label}
          </motion.button>
        ))}

        {/* Draw lines between connected dots */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full">
          {dots.slice(0, currentIndex).map((dot, i) => {
            if (i === 0) return null;
            const prev = dots[i - 1];
            return (
              <line
                key={i}
                x1={`${prev.x}%`}
                y1={`${prev.y}%`}
                x2={`${dot.x}%`}
                y2={`${dot.y}%`}
                stroke="black"
                strokeWidth="4"
                strokeDasharray="8 8"
              />
            );
          })}
        </svg>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full px-8 flex justify-between items-center">
        <div className="text-stone-400 font-black uppercase text-xs tracking-widest">Focus: Executive Flexibility</div>
        <button 
          onClick={() => onGameEnd({ score, errors, currentRule: "color", lastRuleChange: 0, inhibitionLatency: latencies, fidgetMetric: 0 })}
          className="bg-black text-white px-8 py-3 rounded-2xl font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          Quit
        </button>
      </div>
    </div>
  );
};
