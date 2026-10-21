import React, { useState, useEffect } from "react";
import { GameState, Language } from "../types";
import { motion } from "motion/react";
import { Search, Type } from "lucide-react";

interface WordWanderProps {
  onGameEnd: (state: GameState) => void;
  language: Language;
}

export const WordWander: React.FC<WordWanderProps> = ({ onGameEnd, language }) => {
  const [targetWord, setTargetWord] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [latencies, setLatencies] = useState<number[]>([]);

  const wordLists: Record<Language, string[]> = {
    en: ["FLUX", "FOCUS", "BRAIN", "MIND", "CALM", "STEADY", "PULSE", "THOUGHT", "MEMORY", "NEURON", "SYNAPSE", "LOGIC", "REASON", "ATTENTION", "COGNITION", "PERCEPTION", "AWARENESS", "INSIGHT", "CAT", "DOG", "SUN", "MOON", "STAR", "TREE", "BIRD", "FISH"],
    zu: ["THANDA", "HAMBA", "KHULUMA", "FUNDA", "DLALA", "SEBENZA", "BONA", "ZWA", "DLA", "PHUZA", "LALA", "VUKA", "HLALA", "MA", "BALA", "BHALA", "INKOSI", "UMUNTU", "IZULU", "ILANGA", "INYONI", "ISILWANE"],
    xh: ["MOLO", "ENKOSI", "BHOTA", "CAMAGU", "KHAYA", "MNTWANA", "SISI", "BHUTI", "MAMA", "TATA", "GOGO", "MKHULU", "THANDO", "KHANYA", "KHULULEKA", "VUYANI", "UMNTU", "ILANGA", "INYONI", "ISILWANE"],
    af: ["LEKKER", "DANKIE", "ASSEBLIEF", "MOOI", "GROET", "LIEFDE", "VREDE", "HOOP", "GELOOF", "KRAG", "SON", "MAAN", "STER", "BOOM", "HUIS", "KIND", "MENS", "DIER", "VOEL", "VIS"],
    st: ["DUMELA", "KE_A_LEBOHA", "TSAMAYA", "TLAA", "JA", "NWA", "ROBALA", "TSOHA", "BAPALA", "BINA", "HLAPA", "APARA", "BALA", "NGOLA", "ITHUTE", "SEBETSA", "MOTHO", "LETSATSI", "NONYANA", "PHOLOGOLO"]
  };

  useEffect(() => {
    generateLevel();
  }, [language]);

  const generateLevel = () => {
    const currentWords = wordLists[language] || wordLists.en;
    const target = currentWords[Math.floor(Math.random() * currentWords.length)];
    setTargetWord(target);
    setStartTime(Date.now());
    
    // Generate similar looking words or other words from the list
    const otherWords = currentWords.filter(w => w !== target);
    const scrambled = target.split("").sort(() => Math.random() - 0.5).join("");
    
    setOptions([target, scrambled, ...otherWords.sort(() => Math.random() - 0.5).slice(0, 1)].sort(() => Math.random() - 0.5));
  };

  const handleSelect = (word: string) => {
    const latency = Date.now() - startTime;
    setLatencies(prev => [...prev, latency]);

    if (word === targetWord) {
      setScore(s => s + 10);
    } else {
      setErrors(e => e + 1);
    }
    generateLevel();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-12 rounded-[40px] border-4 border-black shadow-2xl text-center">
      <div className="mb-12">
        <div className="text-stone-400 font-bold uppercase text-xs tracking-widest mb-2">Find the Word</div>
        <h2 className="text-6xl font-black uppercase tracking-tighter text-yellow-500">{targetWord}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(opt)}
            className="bg-stone-100 border-2 border-stone-200 p-6 rounded-3xl text-3xl font-black uppercase hover:border-black transition-all"
          >
            {opt}
          </motion.button>
        ))}
      </div>

      <div className="mt-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-stone-400 font-bold uppercase text-xs">
            <Type size={16} /> Phonological Awareness
          </div>
          <div className="text-xs font-black text-stone-300">AVG: {(latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1)).toFixed(0)}ms</div>
        </div>
        <button 
          onClick={() => onGameEnd({ score, errors, currentRule: "word", lastRuleChange: 0, inhibitionLatency: latencies, fidgetMetric: 0 })}
          className="bg-black text-white px-8 py-3 rounded-2xl font-black uppercase"
        >
          End Session
        </button>
      </div>
    </div>
  );
};
