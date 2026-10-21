import React, { useState, useEffect } from "react";
import { GoogleGenAI, Modality } from "@google/genai";
import { GameState } from "../types";
import { Mail, MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReportSenderProps {
  state: GameState;
  onClose: () => void;
}

export const ReportSender: React.FC<ReportSenderProps> = ({ state, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "ready" | "error">("idle");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Location access denied")
      );
    }
  }, []);

  const generateReport = async () => {
    setLoading(true);
    setStatus("generating");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const avgLatency = state.inhibitionLatency.length > 0 
        ? (state.inhibitionLatency.reduce((a, b) => a + b, 0) / state.inhibitionLatency.length).toFixed(0)
        : "0";

      const prompt = `
        Generate a professional yet supportive cognitive assessment report for a user based on these metrics:
        - Accuracy: ${((state.score / (state.score + state.errors * 10)) * 100).toFixed(0)}%
        - Inhibition Latency: ${avgLatency}ms
        - Fidget Metric (Micro-tremors): ${state.fidgetMetric.toFixed(1)}
        - Errors: ${state.errors}

        The report should include:
        1. Executive Summary: A brief overview of their performance.
        2. Problem Areas: Specific cognitive struggles identified (e.g., impulsivity, switching costs, sensory overload).
        3. Recommendations for Parents/Caregivers: Practical advice on how to support the user at home or school.
        4. Nearby Support: Mention that I've searched for clinics nearby.

        Also, please find the nearest neurodiversity-friendly clinics or healthcare centers.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: location || { latitude: -26.2041, longitude: 28.0473 } // Default to Johannesburg if no location
            }
          }
        },
      });

      setReport(response.text);
      
      // Extract clinic URLs if available
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const mapsLinks = chunks
          .filter((c: any) => c.maps)
          .map((c: any) => ({
            uri: c.maps.uri,
            title: c.maps.title
          }));
        setClinics(mapsLinks);
      }

      setStatus("ready");
    } catch (error) {
      console.error("Report generation failed:", error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = () => {
    if (!report) return;
    const subject = encodeURIComponent("Focus Flux: Cognitive Performance Report");
    const body = encodeURIComponent(
      `${report}\n\nRecommended Clinics:\n${clinics.map(c => `- ${c.title}: ${c.uri}`).join("\n")}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[40px] border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b-4 border-black flex justify-between items-center bg-yellow-400">
          <div className="flex items-center gap-3">
            <Mail size={32} className="text-black" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Send Clinical Report</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <AlertCircle size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          {status === "idle" && (
            <div className="text-center py-12">
              <p className="text-stone-600 font-medium mb-8">
                Generate a comprehensive report including cognitive insights and nearby healthcare centers to share with a parent or professional.
              </p>
              <button 
                onClick={generateReport}
                className="bg-black text-white px-8 py-4 rounded-3xl font-black uppercase tracking-widest border-4 border-yellow-400 hover:bg-stone-800 transition-all"
              >
                Generate Report
              </button>
            </div>
          )}

          {status === "generating" && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={48} className="animate-spin text-yellow-500" />
              <p className="font-black uppercase tracking-widest text-stone-400">Analyzing metrics & finding clinics...</p>
            </div>
          )}

          {status === "ready" && (
            <div className="space-y-6">
              <div className="bg-stone-50 p-6 rounded-3xl border-2 border-stone-200">
                <h3 className="font-black uppercase text-xs text-stone-400 mb-4 tracking-widest">Report Preview</h3>
                <div className="prose prose-sm max-w-none text-stone-700 font-medium whitespace-pre-wrap">
                  {report}
                </div>
              </div>

              {clinics.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-200">
                  <h3 className="font-black uppercase text-xs text-blue-400 mb-4 tracking-widest flex items-center gap-2">
                    <MapPin size={14} /> Nearby Support Centers
                  </h3>
                  <div className="space-y-2">
                    {clinics.map((clinic, i) => (
                      <a 
                        key={i} 
                        href={clinic.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-3 bg-white rounded-xl border-2 border-blue-100 hover:border-blue-400 transition-all text-sm font-bold text-blue-600"
                      >
                        {clinic.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t-2 border-stone-100">
                <label className="block text-xs font-black uppercase text-stone-400 tracking-widest">Recipient Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full p-4 rounded-2xl border-4 border-black font-bold outline-none focus:ring-4 focus:ring-yellow-400/20"
                />
                <button 
                  onClick={sendEmail}
                  disabled={!email}
                  className="w-full bg-yellow-400 text-black py-6 rounded-3xl font-black uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send via Email Client
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-12 text-red-500">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest">Failed to generate report.</p>
              <button onClick={() => setStatus("idle")} className="mt-4 text-stone-500 font-bold underline">Try Again</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
