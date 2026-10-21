import React, { useState, useEffect, useRef } from "react";
import { GameState } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Smile, Frown, Meh, Zap, Target, Search } from "lucide-react";

interface SocialMirrorProps {
  onGameEnd: (state: GameState) => void;
}

interface Block {
  id: string;
  expression: "happy" | "sad" | "neutral" | "angry";
  x: number;
  y: number;
  speed: number;
}

export const SocialMirror: React.FC<SocialMirrorProps> = ({ onGameEnd }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [targetExpression, setTargetExpression] = useState<"happy" | "sad" | "neutral" | "angry">("happy");
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const lastSpawnRef = useRef(Date.now());
  const requestRef = useRef<number>(0);

  const expressions: ("happy" | "sad" | "neutral" | "angry")[] = ["happy", "sad", "neutral", "angry"];

  const spawnBlock = () => {
    const id = Math.random().toString(36).substring(7);
    const expression = expressions[Math.floor(Math.random() * expressions.length)];
    return {
      id,
      expression,
      x: Math.random() * 80 + 10,
      y: -10,
      speed: 1.5 + Math.random() * 2,
    };
  };

  const update = () => {
    if (!isActive) return;

    setBlocks(prev => {
      const next = prev.map(b => ({ ...b, y: b.y + b.speed }));
      const missed = next.filter(b => b.y > 100);
      if (missed.some(b => b.expression === targetExpression)) {
        setErrors(e => e + 1);
      }
      return next.filter(b => b.y <= 100);
    });

    if (Date.now() - lastSpawnRef.current > 1500) {
      setBlocks(prev => [...prev, spawnBlock()]);
      lastSpawnRef.current = Date.now();
    }

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(update);
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsActive(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      const ruleTimer = setInterval(() => {
        setTargetExpression(expressions[Math.floor(Math.random() * expressions.length)]);
      }, 5000);

      return () => {
        cancelAnimationFrame(requestRef.current);
        clearInterval(timer);
        clearInterval(ruleTimer);
      };
    }
  }, [isActive]);

  const handleShoot = (block: Block) => {
    if (block.expression === targetExpression) {
      setScore(s => s + 10);
      setBlocks(prev => prev.filter(b => b.id !== block.id));
    } else {
      setErrors(e => e + 1);
      setBlocks(prev => prev.filter(b => b.id !== block.id));
    }
  };

  if (!isActive && timeLeft === 30) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-[40px] border-4 border-black shadow-2xl text-center">
        <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto mb-8 flex items-center justify-center border-4 border-black">
          <Target size={48} className="text-black" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase mb-4 tracking-tighter bg-black py-2 px-4 inline-block">Social Mirror</h2>
        <p className="text-stone-500 mb-12 font-medium">
          Shoot the falling blocks that match the target expression. Don't let the correct ones fall!
        </p>
        <button 
          onClick={() => setIsActive(true)}
          className="bg-yellow-400 text-black px-12 py-4 rounded-3xl font-black uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (timeLeft === 0) {
    onGameEnd({ score, errors, currentRule: targetExpression, lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 });
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-stone-50 h-[600px] rounded-[40px] border-4 border-black relative overflow-hidden shadow-2xl cursor-crosshair">
      <div className="absolute top-6 left-6 flex gap-4 z-10">
        <div className="bg-white px-4 py-2 rounded-xl border-2 border-black font-black text-xs">SCORE: {score}</div>
        <div className="bg-red-500 px-4 py-2 rounded-xl border-2 border-black font-black text-xs text-white">ERRORS: {errors}</div>
        <div className="bg-black text-white px-4 py-2 rounded-xl border-2 border-black font-black text-xs">TIME: {timeLeft}s</div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
          <input 
            type="text"
            placeholder="Search expression..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white pl-9 pr-4 py-2 rounded-xl border-2 border-black font-black text-[10px] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all w-48"
          />
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10 flex flex-col items-end">
        <div className="text-[10px] font-black uppercase text-stone-400 mb-1">Target Expression</div>
        <div className="bg-yellow-400 p-3 rounded-2xl border-2 border-black flex items-center gap-2">
          {targetExpression === "happy" && <Smile size={24} />}
          {targetExpression === "sad" && <Frown size={24} />}
          {targetExpression === "neutral" && <Meh size={24} />}
          {targetExpression === "angry" && <Frown size={24} className="text-red-600" />}
          <span className="font-black uppercase text-sm">{targetExpression}</span>
        </div>
      </div>

      <div className="absolute inset-0">
        <AnimatePresence>
          {blocks
            .filter(block => block.expression.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(block => (
            <motion.button
              key={block.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              onClick={() => handleShoot(block)}
              onTouchStart={() => handleShoot(block)}
              style={{ left: `${block.x}%`, top: `${block.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-2xl border-4 border-black flex items-center justify-center shadow-lg hover:bg-stone-100 transition-colors"
            >
              {block.expression === "happy" && <Smile size={32} className="text-yellow-500" />}
              {block.expression === "sad" && <Frown size={32} className="text-blue-500" />}
              {block.expression === "neutral" && <Meh size={32} className="text-stone-500" />}
              {block.expression === "angry" && <Frown size={32} className="text-red-500" />}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-8 flex justify-between items-center pointer-events-none">
        <div className="text-stone-400 font-black uppercase text-[10px] tracking-widest">Focus: Social Cue Recognition</div>
        <button 
          onClick={() => onGameEnd({ score, errors, currentRule: targetExpression, lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 })}
          className="bg-black text-white px-6 py-2 rounded-xl font-black uppercase text-xs border-2 border-black pointer-events-auto"
        >
          Quit
        </button>
      </div>
    </div>
  );
};
