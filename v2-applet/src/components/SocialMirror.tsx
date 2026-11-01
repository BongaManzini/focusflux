import React, { useState } from "react";
import { GameState } from "../types";
import { motion } from "motion/react";
import { Target, CheckCircle, XCircle } from "lucide-react";

interface SocialMirrorProps {
  onGameEnd: (state: GameState) => void;
}

const stages = [
  {
    name: "Basic Emotions",
    scenarios: [
      { scenario: "Someone is smiling and laughing at a joke.", options: ["Happy", "Sad", "Angry"], correct: 0 },
      { scenario: "Someone is crying because they lost a toy.", options: ["Happy", "Sad", "Neutral"], correct: 1 },
      { scenario: "Someone is yelling and has a red face.", options: ["Happy", "Neutral", "Angry"], correct: 2 },
    ]
  },
  {
    name: "Complex Emotions",
    scenarios: [
      { scenario: "Someone's eyes are wide open and their mouth is dropped.", options: ["Surprised", "Disgusted", "Fearful"], correct: 0 },
      { scenario: "Someone is making a face like they smelled something bad.", options: ["Happy", "Disgusted", "Surprised"], correct: 1 },
      { scenario: "Someone is shaking and hiding behind a chair.", options: ["Happy", "Angry", "Fearful"], correct: 2 },
    ]
  },
  {
    name: "Social Cues & Sarcasm",
    scenarios: [
      { scenario: "A friend says, 'Oh great, another rainy day!' while looking at dark clouds.", options: ["Genuine", "Sarcastic", "Confused"], correct: 1 },
      { scenario: "Someone says, 'Wow, you're a genius!' after you accidentally drop your keys.", options: ["Compliment", "Sarcastic", "Angry"], correct: 1 },
      { scenario: "Your coworker says, 'I love how you always leave your dirty dishes in the sink.'", options: ["Genuine", "Sarcastic", "Helpful"], correct: 1 },
    ]
  }
];

export const SocialMirror: React.FC<SocialMirrorProps> = ({ onGameEnd }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<{message: string, isCorrect: boolean} | null>(null);
  const [isActive, setIsActive] = useState(false);

  const handleAnswer = (index: number) => {
    const isCorrect = index === stages[currentStage].scenarios[currentScenarioIndex].correct;
    if (isCorrect) {
      setScore(s => s + 10);
      setFeedback({message: "Correct!", isCorrect: true});
    } else {
      setErrors(e => e + 1);
      setFeedback({message: `Incorrect! The correct answer was: ${stages[currentStage].scenarios[currentScenarioIndex].options[stages[currentStage].scenarios[currentScenarioIndex].correct]}`, isCorrect: false});
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentScenarioIndex < stages[currentStage].scenarios.length - 1) {
        setCurrentScenarioIndex(i => i + 1);
      } else if (currentStage < stages.length - 1) {
        setCurrentStage(s => s + 1);
        setCurrentScenarioIndex(0);
      } else {
        onGameEnd({ score: isCorrect ? score + 10 : score, errors: isCorrect ? errors : errors + 1, currentRule: "social", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 });
      }
    }, 2000);
  };

  if (!isActive) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-[40px] border-4 border-black shadow-2xl text-center">
        <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto mb-8 flex items-center justify-center border-4 border-black">
          <Target size={48} className="text-black" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase mb-4 tracking-tighter bg-black py-2 px-4 inline-block">Social Mirror</h2>
        <p className="text-stone-500 mb-12 font-medium">
          Identify the social cue in each scenario. Progress through stages from basic emotions to complex social cues like sarcasm.
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

  const scenario = stages[currentStage].scenarios[currentScenarioIndex];

  return (
    <div className="w-full max-w-2xl mx-auto bg-stone-50 p-8 rounded-[40px] border-4 border-black relative shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <div className="bg-white px-4 py-2 rounded-xl border-2 border-black font-black text-xs">SCORE: {score}</div>
        <div className="bg-red-500 px-4 py-2 rounded-xl border-2 border-black font-black text-xs text-white">ERRORS: {errors}</div>
        <div className="bg-yellow-400 px-4 py-2 rounded-xl border-2 border-black font-black text-xs">STAGE: {stages[currentStage].name}</div>
      </div>

      <div className="bg-white p-8 rounded-3xl border-4 border-black mb-8">
        <p className="text-xl font-medium text-stone-800 leading-relaxed">{scenario.scenario}</p>
      </div>

      <div className="grid gap-4">
        {scenario.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className="bg-white p-6 rounded-2xl border-4 border-black font-bold text-left hover:bg-stone-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {option}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 rounded-3xl border-4 border-black shadow-2xl z-20 text-center ${feedback.isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {feedback.isCorrect ? <CheckCircle size={48} className="mx-auto mb-4" /> : <XCircle size={48} className="mx-auto mb-4" />}
          <p className="font-black text-xl">{feedback.message}</p>
        </div>
      )}
    </div>
  );
};
