import React, { useState, useEffect } from "react";
import { db, auth, OperationType, handleFirestoreError } from "../firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { motion } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Trophy, Zap, Activity, TrendingUp, Calendar, Clock, Brain, Star } from "lucide-react";
import { GAMES } from "../constants";
import { translations } from "../i18n";
import { Language } from "../types";

interface Session {
  id: string;
  score: number;
  errors: number;
  avgLatency: number;
  fidgetMetric: number;
  timestamp: any;
}

export const Dashboard: React.FC<{ onOpenPortal?: () => void; language?: Language }> = ({ onOpenPortal, language = "en" }) => {
  const t = translations[language];
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({
    totalSessions: 0,
    bestScore: 0,
    avgLatency: 0,
    avgFidget: 0
  });

  useEffect(() => {
    const fetchSessions = async () => {
      if (!auth.currentUser) return;

      try {
        // Fetch play counts
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setPlayCounts(userDoc.data().playCounts || {});
        }

        const q = query(
          collection(db, "sessions"),
          where("uid", "==", auth.currentUser.uid),
          orderBy("timestamp", "desc"),
          limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedSessions: Session[] = [];
        let totalScore = 0;
        let totalLatency = 0;
        let totalFidget = 0;
        let best = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const session = {
            id: doc.id,
            score: data.score,
            errors: data.errors,
            avgLatency: data.avgLatency,
            fidgetMetric: data.fidgetMetric,
            timestamp: data.timestamp?.toDate() || new Date()
          };
          fetchedSessions.push(session);
          
          totalScore += data.score;
          totalLatency += data.avgLatency;
          totalFidget += data.fidgetMetric;
          if (data.score > best) best = data.score;
        });

        setSessions(fetchedSessions.reverse());
        setStats({
          totalSessions: fetchedSessions.length,
          bestScore: best,
          avgLatency: fetchedSessions.length > 0 ? totalLatency / fetchedSessions.length : 0,
          avgFidget: fetchedSessions.length > 0 ? totalFidget / fetchedSessions.length : 0
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "sessions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header Stats */}
      <div className="flex justify-between items-center px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Your Progress</h2>
        <button 
          onClick={onOpenPortal}
          className="bg-black text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-black shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
        >
          <Brain size={16} className="text-yellow-400" /> {t.portal}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
        <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 text-stone-400 font-black uppercase text-[8px] md:text-[10px] tracking-widest mb-1 md:mb-2 text-center md:text-left">
            <Trophy size={12} /> Best Score
          </div>
          <div className="text-2xl md:text-4xl font-black text-center md:text-left">{stats.bestScore}</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 text-stone-400 font-black uppercase text-[8px] md:text-[10px] tracking-widest mb-1 md:mb-2 text-center md:text-left">
            <Zap size={12} /> Avg Latency
          </div>
          <div className="text-2xl md:text-4xl font-black text-center md:text-left">{stats.avgLatency.toFixed(0)}ms</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 text-stone-400 font-black uppercase text-[8px] md:text-[10px] tracking-widest mb-1 md:mb-2 text-center md:text-left">
            <Activity size={12} /> Fidget Index
          </div>
          <div className="text-2xl md:text-4xl font-black text-center md:text-left">{stats.avgFidget.toFixed(1)}</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 text-stone-400 font-black uppercase text-[8px] md:text-[10px] tracking-widest mb-1 md:mb-2 text-center md:text-left">
            <Calendar size={12} /> Sessions
          </div>
          <div className="text-2xl md:text-4xl font-black text-center md:text-left">{stats.totalSessions}</div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mx-4 md:mx-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <TrendingUp size={24} /> Performance Progress
          </h3>
          <div className="flex gap-4 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400 rounded-full" /> Score</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-black rounded-full" /> Latency</div>
          </div>
        </div>
        
        <div className="h-[200px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sessions}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(time) => new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 10, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: '2px solid black', fontWeight: 'bold' }}
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Area type="monotone" dataKey="score" stroke="#facc15" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              <Line type="monotone" dataKey="avgLatency" stroke="#000" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 px-4 md:px-0">
        <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-lg md:text-xl font-black uppercase mb-6 flex items-center gap-2">
            <Clock size={20} /> Recent Sessions
          </h3>
          <div className="space-y-4">
            {sessions.slice().reverse().map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 md:p-4 bg-stone-50 rounded-2xl border-2 border-stone-100">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-black text-white p-2 rounded-xl">
                    <Brain size={14} md:size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-tight">Session #{session.id.slice(0, 4)}</div>
                    <div className="text-[8px] md:text-[10px] font-bold text-stone-400 uppercase">{new Date(session.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base md:text-lg font-black text-yellow-500">+{session.score}</div>
                  <div className="text-[8px] md:text-[10px] font-bold text-stone-400 uppercase">{session.avgLatency}ms</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-stone-900 text-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg md:text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Star size={20} className="text-yellow-400" /> Top Played
            </h3>
            <div className="space-y-3">
              {playCounts && Object.entries(playCounts)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 3)
                .map(([gameId, count]) => {
                  const game = GAMES.find(g => g.id === gameId);
                  return (
                    <div key={gameId} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-400 text-black p-1.5 rounded-lg">
                          <Brain size={12} />
                        </div>
                        <div className="text-xs font-black uppercase tracking-tight">{game?.title || gameId}</div>
                      </div>
                      <div className="text-xs font-bold text-stone-400 uppercase">{count} plays</div>
                    </div>
                  );
                })}
              {(!playCounts || Object.keys(playCounts).length === 0) && (
                <div className="text-stone-500 text-xs font-bold uppercase italic p-4 text-center">No games played yet</div>
              )}
            </div>

            <h3 className="text-lg md:text-xl font-black uppercase mt-8 mb-6 flex items-center gap-2">
              <Zap size={20} className="text-yellow-400" /> Focus Insight
            </h3>
            <div className="space-y-4 md:space-y-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs md:text-sm font-medium italic text-stone-300">
                  "Your inhibition latency has improved by 12% over the last 5 sessions. You're adapting to rule changes much faster!"
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs md:text-sm font-medium italic text-stone-300">
                  "Try 'The Rhythm Keeper' to further sharpen your subitizing speed, which currently tracks slightly below your average."
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={onOpenPortal}
            className="w-full mt-8 bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform"
          >
            Generate Clinical Report
          </button>
        </div>
      </div>
    </div>
  );
};
