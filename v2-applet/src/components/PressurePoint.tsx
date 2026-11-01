import React, { useState, useEffect, useRef, useCallback } from "react";
import { GameState } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { PenTool, Target, Activity, AlertTriangle } from "lucide-react";

interface PressurePointProps {
  onGameEnd: (state: GameState) => void;
}

export const PressurePoint: React.FC<PressurePointProps> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 100, y: 100 });
  const [userPos, setUserPos] = useState({ x: 100, y: 100 });
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [isOffPath, setIsOffPath] = useState(false);

  const targetPathRef = useRef<{ x: number; y: number }[]>([]);
  const lastUserPosRef = useRef<{ x: number; y: number }>({ x: 100, y: 100 });
  const jitterAccumulatorRef = useRef(0);
  const frameRef = useRef(0);

  // Generate a random path for the target to follow
  useEffect(() => {
    const generatePath = () => {
      const newPath = [];
      let x = 100;
      let y = 100;
      for (let i = 0; i < 1000; i++) {
        x += Math.sin(i * 0.05) * 5 + (Math.random() - 0.5) * 2;
        y += Math.cos(i * 0.05) * 5 + (Math.random() - 0.5) * 2;
        newPath.push({ x, y });
      }
      targetPathRef.current = newPath;
    };
    generatePath();
  }, []);

  const update = useCallback(() => {
    frameRef.current++;
    const idx = frameRef.current % targetPathRef.current.length;
    const target = targetPathRef.current[idx];
    if (target) setTargetPos(target);

    if (isTracing) {
      const dist = Math.hypot(userPos.x - target.x, userPos.y - target.y);
      if (dist > 40) {
        setIsOffPath(true);
        setErrors(e => e + 1);
      } else {
        setIsOffPath(false);
        setScore(s => s + 1);
      }

      // Calculate jitter (sudden movements)
      const moveDist = Math.hypot(userPos.x - lastUserPosRef.current.x, userPos.y - lastUserPosRef.current.y);
      jitterAccumulatorRef.current += moveDist;
      setJitter(jitterAccumulatorRef.current / frameRef.current);
      lastUserPosRef.current = userPos;
    }

    requestAnimationFrame(update);
  }, [isTracing, userPos]);

  useEffect(() => {
    const anim = requestAnimationFrame(update);
    return () => cancelAnimationFrame(anim);
  }, [update]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;
    setUserPos({ x, y });
    if (isTracing) {
      setPath(prev => [...prev.slice(-50), { x, y }]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-2">
            <PenTool className="text-red-500" /> Pressure Point
          </h2>
          <p className="text-stone-500 font-bold uppercase text-[10px] tracking-widest">Tracking Motor Jitter & Precision</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-stone-100 px-4 py-2 rounded-2xl border-2 border-stone-200 text-center">
            <div className="text-[8px] font-black text-stone-400 uppercase">Jitter Index</div>
            <div className="text-xl font-black">{jitter.toFixed(2)}</div>
          </div>
          <div className="bg-stone-100 px-4 py-2 rounded-2xl border-2 border-stone-200 text-center">
            <div className="text-[8px] font-black text-stone-400 uppercase">Precision</div>
            <div className="text-xl font-black">{score}</div>
          </div>
        </div>
      </div>

      <div className="relative bg-stone-50 rounded-[32px] border-4 border-black overflow-hidden cursor-crosshair h-[500px]">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onMouseDown={() => setIsTracing(true)}
          onMouseUp={() => setIsTracing(false)}
          onTouchStart={() => setIsTracing(true)}
          onTouchEnd={() => setIsTracing(false)}
          className="w-full h-full"
        />

        {/* Target Point */}
        <motion.div
          animate={{ x: targetPos.x - 20, y: targetPos.y - 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute w-10 h-10 border-4 border-red-500 rounded-full flex items-center justify-center pointer-events-none"
        >
          <Target size={20} className="text-red-500" />
        </motion.div>

        {/* User Cursor */}
        <div 
          className={`absolute w-6 h-6 rounded-full border-2 border-black pointer-events-none transition-colors ${isOffPath ? "bg-red-500" : "bg-yellow-400"}`}
          style={{ left: userPos.x - 12, top: userPos.y - 12 }}
        />

        <AnimatePresence>
          {isOffPath && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full font-black uppercase text-xs flex items-center gap-2 shadow-lg"
            >
              <AlertTriangle size={14} /> Off Path Detected
            </motion.div>
          )}
        </AnimatePresence>

        {!isTracing && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-white p-6 rounded-3xl border-4 border-black text-center shadow-2xl">
              <h3 className="text-xl font-black uppercase mb-2">Ready to Trace?</h3>
              <p className="text-sm text-stone-500 font-medium mb-4">Press and hold to follow the red target.</p>
              <div className="flex items-center justify-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest">
                <Activity size={16} /> Analyzing Motor Control
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="flex items-center gap-2 text-stone-400 font-bold uppercase text-xs">
          <PenTool size={16} /> Dysgraphia / ADHD Screening
        </div>
        <button
          onClick={() => onGameEnd({ score, errors, currentRule: "pressure", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: jitter })}
          className="bg-black text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-stone-800 transition-all"
        >
          Finish Evaluation
        </button>
      </div>
    </div>
  );
};
