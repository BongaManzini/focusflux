import React, { useState } from "react";
import { GameState } from "../types";
import { Brain, Activity, Zap, TrendingUp, Mail, FileText } from "lucide-react";
import { motion } from "motion/react";
import { db, auth, OperationType, handleFirestoreError } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { ReportSender } from "./ReportSender";

export const CognitiveReport: React.FC<{ 
  state: GameState; 
  gameId?: string;
  onRestart: () => void; 
  onOpenPortal?: () => void 
}> = ({ state, gameId, onRestart, onOpenPortal }) => {
  const [showReportSender, setShowReportSender] = useState(false);
  const avgLatency = state.inhibitionLatency.length > 0 
    ? (state.inhibitionLatency.reduce((a, b) => a + b, 0) / state.inhibitionLatency.length).toFixed(0)
    : "0";

  React.useEffect(() => {
    const saveSession = async () => {
      if (!auth.currentUser) return;

      const sessionId = Math.random().toString(36).substring(7);
      const sessionData = {
        sessionId,
        uid: auth.currentUser.uid,
        gameId: gameId || "unknown",
        score: state.score,
        errors: state.errors,
        avgLatency: Number(avgLatency),
        fidgetMetric: state.fidgetMetric,
        timestamp: serverTimestamp()
      };

      try {
        // Save session
        await addDoc(collection(db, "sessions"), sessionData);

        // Update user stats
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const newBestScore = Math.max(userData.bestScore || 0, state.score);
          
          // Update recent games list (max 3)
          let recentGames = userData.recentGames || [];
          if (gameId) {
            recentGames = [gameId, ...recentGames.filter((id: string) => id !== gameId)].slice(0, 3);
          }

          await updateDoc(userRef, {
            bestScore: newBestScore,
            avgLatency: Number(avgLatency),
            fidgetMetric: state.fidgetMetric,
            recentGames
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "sessions or users");
      }
    };

    saveSession();
  }, [state, avgLatency, gameId]);

  const generateInsight = () => {
    const accuracy = state.score > 0 ? (state.score / (state.score + state.errors * 10)) * 100 : 0;
    const latency = Number(avgLatency);
    
    if (state.errors > 5 && latency < 400) {
      return "You're moving very fast, but accuracy is dropping. This suggests 'Impulsive Responding'. Try slowing down to improve your inhibition control.";
    }
    if (latency > 1200) {
      return "Your latency is high, suggesting a 'High Switching Cost'. You might be finding it difficult to transition between different rules or tasks.";
    }
    if (state.fidgetMetric > 15) {
      return "High micro-tremors detected. This 'Fidget Index' suggests you might be experiencing sensory overload or motor restlessness right now.";
    }
    if (accuracy > 90 && latency > 800) {
      return "Excellent accuracy! However, your high latency suggests 'Perfectionist Processing'. You're sacrificing speed for perfect results.";
    }
    if (accuracy > 90 && latency < 500) {
      return "Peak Performance! You've achieved a flow state with high speed and high accuracy. Your cognitive flexibility is currently optimal.";
    }
    return "Your focus was consistent throughout the session. You adapted well to the changing patterns.";
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-yellow-400 p-4 rounded-2xl border-2 border-black">
          <Brain size={32} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Cognitive Profile</h2>
          <p className="text-gray-500 font-medium text-sm">Session Analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-50 p-6 rounded-3xl border-2 border-stone-200"
        >
          <div className="flex items-center gap-2 text-stone-500 mb-2 font-bold uppercase text-[10px]">
            <Zap size={14} />
            Inhibition Latency
          </div>
          <div className="text-3xl md:text-4xl font-black">{avgLatency}ms</div>
          <p className="text-[10px] text-stone-400 mt-2 font-medium">Time to adapt to rule changes.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-stone-50 p-6 rounded-3xl border-2 border-stone-200"
        >
          <div className="flex items-center gap-2 text-stone-500 mb-2 font-bold uppercase text-[10px]">
            <Activity size={14} />
            Fidget Metric
          </div>
          <div className="text-3xl md:text-4xl font-black">{state.fidgetMetric.toFixed(1)}</div>
          <p className="text-[10px] text-stone-400 mt-2 font-medium">Micro-tremors detected.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-stone-50 p-6 rounded-3xl border-2 border-stone-200 sm:col-span-2"
        >
          <div className="flex items-center gap-2 text-stone-500 mb-2 font-bold uppercase text-[10px]">
            <TrendingUp size={14} />
            Accuracy Rate
          </div>
          <div className="text-3xl md:text-4xl font-black">
            {state.score > 0 ? ((state.score / (state.score + state.errors * 10)) * 100).toFixed(0) : 0}%
          </div>
          <p className="text-[10px] text-stone-400 mt-2 font-medium">Success vs Inhibition errors.</p>
        </motion.div>
      </div>

      <div className="bg-black text-white p-6 rounded-3xl mb-8 border-4 border-yellow-400">
        <h3 className="font-bold uppercase text-[10px] mb-2 text-yellow-400 tracking-widest">Struggle Detection & Insight</h3>
        <p className="text-base md:text-lg leading-relaxed font-medium">
          {generateInsight()}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <button 
          onClick={() => setShowReportSender(true)}
          className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Mail size={18} /> Email Report
        </button>
        <button 
          onClick={onOpenPortal}
          className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <FileText size={18} /> Clinical Portal
        </button>
      </div>
      <button 
        onClick={onRestart}
        className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
      >
        Start New Session
      </button>

      {showReportSender && <ReportSender state={state} onClose={() => setShowReportSender(false)} />}
    </div>
  );
};
