import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, ThinkingLevel, Modality, LiveServerMessage } from "@google/genai";
import { Send, Mic, MicOff, Bot, User, Sparkles, Zap, MessageSquare, X, Brain, Radio, Volume2 } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "model";
  text: string;
  isThinking?: boolean;
}

export const FocusFlowChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hello! I'm your Focus Flow companion. How can I help you find your flow today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveStatus, setLiveStatus] = useState<"idle" | "connecting" | "connected">("idle");
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const startLiveMode = async () => {
    if (isLiveMode) {
      setIsLiveMode(false);
      setLiveStatus("idle");
      sessionRef.current?.close();
      return;
    }

    setIsLiveMode(true);
    setLiveStatus("connecting");

    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are Focus Flow, a supportive and neuro-inclusive AI companion. You are in a real-time voice conversation. Be brief, empathetic, and helpful.",
        },
        callbacks: {
          onopen: () => {
            setLiveStatus("connected");
            setMessages(prev => [...prev, { role: "model", text: "[Live Conversation Started]" }]);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              playAudio(base64Audio);
            }
            if (message.serverContent?.modelTurn?.parts[0]?.text) {
              const text = message.serverContent.modelTurn.parts[0].text;
              setMessages(prev => [...prev, { role: "model", text }]);
            }
          },
          onclose: () => {
            setIsLiveMode(false);
            setLiveStatus("idle");
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setIsLiveMode(false);
            setLiveStatus("idle");
          }
        }
      });
      sessionRef.current = session;
    } catch (error) {
      console.error("Failed to connect to Live API:", error);
      setIsLiveMode(false);
      setLiveStatus("idle");
    }
  };

  const playAudio = (base64Data: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const float32Data = new Float32Array(bytes.buffer);
    const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const model = useDeepThinking ? "gemini-3.1-pro-preview" : "gemini-3.1-flash-lite-preview";
      const config: any = {
        systemInstruction: "You are Focus Flow, a supportive and neuro-inclusive AI companion designed to help users manage ADHD, find focus, and practice mindfulness. Be concise, encouraging, and use simple language. Avoid overwhelming the user with too much information.",
      };

      if (useDeepThinking) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }

      const chat = ai.chats.create({
        model,
        config,
        history: messages.filter(m => !m.text.startsWith("[")).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: "model", text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: "model", text: "Oops! Something went wrong. Let's try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-white rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden z-50"
    >
      {/* Header */}
      <div className="p-6 bg-yellow-400 border-b-4 border-black flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-black p-2 rounded-2xl">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tighter text-xl leading-none">Focus Flow</h3>
            <span className="text-[10px] font-bold uppercase opacity-60">AI Companion</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={startLiveMode}
            className={cn(
              "p-2 rounded-xl border-2 border-black transition-all",
              isLiveMode ? "bg-red-500 text-white animate-pulse" : "bg-white text-black hover:bg-stone-100"
            )}
            title="Live Voice Conversation"
          >
            <Radio size={20} />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={i}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center shrink-0",
              msg.role === "user" ? "bg-blue-400" : "bg-yellow-400"
            )}>
              {msg.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
            </div>
            <div className={cn(
              "p-4 rounded-3xl border-2 border-black text-sm font-medium max-w-[80%] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              msg.role === "user" ? "bg-white" : "bg-stone-100"
            )}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center bg-yellow-400 animate-bounce">
              <Sparkles size={16} />
            </div>
            <div className="p-4 rounded-3xl border-2 border-black bg-stone-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-black rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-black rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-white border-t-4 border-black space-y-4">
        <div className="flex items-center justify-between px-2">
          <button 
            onClick={() => setUseDeepThinking(!useDeepThinking)}
            disabled={isLiveMode}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase transition-all",
              useDeepThinking ? "bg-purple-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-stone-100",
              isLiveMode && "opacity-50 cursor-not-allowed"
            )}
          >
            <Brain size={12} />
            Deep Thinking
          </button>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-stone-400">
            {isLiveMode ? (
              <span className="flex items-center gap-1 text-red-500">
                <Radio size={12} className="animate-pulse" />
                {liveStatus}
              </span>
            ) : (
              <>
                <Zap size={12} className={useDeepThinking ? "text-purple-500" : "text-yellow-500"} />
                {useDeepThinking ? "Pro Mode" : "Flash Mode"}
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLiveMode ? "Speak to Focus Flow..." : "Ask me anything..."}
              disabled={isLiveMode}
              className="w-full bg-stone-100 border-2 border-black rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={toggleListening}
              disabled={isLiveMode}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
                isListening ? "bg-red-500 text-white animate-pulse" : "text-stone-400 hover:text-black",
                isLiveMode && "opacity-0"
              )}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>
          <button 
            type="submit"
            disabled={isLoading || !input.trim() || isLiveMode}
            className="bg-black text-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 transition-all"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </motion.div>
  );
};
