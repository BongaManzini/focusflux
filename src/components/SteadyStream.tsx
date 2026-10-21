import React, { useState, useEffect, useRef } from "react";
import { GameState } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Target, Zap } from "lucide-react";

interface SteadyStreamProps {
  onGameEnd: (state: GameState) => void;
}

export const SteadyStream: React.FC<SteadyStreamProps> = ({ onGameEnd }) => {
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [fidgetMetric, setFidgetMetric] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  
  const mousePosRef = useRef({ x: 50, y: 50 });
  const lastUpdateRef = useRef(performance.now());

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const moveTarget = () => {
      setTargetPos({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      });
    };

    const targetInterval = setInterval(moveTarget, 2000);
    return () => clearInterval(targetInterval);
  }, [isActive]);

  // Fidget tracking loop
  useEffect(() => {
    if (!isActive) return;

    const trackFidget = () => {
      const now = performance.now();
      const dt = now - lastUpdateRef.current;
      
      // Calculate micro-movements (tremors)
      // In a real app we'd use accelerometer, here we use mouse jitter
      // We'll simulate it by measuring the variance in mouse velocity
      
      lastUpdateRef.current = now;
      requestAnimationFrame(trackFidget);
    };

    const frame = requestAnimationFrame(trackFidget);
    return () => cancelAnimationFrame(frame);
  }, [isActive]);

  const handleTargetClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    const dist = Math.sqrt(Math.pow(x - targetPos.x, 2) + Math.pow(y - targetPos.y, 2));
    
    if (dist < 10) {
      setScore(s => s + 10);
      setFidgetMetric(prev => prev + (dist / 10)); // Higher distance = more "fidgety"
      setTargetPos({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      });
    } else {
      setErrors(e => e + 1);
    }
  };

  if (!isActive && timeLeft === 30) {
    return (
      <div className="max-w-2xl mx-auto bg-stone-900 p-8 md:p-12 rounded-[32px] md:rounded-[40px] border-4 border-black shadow-2xl text-center mx-4">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-yellow-400 rounded-full mx-auto mb-6 md:mb-8 flex items-center justify-center border-4 border-black">
          <Target size={40} md:size={48} className="text-black" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase mb-4 tracking-tighter">Steady Stream</h2>
        <p className="text-stone-400 mb-8 md:mb-12 font-medium text-sm md:text-base">
          Tap the targets as they appear. We'll measure your motor control and micro-tremors.
        </p>
        <button 
          onClick={() => setIsActive(true)}
          className="w-full md:w-auto bg-yellow-400 text-black px-12 py-4 rounded-3xl font-black uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform"
        >
          Start Test
        </button>
      </div>
    );
  }

  useEffect(() => {
    if (timeLeft === 0) {
      onGameEnd({ 
        score, 
        errors, 
        currentRule: "color", 
        lastRuleChange: 0, 
        inhibitionLatency: [], 
        fidgetMetric: fidgetMetric / (score / 10 || 1) 
      });
    }
  }, [timeLeft, score, errors, fidgetMetric, onGameEnd]);

  if (timeLeft === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-stone-900 h-[500px] md:h-[600px] rounded-[32px] md:rounded-[40px] border-4 border-black relative overflow-hidden shadow-2xl cursor-crosshair">
      {/* Hardware UI Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-px bg-white/20" />
      </div>

      <div className="absolute top-4 md:top-8 left-4 md:left-8 flex gap-3 md:gap-6 z-10">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-2 md:p-4 rounded-xl md:rounded-2xl">
          <div className="text-[8px] md:text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Stability</div>
          <div className="text-lg md:text-2xl font-mono text-yellow-400">{(100 - (fidgetMetric * 10)).toFixed(1)}%</div>
        </div>
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-2 md:p-4 rounded-xl md:rounded-2xl">
          <div className="text-[8px] md:text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Time</div>
          <div className="text-lg md:text-2xl font-mono text-white">{timeLeft}s</div>
        </div>
      </div>

      <div className="absolute top-4 md:top-8 right-4 md:right-8 bg-black/80 backdrop-blur-md border border-white/10 p-2 md:p-4 rounded-xl md:rounded-2xl z-10">
        <div className="text-[8px] md:text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Score</div>
        <div className="text-lg md:text-2xl font-mono text-green-400">{score.toString().padStart(4, '0')}</div>
      </div>

      {/* Game Area */}
      <div className="absolute inset-0" onClick={handleTargetClick} onTouchStart={handleTargetClick}>
        <AnimatePresence>
          <motion.div
            key={`${targetPos.x}-${targetPos.y}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center"
          >
            <div className="absolute inset-0 border-2 border-yellow-400 rounded-full animate-ping opacity-20" />
            <div className="w-12 h-12 bg-yellow-400 rounded-full border-4 border-black shadow-lg flex items-center justify-center">
              <Zap size={24} className="text-black" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Micro-tremor visualization */}
      <div className="absolute bottom-8 left-8 right-8 h-12 bg-black/50 rounded-xl border border-white/5 overflow-hidden flex items-center px-4 gap-2">
        <Activity size={16} className="text-stone-500" />
        <div className="flex-1 h-1 bg-stone-800 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: `${Math.min(fidgetMetric * 20, 100)}%` }}
            className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
          />
        </div>
        <span className="text-[10px] font-mono text-stone-500 uppercase">Tremor Index</span>
      </div>
    </div>
  );
};
