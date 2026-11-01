import React, { useState } from "react";
import { GameState } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Eye, Hand, Volume2, Wind, Utensils, CheckCircle2 } from "lucide-react";

interface GroundingGridProps {
  onGameEnd: (state: GameState) => void;
}

const STAGES = [
  { count: 5, label: "Things you can see", icon: Eye, color: "bg-blue-400" },
  { count: 4, label: "Things you can touch", icon: Hand, color: "bg-green-400" },
  { count: 3, label: "Things you can hear", icon: Volume2, color: "bg-yellow-400" },
  { count: 2, label: "Things you can smell", icon: Wind, color: "bg-purple-400" },
  { count: 1, label: "Thing you can taste", icon: Utensils, color: "bg-red-400" },
];

export const GroundingGrid: React.FC<GroundingGridProps> = ({ onGameEnd }) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentStage = STAGES[stageIndex];

  const handleNext = () => {
    if (currentCount < currentStage.count - 1) {
      setCurrentCount(prev => prev + 1);
    } else if (stageIndex < STAGES.length - 1) {
      setStageIndex(prev => prev + 1);
      setCurrentCount(0);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-green-100 p-8 rounded-full mb-8"
        >
          <CheckCircle2 size={80} className="text-green-500" />
        </motion.div>
        <h2 className="text-4xl font-black uppercase mb-4">Grounded & Present</h2>
        <p className="text-xl text-stone-600 mb-12 max-w-md">
          You've successfully completed the grounding exercise. Take a deep breath and carry this calm with you.
        </p>
        <button
          onClick={() => onGameEnd({ score: 100, errors: 0, time: 0 })}
          className="bg-black text-white px-12 py-4 rounded-3xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
        >
          Finish Session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 select-none">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-12">
          <div className="flex gap-2">
            {STAGES.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full transition-all ${
                  i <= stageIndex ? STAGES[i].color : "bg-stone-200"
                }`}
              />
            ))}
          </div>
          <span className="font-black uppercase text-xs tracking-widest text-stone-400">
            Stage {stageIndex + 1} of 5
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className={`inline-flex p-6 rounded-[32px] ${currentStage.color} text-white mb-8 shadow-lg`}>
              <currentStage.icon size={48} />
            </div>
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">
              Identify {currentStage.count - currentCount}
            </h2>
            <p className="text-2xl font-bold text-stone-500 uppercase tracking-tight mb-12">
              {currentStage.label}
            </p>

            <div className="flex justify-center gap-4 mb-12">
              {Array.from({ length: currentStage.count }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0.3 }}
                  animate={{
                    scale: i < currentCount ? 1.1 : 1,
                    opacity: i < currentCount ? 1 : 0.3,
                    backgroundColor: i < currentCount ? "#000" : "#e5e7eb"
                  }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl"
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-white border-4 border-black p-8 rounded-[40px] text-3xl font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
            >
              I found one
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
