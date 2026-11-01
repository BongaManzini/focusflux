import React from "react";
import { motion } from "motion/react";

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-12">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full"
      />
    </div>
  );
};
