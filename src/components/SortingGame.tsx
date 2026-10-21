import React, { useEffect, useRef, useState } from "react";
import { GameObject, RuleType, GameState } from "../types";
import confetti from "canvas-confetti";

interface GameCanvasProps {
  onGameEnd: (state: GameState) => void;
  isChallenge?: boolean;
  syncRule?: RuleType;
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#1A535C"];
const SHAPES = ["circle", "square", "triangle"] as const;

export const SortingGame: React.FC<GameCanvasProps> = ({ onGameEnd, isChallenge, syncRule }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    errors: 0,
    currentRule: "color",
    lastRuleChange: Date.now(),
    inhibitionLatency: [],
    fidgetMetric: 0,
  });

  const objectsRef = useRef<GameObject[]>([]);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const sensorDataRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  // Initialize objects
  useEffect(() => {
    const spawnObject = () => {
      const id = Math.random().toString(36).substring(7);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      return {
        id,
        x: Math.random() * 600 + 100,
        y: -50,
        color,
        shape,
        size: 40,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 2,
      };
    };

    const interval = setInterval(() => {
      if (objectsRef.current.length < 10) {
        objectsRef.current.push(spawnObject());
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Sensor Integration
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma, alpha } = event;
      if (beta !== null && gamma !== null && alpha !== null) {
        // Simple tremor detection: measure high-frequency changes
        const dx = Math.abs(beta - sensorDataRef.current.x);
        const dy = Math.abs(gamma - sensorDataRef.current.y);
        sensorDataRef.current = { x: beta, y: gamma, z: alpha };
        
        setGameState(prev => ({
          ...prev,
          fidgetMetric: prev.fidgetMetric + (dx + dy) * 0.01
        }));
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  // Rule Switching Logic
  useEffect(() => {
    if (isChallenge && syncRule) {
      setGameState(prev => ({
        ...prev,
        currentRule: syncRule,
        lastRuleChange: Date.now()
      }));
    } else if (!isChallenge) {
      const interval = setInterval(() => {
        const nextRule: RuleType = Math.random() > 0.5 ? "color" : "shape";
        setGameState(prev => ({
          ...prev,
          currentRule: nextRule,
          lastRuleChange: Date.now()
        }));
      }, 10000); // Change rule every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isChallenge, syncRule]);

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw UI Hints (Neuro-inclusive: clear, high contrast)
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`RULE: SORT BY ${gameState.currentRule.toUpperCase()}`, canvas.width / 2, 40);

    // Update and draw objects
    objectsRef.current.forEach((obj, index) => {
      obj.y += obj.vy;
      obj.x += obj.vx;

      ctx.fillStyle = obj.color;
      ctx.beginPath();
      if (obj.shape === "circle") {
        ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
      } else if (obj.shape === "square") {
        ctx.rect(obj.x - obj.size / 2, obj.y - obj.size / 2, obj.size, obj.size);
      } else if (obj.shape === "triangle") {
        ctx.moveTo(obj.x, obj.y - obj.size / 2);
        ctx.lineTo(obj.x - obj.size / 2, obj.y + obj.size / 2);
        ctx.lineTo(obj.x + obj.size / 2, obj.y + obj.size / 2);
      }
      ctx.fill();
      ctx.closePath();

      // Remove off-screen objects
      if (obj.y > canvas.height + 50) {
        objectsRef.current.splice(index, 1);
      }
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState.currentRule]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedIndex = objectsRef.current.findIndex(obj => {
      const dist = Math.sqrt((obj.x - x) ** 2 + (obj.y - y) ** 2);
      return dist < obj.size;
    });

    if (clickedIndex !== -1) {
      const obj = objectsRef.current[clickedIndex];
      // Logic for sorting (simplified: just click the "right" one based on rule)
      // In a real game, you'd have target bins. Here we'll just check if it matches a target.
      // Let's say we want to click objects that match a specific color/shape.
      // For simplicity, let's assume any click is an attempt to "sort" it.
      
      // Measure Inhibition Latency
      const latency = Date.now() - gameState.lastRuleChange;
      
      // Correctness check (simplified for demo)
      const isCorrect = true; // Logic would go here
      
      if (isCorrect) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
        });
        setGameState(prev => ({
          ...prev,
          score: prev.score + 10,
          inhibitionLatency: [...prev.inhibitionLatency, latency]
        }));
      } else {
        setGameState(prev => ({ ...prev, errors: prev.errors + 1 }));
      }
      
      objectsRef.current.splice(clickedIndex, 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const clickedIndex = objectsRef.current.findIndex(obj => {
      const dist = Math.sqrt((obj.x - x) ** 2 + (obj.y - y) ** 2);
      return dist < obj.size;
    });

    if (clickedIndex !== -1) {
      const latency = Date.now() - gameState.lastRuleChange;
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x: touch.clientX / window.innerWidth, y: touch.clientY / window.innerHeight }
      });
      setGameState(prev => ({
        ...prev,
        score: prev.score + 10,
        inhibitionLatency: [...prev.inhibitionLatency, latency]
      }));
      objectsRef.current.splice(clickedIndex, 1);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-black">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        className="w-full h-auto cursor-crosshair"
      />
      <div className="absolute top-4 left-4 bg-black text-white px-4 py-2 rounded-full font-mono text-sm">
        SCORE: {gameState.score}
      </div>
      <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-mono text-sm">
        ERRORS: {gameState.errors}
      </div>
      <button 
        onClick={() => onGameEnd(gameState)}
        className="absolute bottom-4 right-4 bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition-colors"
      >
        END SESSION
      </button>
    </div>
  );
};
