import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight } from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
}

interface TutorialModalProps {
  title: string;
  steps: TutorialStep[];
  onComplete: () => void;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ title, steps, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-lg rounded-[40px] border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter">{title} - Tutorial</h2>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">{steps[currentStep].title}</h3>
            <p className="text-stone-600 font-medium leading-relaxed">{steps[currentStep].description}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i === currentStep ? "bg-black" : "bg-stone-300"}`} />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className="bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest border-2 border-black flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
