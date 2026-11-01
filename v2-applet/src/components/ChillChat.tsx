import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ChatMessage } from "../types";
import { Send, Ghost, MessageSquare, Mic, MicOff } from "lucide-react";
import { cn } from "../lib/utils";

export const ChillChat: React.FC<{ user: string; room: string }> = ({ user, room }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGhost, setIsGhost] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.emit("join-room", room);

    socketRef.current.on("new-message", (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    // Initialize Speech Recognition
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

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      socketRef.current?.disconnect();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [room]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGhost) return;

    socketRef.current?.emit("chat-message", {
      room,
      user,
      text: input,
    });
    setInput("");
  };

  return (
    <div className={cn(
      "flex flex-col h-[400px] w-full max-w-md bg-stone-100 rounded-3xl border-2 border-stone-300 overflow-hidden transition-opacity duration-500",
      isGhost && "opacity-40 pointer-events-none"
    )}>
      <div className="p-4 bg-stone-200 border-bottom border-stone-300 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-stone-700">
          <MessageSquare size={18} />
          CHILL CHAT
        </div>
        <button 
          onClick={() => setIsGhost(!isGhost)}
          className={cn(
            "p-2 rounded-full transition-colors",
            isGhost ? "bg-stone-400 text-white" : "bg-stone-300 text-stone-600 hover:bg-stone-400"
          )}
          title="Ghost Mode (Mute & Fade)"
        >
          <Ghost size={18} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "max-w-[80%] p-3 rounded-2xl text-sm",
            msg.user === user 
              ? "bg-stone-800 text-white ml-auto rounded-tr-none" 
              : "bg-white text-stone-800 rounded-tl-none border border-stone-200"
          )}>
            <div className="text-[10px] opacity-50 mb-1 uppercase font-bold tracking-wider">
              {msg.user}
            </div>
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-stone-200 flex gap-2 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isGhost ? "Ghost mode active..." : "Type gently..."}
          disabled={isGhost}
          className="flex-1 bg-stone-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-stone-400 outline-none"
        />
        <button
          type="button"
          onClick={toggleListening}
          disabled={isGhost || !recognitionRef.current}
          className={cn(
            "p-2 rounded-full transition-all",
            isListening ? "bg-red-500 text-white animate-pulse" : "bg-stone-200 text-stone-600 hover:bg-stone-300"
          )}
          title={isListening ? "Stop Listening" : "Start Voice Input"}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button 
          type="submit"
          disabled={isGhost || !input.trim()}
          className="bg-stone-800 text-white p-2 rounded-full disabled:opacity-50 transition-transform active:scale-90"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
