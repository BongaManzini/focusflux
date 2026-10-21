import React, { useState, useEffect, useRef } from "react";
import { db, auth, OperationType, handleFirestoreError } from "../firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Printer, 
  Mail, 
  ChevronRight, 
  Calendar, 
  Activity, 
  Zap, 
  Brain, 
  MapPin, 
  AlertCircle,
  Download,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { translations } from "../i18n";
import { Language } from "../types";

interface Session {
  id: string;
  score: number;
  errors: number;
  avgLatency: number;
  fidgetMetric: number;
  timestamp: Date;
}

interface ClinicalReport {
  summary: string;
  problemAreas: string[];
  recommendations: string[];
  clinics: { name: string; address: string; phone?: string }[];
}

export const ClinicalPortal: React.FC<{ onBack: () => void; language?: Language }> = ({ onBack, language = "en" }) => {
  const t = translations[language];
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [report, setReport] = useState<ClinicalReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, "sessions"),
          where("uid", "==", auth.currentUser.uid),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as Session[];
        setSessions(fetched);
        if (fetched.length > 0) {
          setSelectedSession(fetched[0]);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "sessions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      generateClinicalAnalysis(selectedSession);
    }
  }, [selectedSession]);

  const generateClinicalAnalysis = async (session: Session) => {
    setIsGenerating(true);
    setReport(null);
    
    try {
      // 1. Check Cache First
      const reportRef = doc(db, "reports", session.id);
      const cachedReport = await getDoc(reportRef);
      
      if (cachedReport.exists()) {
        setReport(cachedReport.data() as ClinicalReport);
        setIsGenerating(false);
        return;
      }

      // 2. If not cached, call Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Get location for clinic search
      let locationStr = "Johannesburg, South Africa";
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        locationStr = `${pos.coords.latitude}, ${pos.coords.longitude}`;
      } catch (e) {
        console.log("Location access denied, using default");
      }

      const prompt = `Analyze this cognitive performance data for a clinical report:
      - Score: ${session.score}
      - Errors: ${session.errors}
      - Average Latency: ${session.avgLatency}ms
      - Fidget Metric (Micro-tremors): ${session.fidgetMetric}
      
      Provide:
      1. An executive clinical summary.
      2. 3-4 specific problem areas identified.
      3. 3-4 recommendations for parents/caregivers.
      4. Find 3 nearby neurodiversity or cognitive healthcare clinics near ${locationStr}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              problemAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              clinics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    address: { type: Type.STRING },
                    phone: { type: Type.STRING }
                  }
                }
              }
            }
          },
        }
      });

      const data = JSON.parse(response.text);
      setReport(data);

      // 3. Save to Cache
      await setDoc(doc(db, "reports", session.id), {
        ...data,
        sessionId: session.id,
        uid: auth.currentUser?.uid,
        generatedAt: new Date()
      });
    } catch (error) {
      console.error("Failed to generate analysis:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    if (!report || !selectedSession) return;
    
    const body = `
COGNITIVE PERFORMANCE REPORT
Date: ${selectedSession.timestamp.toLocaleDateString()}
Session ID: ${selectedSession.id}

EXECUTIVE SUMMARY:
${report.summary}

PROBLEM AREAS:
${report.problemAreas.map(p => `- ${p}`).join('\n')}

RECOMMENDATIONS:
${report.recommendations.map(r => `- ${r}`).join('\n')}

NEARBY CLINICS:
${report.clinics.map(c => `- ${c.name}: ${c.address} (${c.phone || 'N/A'})`).join('\n')}

Generated by Focus Flux Clinical Portal.
    `;

    window.location.href = `mailto:?subject=Cognitive Report - ${selectedSession.timestamp.toLocaleDateString()}&body=${encodeURIComponent(body)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 font-black uppercase tracking-widest text-sm hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div className="flex gap-4">
            <button 
              onClick={handlePrint}
              disabled={!report}
              className="bg-white border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={handleEmail}
              disabled={!report}
              className="bg-yellow-400 border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
            >
              <Mail size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar: Session History */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 mb-4">
              <Calendar size={24} /> Session History
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    selectedSession?.id === session.id 
                      ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]" 
                      : "bg-white border-stone-200 hover:border-black"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      {session.timestamp.toLocaleDateString()}
                    </span>
                    <ChevronRight size={14} />
                  </div>
                  <div className="text-lg font-black tracking-tight">Score: {session.score}</div>
                  <div className="flex gap-4 mt-2 text-[10px] font-bold uppercase opacity-80">
                    <span>{session.avgLatency}ms</span>
                    <span>{session.errors} Errors</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content: Analysis Report */}
          <div className="lg:col-span-2 space-y-8 print:col-span-3">
            <div 
              ref={reportRef}
              className="bg-white p-8 md:p-12 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] print:shadow-none print:border-none"
            >
              {selectedSession ? (
                <div className="space-y-8">
                  {/* Report Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-stone-100 pb-8">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">{t.portal}</h2>
                      <p className="text-stone-400 font-bold uppercase text-xs tracking-widest">
                        Session ID: {selectedSession.id} • {selectedSession.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-yellow-400 p-4 rounded-3xl border-2 border-black">
                      <Brain size={40} />
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-stone-50 rounded-2xl border-2 border-stone-100">
                      <div className="text-[8px] font-black uppercase text-stone-400 mb-1">Latency</div>
                      <div className="text-xl font-black">{selectedSession.avgLatency}ms</div>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-2xl border-2 border-stone-100">
                      <div className="text-[8px] font-black uppercase text-stone-400 mb-1">Fidget</div>
                      <div className="text-xl font-black">{selectedSession.fidgetMetric.toFixed(1)}</div>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-2xl border-2 border-stone-100">
                      <div className="text-[8px] font-black uppercase text-stone-400 mb-1">Errors</div>
                      <div className="text-xl font-black">{selectedSession.errors}</div>
                    </div>
                  </div>

                  {/* AI Content */}
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-20 flex flex-col items-center justify-center gap-4"
                      >
                        <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
                        <p className="font-black uppercase text-xs tracking-widest animate-pulse">Analyzing Cognitive Patterns...</p>
                      </motion.div>
                    ) : report ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                      >
                        {/* Summary */}
                        <section>
                          <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-4">
                            <FileText size={18} className="text-yellow-500" /> Executive Summary
                          </h4>
                          <p className="text-lg leading-relaxed font-medium text-stone-700 italic">
                            "{report.summary}"
                          </p>
                        </section>

                        {/* Problem Areas */}
                        <section>
                          <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-4">
                            <AlertCircle size={18} className="text-red-500" /> Detected Struggle Areas
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {report.problemAreas.map((area, i) => (
                              <div key={i} className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-sm font-bold text-red-700">
                                {area}
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Recommendations */}
                        <section>
                          <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-4">
                            <Activity size={18} className="text-green-500" /> Caregiver Recommendations
                          </h4>
                          <ul className="space-y-3">
                            {report.recommendations.map((rec, i) => (
                              <li key={i} className="flex gap-3 text-sm font-medium text-stone-600">
                                <span className="text-yellow-500 font-black">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </section>

                        {/* Clinics */}
                        <section className="print:hidden">
                          <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-4">
                            <MapPin size={18} className="text-blue-500" /> Nearby Support Centers
                          </h4>
                          <div className="space-y-3">
                            {report.clinics.map((clinic, i) => (
                              <div key={i} className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl">
                                <div className="font-black uppercase text-xs mb-1">{clinic.name}</div>
                                <div className="text-[10px] font-bold text-stone-500 mb-2">{clinic.address}</div>
                                {clinic.phone && (
                                  <div className="text-[10px] font-black text-blue-600">{clinic.phone}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      </motion.div>
                    ) : (
                      <div className="py-20 text-center text-stone-400 font-bold uppercase text-xs">
                        Select a session to view detailed analysis
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-40 text-center">
                  <Brain size={48} className="mx-auto mb-4 text-stone-200" />
                  <p className="font-black uppercase text-stone-400 tracking-widest">No sessions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:col-span-3 { grid-column: span 3 / span 3 !important; }
          .custom-scrollbar { overflow: visible !important; }
        }
      `}} />
    </div>
  );
};
