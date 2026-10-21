import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Zap, Music, Navigation, Users, Type, Wind, ArrowRight, X } from "lucide-react";

interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    focus: string;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What's your biggest challenge when focusing?",
    options: [
      { label: "Staying on task without getting distracted", focus: "ADHD / Inhibition" },
      { label: "Remembering instructions while doing them", focus: "Working Memory" },
      { label: "Switching between different tasks quickly", focus: "Executive Function" },
      { label: "Managing emotional responses to stress", focus: "Emotional Regulation" }
    ]
  },
  {
    id: 2,
    text: "Which of these areas would you like to improve most?",
    options: [
      { label: "Understanding social cues and body language", focus: "Autism (ASD)" },
      { label: "Reading speed and word recognition", focus: "Dyslexia" },
      { label: "Mental math and number sense", focus: "Dyscalculia" },
      { label: "Impulse control and reaction time", focus: "ADHD / Inhibition" }
    ]
  }
];

interface OnboardingTestProps {
  onComplete: (focus: string) => void;
  onSkip: () => void;
}

export const OnboardingTest: React.FC<OnboardingTestProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (focus: string) => {
    const newAnswers = [...answers, focus];
    setAnswers(newAnswers);
    
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Simple logic: pick the most frequent or the last one
      onComplete(focus);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-xl rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      >
        <div className="p-8 border-b-4 border-black flex justify-between items-center bg-yellow-400">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Cognitive Discovery</h2>
            <p className="text-xs font-bold uppercase opacity-70">Step {currentStep + 1} of {QUESTIONS.length}</p>
          </div>
          <button 
            onClick={onSkip}
            className="p-2 hover:bg-black/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-black leading-tight">
                {QUESTIONS[currentStep]?.text || "Loading question..."}
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {QUESTIONS[currentStep]?.options?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt.focus)}
                    className="group flex items-center justify-between p-5 rounded-2xl border-2 border-stone-200 hover:border-black hover:bg-stone-50 transition-all text-left"
                  >
                    <span className="font-bold text-stone-700 group-hover:text-black">{opt.label}</span>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-8 bg-stone-50 border-t-2 border-stone-100 flex justify-between items-center">
          <button 
            onClick={onSkip}
            className="text-stone-400 font-bold uppercase text-xs hover:text-black transition-colors"
          >
            Skip for now
          </button>
          <div className="flex gap-2">
            {QUESTIONS.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full border border-black ${i === currentStep ? 'bg-black' : 'bg-white'}`} 
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
