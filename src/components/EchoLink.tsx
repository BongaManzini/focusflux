import React, { useState, useEffect, useCallback } from "react";
import { GoogleGenAI, Modality } from "@google/genai";
import { GameState, Language } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface EchoLinkProps {
  onGameEnd: (state: GameState) => void;
  language: Language;
}

export const EchoLink: React.FC<EchoLinkProps> = ({ onGameEnd, language }) => {
  const [targetWord, setTargetWord] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<Int16Array | null>(null);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const wordLists: Record<Language, string[]> = {
    en: ["GORP", "ZINT", "PLUMF", "KLORB", "VEXT", "DRIM", "SKWEEB", "FLORP", "GLINT", "STRUM", "BLAST", "CRISP", "DWELL", "FROST", "GRASP", "PLUMB"],
    zu: ["THANDA", "HAMBA", "KHULUMA", "FUNDA", "DLALA", "SEBENZA", "BONA", "ZWA", "DLA", "PHUZA", "LALA", "VUKA", "HLALA", "MA", "BALA", "BHALA"],
    xh: ["MOLO", "ENKOSI", "BHOTA", "CAMAGU", "KHAYA", "MNTWANA", "SISI", "BHUTI", "MAMA", "TATA", "GOGO", "MKHULU", "THANDO", "KHANYA", "KHULULEKA", "VUYANI"],
    af: ["LEKKER", "DANKIE", "ASSEBLIEF", "MOOI", "GROET", "LIEFDE", "VREDE", "HOOP", "GELOOF", "KRAG", "SON", "MAAN", "STER", "BOOM", "HUIS", "KIND"],
    st: ["DUMELA", "KE_A_LEBOHA", "TSAMAYA", "TLAA", "JA", "NWA", "ROBALA", "TSOHA", "BAPALA", "BINA", "HLAPA", "APARA", "BALA", "NGOLA", "ITHUTE", "SEBETSA"]
  };

  const generateLevel = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    setAudioData(null);
    
    const currentWords = wordLists[language] || wordLists.en;
    const word = currentWords[Math.floor(Math.random() * currentWords.length)];
    setTargetWord(word);

    // Generate options: target + similar sounding variations or other words from the list
    const otherWords = currentWords.filter(w => w !== word);
    const variations = [
      word,
      ...otherWords.sort(() => Math.random() - 0.5).slice(0, 3)
    ].sort(() => Math.random() - 0.5);
    
    setOptions(variations);

    const langNames: Record<Language, string> = {
      en: "English",
      zu: "isiZulu",
      xh: "isiXhosa",
      af: "Afrikaans",
      st: "Sesotho"
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly and slowly in ${langNames[language]}: ${word}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binary = atob(base64Audio);
        const len = binary.length;
        const int16Data = new Int16Array(len / 2);
        for (let i = 0; i < len; i += 2) {
          int16Data[i / 2] = (binary.charCodeAt(i + 1) << 8) | binary.charCodeAt(i);
        }
        setAudioData(int16Data);
      }
    } catch (err) {
      console.error("TTS Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [ai]);

  useEffect(() => {
    generateLevel();
  }, []);

  const playAudio = async () => {
    if (!audioData || isPlaying) return;
    
    setIsPlaying(true);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const audioBuffer = audioContext.createBuffer(1, audioData.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      for (let i = 0; i < audioData.length; i++) {
        channelData[i] = audioData[i] / 32768;
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } catch (err) {
      console.error("Playback Error:", err);
      setIsPlaying(false);
    }
  };

  const handleSelect = (word: string) => {
    if (word === targetWord) {
      setScore(s => s + 10);
      setFeedback("correct");
      setTimeout(generateLevel, 1000);
    } else {
      setErrors(e => e + 1);
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-12 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
      <div className="mb-12">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Echo Link</h2>
        <p className="text-stone-500 font-bold uppercase text-xs tracking-widest">Bridging Sound to Symbol</p>
      </div>

      <div className="flex justify-center mb-12">
        <button
          onClick={playAudio}
          disabled={isLoading || !audioData}
          className={`w-32 h-32 rounded-full border-4 border-black flex items-center justify-center transition-all ${
            isPlaying ? "bg-yellow-400 scale-110" : "bg-stone-100 hover:bg-stone-200"
          } ${isLoading ? "animate-pulse" : ""}`}
        >
          {isLoading ? <Loader2 className="animate-spin" size={48} /> : <Volume2 size={48} />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(opt)}
            disabled={isLoading || feedback === "correct"}
            className={`p-6 rounded-3xl border-4 border-black text-2xl font-black uppercase transition-colors ${
              feedback === "correct" && opt === targetWord ? "bg-green-400" :
              feedback === "wrong" && opt !== targetWord ? "bg-stone-100" : "bg-white hover:bg-stone-50"
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            {feedback === "correct" ? (
              <div className="flex items-center gap-2 text-green-600 font-black uppercase tracking-widest">
                <CheckCircle2 /> Correct Phoneme Match
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 font-black uppercase tracking-widest">
                <XCircle /> Auditory Mismatch
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 pt-8 border-t-2 border-stone-100 flex justify-between items-center">
        <div className="text-left">
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Phonological Awareness</div>
          <div className="text-lg font-black">{score} Points</div>
        </div>
        <button
          onClick={() => onGameEnd({ score, errors, currentRule: "echo", lastRuleChange: 0, inhibitionLatency: [], fidgetMetric: 0 })}
          className="bg-black text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-stone-800 transition-all"
        >
          End Session
        </button>
      </div>
    </div>
  );
};
