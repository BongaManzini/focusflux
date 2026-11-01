import React, { useState, useEffect } from "react";
import { GameState } from "../types";
import { motion } from "motion/react";

interface VisualMemoryProps {
  onGameEnd: (state: GameState) => void;
}

export const VisualMemory: React.FC<VisualMemoryProps> = ({ onGameEnd }) => {
  const [grid, setGrid] = useState<number[]>([]);
  const [active, setActive] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    // Initialize grid
    setGrid(Array.from({ length: 9 }, (_, i) => i));
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-black uppercase mb-4">Visual Memory</h2>
      <div className="grid grid-cols-3 gap-4 aspect-square">
        {grid.map(i => (
          <div key={i} className="bg-stone-200 rounded-2xl border-2 border-black" />
        ))}
      </div>
    </div>
  );
};
