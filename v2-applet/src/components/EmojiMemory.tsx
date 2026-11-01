import React, { useState, useEffect, useCallback } from "react";
import { GameState } from "../types";
import { motion } from "motion/react";

interface EmojiMemoryProps {
  onGameEnd: (state: GameState) => void;
}

const EMOJIS = ["🍎", "🍌", "🍇", "🍓", "🍒", "🍑", "🍍", "🥝"];

export const EmojiMemory: React.FC<EmojiMemoryProps> = ({ onGameEnd }) => {
  const [grid, setGrid] = useState<string[]>([]);
  const [showEmojis, setShowEmojis] = useState(true);
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [round, setRound] = useState(0);

  const generateRound = useCallback(() => {
    if (round >= 3) {
      onGameEnd({ score, errors, currentRule: "shape", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 });
      return;
    }
    const shuffled = [...EMOJIS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);
    setGrid(selected);
    setShowEmojis(true);
    setTimeout(() => {
      setShowEmojis(false);
      const questionIdx = Math.floor(Math.random() * 4);
      setQuestion(`Which emoji was in the ${["top-left", "top-right", "bottom-left", "bottom-right"][questionIdx]}?`);
      setCorrectAnswer(selected[questionIdx]);
      const shuffledOptions = [...EMOJIS].sort(() => Math.random() - 0.5);
      setOptions(shuffledOptions.slice(0, 4));
    }, 3000);
  }, [round, score, errors, onGameEnd]);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const handleOptionClick = (option: string) => {
    if (option === correctAnswer) {
      setScore((prev) => prev + 10);
    } else {
      setErrors((prev) => prev + 1);
    }
    setRound((prev) => prev + 1);
    generateRound();
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
      <div className="text-2xl font-black mb-8">
        {showEmojis ? (
          <div className="grid grid-cols-2 gap-4">
            {grid.map((emoji, i) => (
              <div key={i} className="text-6xl">{emoji}</div>
            ))}
          </div>
        ) : (
          <div>
            <p className="mb-4">{question}</p>
            <div className="grid grid-cols-2 gap-4">
              {options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionClick(option)}
                  className="bg-stone-100 p-6 rounded-2xl border-2 border-black text-4xl hover:bg-stone-200 transition-all"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
