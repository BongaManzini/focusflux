import React, { useState, useEffect } from "react";
import { GameState } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Wind, Cloud, Zap } from "lucide-react";

interface MuscleMeltProps {
  onGameEnd: (state: GameState) => void;
}

const MUSCLE_GROUPS = [
  { name: "Hands & Arms", instruction: "Clench your fists tightly", color: "bg-red-400" },
  { name: "Shoulders & Neck", instruction: "Shrug your shoulders to your ears", color: "bg-orange-400" },
  { name: "Face & Jaw", instruction: "Squeeze your eyes shut and clench your jaw", color: "bg-yellow-400" },
  { name: "Chest & Stomach", instruction: "Take a deep breath and hold it", color: "bg-green-400" },
  { name: "Legs & Feet", instruction: "Curl your toes and tense your calves", color: "bg-blue-400" },
];

export const MuscleMelt: React.FC<MuscleMeltProps> = ({ onGameEnd }) => {
  const [groupIndex, setGroupIndex] = useState(0);
  const [phase, setPhase] = useState<"tense" | "hold" | "release">("tense");
  const [timer, setTimer] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentGroup = MUSCLE_GROUPS[groupIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === "hold") {
      setTimer(5);
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setPhase("release");
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const handleNext = () => {
    if (phase === "tense") {
      setPhase("hold");
    } else if (phase === "release") {
      if (groupIndex < MUSCLE_GROUPS.length - 1) {
        setGroupIndex(prev => prev + 1);
        setPhase("tense");
      } else {
        setIsFinished(true);
      }
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-blue-100 p-8 rounded-full mb-8"
        >
          <CheckCircle2 size={80} className="text-blue-500" />
        </motion.div>
        <h2 className="text-4xl font-black uppercase mb-4">Completely Melted</h2>
        <p className="text-xl text-stone-600 mb-12 max-w-md">
          Your body is now more relaxed and your mind is calmer. Great job practicing physical regulation.
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
            {MUSCLE_GROUPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full transition-all ${
                  i <= groupIndex ? MUSCLE_GROUPS[i].color : "bg-stone-200"
                }`}
              />
            ))}
          </div>
          <span className="font-black uppercase text-xs tracking-widest text-stone-400">
            Group {groupIndex + 1} of 5
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${groupIndex}-${phase}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center"
          >
            <div className={`inline-flex p-8 rounded-[40px] ${currentGroup.color} text-white mb-8 shadow-xl relative`}>
              {phase === "tense" && <Zap size={64} className="animate-pulse" />}
              {phase === "hold" && <Cloud size={64} className="animate-bounce" />}
              {phase === "release" && <Wind size={64} className="animate-ping" />}
              
              {phase === "hold" && (
                <div className="absolute -top-4 -right-4 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-4 border-white">
                  {timer}
                </div>
              )}
            </div>

            <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">
              {currentGroup.name}
            </h2>
            
            <p className="text-2xl font-bold text-stone-500 uppercase tracking-tight mb-12 h-20 flex items-center justify-center">
              {phase === "tense" && currentGroup.instruction}
              {phase === "hold" && "Hold the tension..."}
              {phase === "release" && "Release and feel the melt"}
            </p>

            <button
              onClick={handleNext}
              disabled={phase === "hold"}
              className={`w-full p-8 rounded-[40px] text-3xl font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-95 ${
                phase === "hold" 
                  ? "bg-stone-100 text-stone-300 border-stone-200 shadow-none" 
                  : "bg-white border-4 border-black text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              }`}
            >
              {phase === "tense" && "I'm Tensing"}
              {phase === "hold" && "Holding..."}
              {phase === "release" && "Next Group"}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
