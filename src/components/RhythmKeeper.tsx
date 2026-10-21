import React, { useEffect, useRef, useState } from "react";
import { GameState } from "../types";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface RhythmKeeperProps {
  onGameEnd: (state: GameState) => void;
}

interface Note {
  id: string;
  value: number; // The number of dots or the digit
  type: "dots" | "digit";
  x: number;
  y: number;
  speed: number;
}

export const RhythmKeeper: React.FC<RhythmKeeperProps> = ({ onGameEnd }) => {
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [latencies, setLatencies] = useState<number[]>([]);
  const lastSpawnRef = useRef(Date.now());
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const spawnNote = () => {
      const id = Math.random().toString(36).substring(7);
      const value = Math.floor(Math.random() * 5) + 1; // 1-5 for subitizing
      const type = Math.random() > 0.5 ? "dots" : "digit";
      return {
        id,
        value,
        type,
        x: Math.random() * 80 + 10, // 10% to 90%
        y: -10,
        speed: 2 + Math.random() * 2,
      };
    };

    const update = () => {
      setNotes(prev => {
        const next = prev.map(n => ({ ...n, y: n.y + n.speed }));
        // Check for missed notes
        const missed = next.filter(n => n.y > 100);
        if (missed.length > 0) {
          setErrors(e => e + missed.length);
        }
        return next.filter(n => n.y <= 100);
      });

      if (Date.now() - lastSpawnRef.current > 2000) {
        setNotes(prev => [...prev, spawnNote()]);
        lastSpawnRef.current = Date.now();
      }
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleNoteClick = (note: Note) => {
    const latency = Date.now() - lastSpawnRef.current; // Rough subitizing measure
    setLatencies(prev => [...prev, latency]);
    setScore(s => s + 10);
    setNotes(prev => prev.filter(n => n.id !== note.id));
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-stone-900 h-[600px] rounded-[40px] border-4 border-black relative overflow-hidden shadow-2xl">
      <div className="absolute top-6 left-6 flex gap-4 z-10">
        <div className="bg-white px-4 py-2 rounded-full font-black text-xs border-2 border-black">SCORE: {score}</div>
        <div className="bg-red-500 px-4 py-2 rounded-full font-black text-xs border-2 border-black text-white">ERRORS: {errors}</div>
      </div>

      {/* Game Area */}
      <div className="absolute inset-0">
        {notes.map(note => (
          <motion.button
            key={note.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => handleNoteClick(note)}
            onTouchStart={() => handleNoteClick(note)}
            style={{ left: `${note.x}%`, top: `${note.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            {note.type === "digit" ? (
              <span className="text-2xl font-black">{note.value}</span>
            ) : (
              <div className="grid grid-cols-2 gap-1 p-2">
                {Array.from({ length: note.value }).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-black rounded-full" />
                ))}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full px-8 flex justify-between items-center">
        <div className="text-white/30 font-black uppercase text-xs tracking-widest">Focus: Subitizing Speed</div>
        <button 
          onClick={() => onGameEnd({ score, errors, currentRule: "color", lastRuleChange: 0, inhibitionLatency: latencies, fidgetMetric: 0 })}
          className="bg-yellow-400 text-black px-8 py-3 rounded-2xl font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          End Session
        </button>
      </div>
    </div>
  );
};
