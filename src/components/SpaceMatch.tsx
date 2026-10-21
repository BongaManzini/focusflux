import React, { useState, useEffect, useCallback } from "react";
import { GameState } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Box, RotateCw, RotateCcw, CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "../lib/utils";

interface SpaceMatchProps {
  onGameEnd: (state: GameState) => void;
}

const Cube: React.FC<{ rotation: { x: number; y: number; z: number }; isTarget?: boolean }> = ({ rotation, isTarget }) => {
  const size = 120;
  const halfSize = size / 2;

  return (
    <div 
      className="relative preserve-3d transition-transform duration-500"
      style={{ 
        width: size, 
        height: size,
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)` 
      }}
    >
      {/* Front - Yellow/Stone */}
      <div 
        className={cn(
          "absolute inset-0 border-2 border-black flex items-center justify-center",
          isTarget ? "bg-stone-200/40 border-dashed" : "bg-yellow-400"
        )}
        style={{ transform: `translateZ(${halfSize}px)` }}
      >
        <div className="w-8 h-8 bg-black/10 rounded-full border border-black/20" />
      </div>
      {/* Back - Red/Stone */}
      <div 
        className={cn(
          "absolute inset-0 border-2 border-black flex items-center justify-center",
          isTarget ? "bg-stone-300/40 border-dashed" : "bg-red-400"
        )}
        style={{ transform: `rotateY(180deg) translateZ(${halfSize}px)` }}
      >
        <div className="w-8 h-8 border-2 border-black/20 rotate-45" />
      </div>
      {/* Right - Blue/Stone */}
      <div 
        className={cn(
          "absolute inset-0 border-2 border-black flex items-center justify-center",
          isTarget ? "bg-stone-400/40 border-dashed" : "bg-blue-400"
        )}
        style={{ transform: `rotateY(90deg) translateZ(${halfSize}px)` }}
      >
        <div className="w-6 h-6 bg-black/10" />
      </div>
      {/* Left - Green/Stone */}
      <div 
        className={cn(
          "absolute inset-0 border-2 border-black flex items-center justify-center",
          isTarget ? "bg-stone-400/40 border-dashed" : "bg-green-400"
        )}
        style={{ transform: `rotateY(-90deg) translateZ(${halfSize}px)` }}
      >
        <div className="w-6 h-6 border-2 border-black/20 rounded-sm" />
      </div>
      {/* Top - Orange/Stone */}
      <div 
        className={cn(
          "absolute inset-0 border-2 border-black flex items-center justify-center",
          isTarget ? "bg-stone-500/40 border-dashed" : "bg-orange-400"
        )}
        style={{ transform: `rotateX(90deg) translateZ(${halfSize}px)` }}
      >
        <div className="w-1 h-8 bg-black/10 rounded-full" />
      </div>
      {/* Bottom - Purple/Stone */}
      <div 
        className={cn(
          "absolute inset-0 border-2 border-black flex items-center justify-center",
          isTarget ? "bg-stone-500/40 border-dashed" : "bg-purple-400"
        )}
        style={{ transform: `rotateX(-90deg) translateZ(${halfSize}px)` }}
      >
        <div className="w-8 h-1 bg-black/10 rounded-full" />
      </div>
    </div>
  );
};

export const SpaceMatch: React.FC<SpaceMatchProps> = ({ onGameEnd }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0, z: 0 });
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [latencies, setLatencies] = useState<number[]>([]);

  const generateLevel = useCallback(() => {
    const angles = [0, 90, 180, 270];
    setTargetRotation({
      x: angles[Math.floor(Math.random() * angles.length)],
      y: angles[Math.floor(Math.random() * angles.length)],
      z: angles[Math.floor(Math.random() * angles.length)]
    });
    setRotation({ x: 0, y: 0, z: 0 });
    setStartTime(Date.now());
    setFeedback(null);
  }, []);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  const rotate = (axis: "x" | "y" | "z", amount: number) => {
    setRotation(prev => ({ ...prev, [axis]: (prev[axis] + amount + 360) % 360 }));
  };

  const getVisualState = (rot: { x: number; y: number; z: number }) => {
    // Helper to rotate a vector [x, y, z]
    const rotateVecX = (v: number[], a: number) => {
      const rad = (a * Math.PI) / 180;
      const c = Math.round(Math.cos(rad));
      const s = Math.round(Math.sin(rad));
      return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
    };
    const rotateVecY = (v: number[], a: number) => {
      const rad = (a * Math.PI) / 180;
      const c = Math.round(Math.cos(rad));
      const s = Math.round(Math.sin(rad));
      return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
    };
    const rotateVecZ = (v: number[], a: number) => {
      const rad = (a * Math.PI) / 180;
      const c = Math.round(Math.cos(rad));
      const s = Math.round(Math.sin(rad));
      return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
    };

    // Initial face normals
    const normals = [
      [0, 0, 1],  // Front
      [0, 0, -1], // Back
      [0, 1, 0],  // Top
      [0, -1, 0], // Bottom
      [1, 0, 0],  // Right
      [-1, 0, 0], // Left
    ];

    // Apply rotations in the same order as CSS: X -> Y -> Z
    return normals.map(n => {
      let v = rotateVecX(n, rot.x);
      v = rotateVecY(v, rot.y);
      v = rotateVecZ(v, rot.z);
      return v.join(",");
    }).join("|");
  };

  const checkMatch = () => {
    const userState = getVisualState(rotation);
    const targetState = getVisualState(targetRotation);
    const isMatch = userState === targetState;

    if (isMatch) {
      setScore(s => s + 10);
      setLatencies(prev => [...prev, Date.now() - startTime]);
      setFeedback("correct");
      setTimeout(generateLevel, 1000);
    } else {
      setErrors(e => e + 1);
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const avgRotationSpeed = latencies.length > 0 
    ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(0)
    : "0";

  return (
    <div className="max-w-4xl mx-auto bg-white p-12 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
      <div className="mb-12">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Space Match</h2>
        <p className="text-stone-500 font-bold uppercase text-xs tracking-widest">Mental Rotation & Spatial Reasoning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
        {/* Target Cutout */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Target Orientation</div>
          <div className="w-64 h-64 bg-stone-100 rounded-[32px] border-4 border-black border-dashed flex items-center justify-center perspective-[1000px]">
            <Cube rotation={targetRotation} isTarget={true} />
          </div>
        </div>

        {/* User Shape */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Your Shape</div>
          <div className="w-64 h-64 bg-white rounded-[32px] border-4 border-black flex items-center justify-center perspective-[1000px]">
            <Cube rotation={rotation} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="space-y-2">
          <div className="text-[8px] font-black uppercase text-stone-400">Pitch (X)</div>
          <div className="flex gap-2">
            <button onClick={() => rotate("x", 90)} className="flex-1 bg-stone-100 p-4 rounded-2xl border-2 border-black hover:bg-stone-200 transition-all"><RotateCw size={20} /></button>
            <button onClick={() => rotate("x", -90)} className="flex-1 bg-stone-100 p-4 rounded-2xl border-2 border-black hover:bg-stone-200 transition-all"><RotateCcw size={20} /></button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-[8px] font-black uppercase text-stone-400">Yaw (Y)</div>
          <div className="flex gap-2">
            <button onClick={() => rotate("y", 90)} className="flex-1 bg-stone-100 p-4 rounded-2xl border-2 border-black hover:bg-stone-200 transition-all"><RotateCw size={20} /></button>
            <button onClick={() => rotate("y", -90)} className="flex-1 bg-stone-100 p-4 rounded-2xl border-2 border-black hover:bg-stone-200 transition-all"><RotateCcw size={20} /></button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-[8px] font-black uppercase text-stone-400">Roll (Z)</div>
          <div className="flex gap-2">
            <button onClick={() => rotate("z", 90)} className="flex-1 bg-stone-100 p-4 rounded-2xl border-2 border-black hover:bg-stone-200 transition-all"><RotateCw size={20} /></button>
            <button onClick={() => rotate("z", -90)} className="flex-1 bg-stone-100 p-4 rounded-2xl border-2 border-black hover:bg-stone-200 transition-all"><RotateCcw size={20} /></button>
          </div>
        </div>
      </div>

      <button
        onClick={checkMatch}
        disabled={feedback === "correct"}
        className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-stone-800 transition-all active:scale-95 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        Match Orientation
      </button>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            {feedback === "correct" ? (
              <div className="flex items-center gap-2 text-green-600 font-black uppercase tracking-widest">
                <CheckCircle2 /> Spatial Alignment Success
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 font-black uppercase tracking-widest">
                <XCircle /> Orientation Mismatch
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 pt-8 border-t-2 border-stone-100 flex justify-between items-center">
        <div className="text-left">
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Mental Rotation Speed</div>
          <div className="text-lg font-black">{avgRotationSpeed}ms</div>
        </div>
        <button
          onClick={() => onGameEnd({ score, errors, currentRule: "space", lastRuleChange: 0, inhibitionLatency: latencies, fidgetMetric: 0 })}
          className="bg-black text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-stone-800 transition-all"
        >
          End Session
        </button>
      </div>
    </div>
  );
};
