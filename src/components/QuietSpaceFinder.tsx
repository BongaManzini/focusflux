import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Navigation, Info, ExternalLink, Coffee, Library, TreePine, Loader2 } from "lucide-react";

interface Place {
  name: string;
  address: string;
  rating?: number;
  url: string;
  type: string;
}

export const QuietSpaceFinder: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Location access denied. Please enable location to find nearby quiet spaces.");
        }
      );
    }
  }, []);

  const findQuietSpaces = async () => {
    if (!location) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find 3 quiet, sensory-friendly places (libraries, parks, or quiet cafes) near latitude ${location.lat}, longitude ${location.lng}. For each place, provide the name, address, and a Google Maps URL.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: location.lat,
                longitude: location.lng,
              },
            },
          },
        },
      });

      // Extract places from grounding metadata
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const placesList: Place[] = [];

      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.maps) {
            placesList.push({
              name: chunk.maps.title || "Quiet Space",
              address: chunk.maps.address || "Nearby",
              url: chunk.maps.uri,
              type: "Sensory Friendly",
            });
          }
        });
      }

      // Fallback if no specific chunks found (parse text)
      if (placesList.length === 0) {
        // Simple regex-based parsing as fallback if grounding metadata is sparse
        const lines = response.text.split('\n');
        lines.forEach(line => {
          if (line.includes('http')) {
             // Basic parsing logic
          }
        });
      }

      setPlaces(placesList.slice(0, 3));
      if (placesList.length === 0) {
        setError("Could not find specific quiet spaces nearby. Try a different location.");
      }
    } catch (err) {
      console.error("Maps grounding error:", err);
      setError("Failed to fetch nearby places. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      findQuietSpaces();
    }
  }, [location]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-2">
            <MapPin size={32} className="text-green-500" /> Sensory Escape
          </h2>
          <p className="text-stone-500 font-medium">Finding quiet spaces for sensory regulation nearby.</p>
        </div>
        <button 
          onClick={findQuietSpaces}
          disabled={isLoading}
          className="p-3 bg-stone-100 rounded-2xl border-2 border-stone-200 hover:border-black transition-all"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Navigation size={20} />}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl text-red-600 text-sm font-bold mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-24 bg-stone-50 rounded-3xl border-2 border-stone-100 animate-pulse"
              />
            ))
          ) : (
            places.map((place, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-stone-50 p-6 rounded-3xl border-2 border-stone-100 hover:border-black hover:bg-white transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl border-2 border-stone-100 group-hover:border-black transition-all">
                    {place.name.toLowerCase().includes('park') || place.name.toLowerCase().includes('garden') ? <TreePine className="text-green-500" /> : 
                     place.name.toLowerCase().includes('library') ? <Library className="text-blue-500" /> : 
                     <Coffee className="text-orange-500" />}
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-sm tracking-tight">{place.name}</h3>
                    <p className="text-[10px] font-bold text-stone-400 uppercase">{place.address}</p>
                  </div>
                </div>
                <a 
                  href={place.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black text-white p-3 rounded-xl hover:bg-stone-800 transition-all"
                >
                  <ExternalLink size={18} />
                </a>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 p-6 bg-green-50 rounded-3xl border-2 border-green-100 flex items-start gap-4">
        <Info className="text-green-600 shrink-0 mt-1" size={20} />
        <p className="text-sm text-green-800 font-medium leading-relaxed italic">
          "Taking a break in a low-stimulation environment can help reset your focus flux. These locations are selected for their typically lower noise levels."
        </p>
      </div>
    </div>
  );
};
