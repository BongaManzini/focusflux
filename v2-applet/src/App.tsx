import React, { useState, useEffect, useMemo } from "react";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { SortingGame } from "./components/SortingGame";
import { PatternMatch } from "./components/PatternMatch";
import { RhythmKeeper } from "./components/RhythmKeeper";
import { PathfinderPro } from "./components/PathfinderPro";
import { SocialMirror } from "./components/SocialMirror";
import { WordWander } from "./components/WordWander";
import { CalmCascade } from "./components/CalmCascade";
import { GroundingGrid } from "./components/GroundingGrid";
import { MuscleMelt } from "./components/MuscleMelt";
import { SteadyStream } from "./components/SteadyStream";
import { EchoLink } from "./components/EchoLink";
import { PressurePoint } from "./components/PressurePoint";
import { SpaceMatch } from "./components/SpaceMatch";
import { EmojiMemory } from "./components/EmojiMemory";
import { ReactionSpeed } from "./components/ReactionSpeed";
import { BodyScan } from "./components/BodyScan";
import { Visualization } from "./components/Visualization";
import { StroopEffect } from "./components/StroopEffect";
import { GoNoGo } from "./components/GoNoGo";
import { FlankerTask } from "./components/FlankerTask";
import { Dashboard } from "./components/Dashboard";
import { QuietSpaceFinder } from "./components/QuietSpaceFinder";
import { OnboardingTest } from "./components/OnboardingTest";
import { ChillChat } from "./components/ChillChat";
import { FocusFlowChat } from "./components/FocusFlowChat";
import { TutorialModal } from "./components/TutorialModal";
import { CognitiveReport } from "./components/CognitiveReport";
import { ClinicalPortal } from "./components/ClinicalPortal";
import { GameState, Game } from "./types";
import { GAMES } from "./constants";
import { motion, AnimatePresence } from "motion/react";
import { Brain as BrainIcon, Trophy, Users as UsersIcon, LayoutDashboard, LogIn, LogOut, Search, Filter, Zap as ZapIcon, Activity, Music as MusicIcon, Navigation as NavigationIcon, Type as TypeIcon, Wind as WindIcon, Info, Volume2 as VolumeIcon, PenTool as PenToolIcon, Box as BoxIcon, X, Globe, Anchor as AnchorIcon, Cloud as CloudIcon, Bot, FileText, Eye as EyeIcon, Image as ImageIcon } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Brain: BrainIcon,
  Zap: ZapIcon,
  Activity: Activity,
  Music: MusicIcon,
  Navigation: NavigationIcon,
  Users: UsersIcon,
  Type: TypeIcon,
  Wind: WindIcon,
  Volume2: VolumeIcon,
  PenTool: PenToolIcon,
  Box: BoxIcon,
  Anchor: AnchorIcon,
  Cloud: CloudIcon,
  Eye: EyeIcon,
  Image: ImageIcon,
};
import { cn } from "./lib/utils";
import { auth, db, googleProvider, OperationType, handleFirestoreError } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { translations } from "./i18n";
import { Language } from "./types";

interface GameCardProps {
  game: Game;
  onClick: () => void;
  recommendedFocus: string | null;
  t: any;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick, recommendedFocus, t }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative group">
      <motion.div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex flex-col justify-between h-full relative overflow-hidden"
      >
        {game.focus === recommendedFocus && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-black px-4 py-1 rounded-bl-2xl font-black text-[8px] uppercase border-l-2 border-b-2 border-black z-10">
            {t.recommended_for.split(" ")[0]}
          </div>
        )}
        
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-yellow-400 p-3 rounded-2xl border-2 border-black">
              {game.icon === "Brain" && <BrainIcon size={24} />}
              {game.icon === "Zap" && <ZapIcon size={24} />}
              {game.icon === "Activity" && <Activity size={24} />}
              {game.icon === "Music" && <MusicIcon size={24} />}
              {game.icon === "Navigation" && <NavigationIcon size={24} />}
              {game.icon === "Users" && <UsersIcon size={24} />}
              {game.icon === "Type" && <TypeIcon size={24} />}
              {game.icon === "Wind" && <WindIcon size={24} />}
              {game.icon === "Volume2" && <VolumeIcon size={24} />}
              {game.icon === "PenTool" && <PenToolIcon size={24} />}
              {game.icon === "Box" && <BoxIcon size={24} />}
              {game.icon === "Anchor" && <AnchorIcon size={24} />}
              {game.icon === "Cloud" && <CloudIcon size={24} />}
              {game.icon === "Eye" && <EyeIcon size={24} />}
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 border-black",
              game.intensity === "high" ? "bg-red-400" : game.intensity === "medium" ? "bg-orange-400" : "bg-green-400"
            )}>
              {game.intensity}
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-1 md:mb-2">{game.title}</h3>
          <p className="text-xs md:text-sm text-stone-500 font-medium mb-4 md:mb-6 line-clamp-2">{game.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">{game.focus}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(!showTooltip);
              }}
              className="p-1 hover:bg-stone-100 rounded-full transition-colors md:hidden"
            >
              <Info size={16} className={cn(showTooltip ? "text-black" : "text-stone-300")} />
            </button>
            <Info size={14} className="text-stone-300 group-hover:text-black transition-colors hidden md:block" />
          </div>
          <div className="bg-black text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase">{t.start_game.split(" ")[0]}</div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 bottom-full left-0 right-0 mb-4 p-6 bg-black text-white rounded-[32px] border-4 border-white shadow-2xl pointer-events-none md:pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-yellow-400 p-1.5 rounded-lg border border-black">
                  <Info size={12} className="text-black" />
                </div>
                <div className="text-[10px] font-black uppercase text-yellow-400 tracking-widest">{game.focus}</div>
              </div>
              <button onClick={() => setShowTooltip(false)} className="md:hidden text-white/50 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <h4 className="text-lg font-black uppercase tracking-tight mb-2">{game.title}</h4>
            <p className="text-xs font-medium leading-relaxed text-stone-300">{game.description}</p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-black border-r-4 border-b-4 border-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<"menu" | "library" | "game" | "report" | "dashboard" | "escape" | "portal">("menu");
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [recommendedFocus, setRecommendedFocus] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});
  const [recentGames, setRecentGames] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"recommended" | "frequent">("recommended");
  
  const t = translations[language];

  const handleGameSelect = (game: Game) => {
    setIsGameLoading(true);
    setActiveGame(game);
    setShowInstructions(true);
    setTimeout(() => setIsGameLoading(false), 500);
  };

  // Sorting and Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [intensityFilter, setIntensityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredGames = useMemo(() => {
    let games = GAMES.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIntensity = intensityFilter === "all" || game.intensity === intensityFilter;
      const matchesCategory = categoryFilter === "all" || game.category === categoryFilter;
      return matchesSearch && matchesIntensity && matchesCategory;
    });

    if (sortBy === "frequent") {
      games = [...games].sort((a, b) => ((playCounts?.[b.id]) || 0) - ((playCounts?.[a.id]) || 0));
    } else if (recommendedFocus) {
      games = [...games].sort((a, b) => {
        if (a.focus === recommendedFocus && b.focus !== recommendedFocus) return -1;
        if (a.focus !== recommendedFocus && b.focus === recommendedFocus) return 1;
        return 0;
      });
    }

    return games;
  }, [searchQuery, intensityFilter, categoryFilter, recommendedFocus, sortBy, playCounts]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsGuest(false);
        // Ensure user document exists in Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || "Anonymous",
              photoURL: firebaseUser.photoURL || "",
              email: firebaseUser.email || "",
              createdAt: serverTimestamp(),
              role: "user",
              recommendedFocus: null
            });
          } else {
            const data = userDoc.data();
            if (data.recommendedFocus) {
              setRecommendedFocus(data.recommendedFocus);
            }
            if (data.playCounts) {
              setPlayCounts(data.playCounts);
            }
            if (data.recentGames) {
              setRecentGames(data.recentGames);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, "users/" + firebaseUser.uid);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleGuestMode = () => {
    setIsGuest(true);
    setUser({
      uid: "guest-" + Math.random().toString(36).substring(7),
      displayName: "Guest Explorer",
      photoURL: "https://picsum.photos/seed/guest/200",
      email: "guest@focusflux.app",
    } as any);
    setView("menu");
  };

  const handleLogout = async () => {
    try {
      if (!isGuest) {
        await signOut(auth);
      }
      setUser(null);
      setIsGuest(false);
      setView("menu");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGameEnd = async (state: GameState) => {
    setGameState(state);
    setView("report");

    if (user && activeGame && !isGuest) {
      const userRef = doc(db, "users", user.uid);
      const newPlayCounts = { ...playCounts, [activeGame.id]: (playCounts[activeGame.id] || 0) + 1 };
      setPlayCounts(newPlayCounts);
      try {
        await setDoc(userRef, { playCounts: newPlayCounts }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "users/" + user.uid);
      }
    }
  };

  const handleRandomGame = () => {
    // 20% chance to suggest a "Sensory Escape" instead of a game
    if (Math.random() < 0.2) {
      setView("escape");
    } else {
      const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
      setActiveGame(randomGame);
      setShowInstructions(true);
    }
  };

  const handleOnboardingComplete = async (focus: string) => {
    setRecommendedFocus(focus);
    setShowOnboarding(false);
    setView("library");

    if (user && !isGuest) {
      const userRef = doc(db, "users", user.uid);
      try {
        await setDoc(userRef, { recommendedFocus: focus }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "users/" + user.uid);
      }
    }
  };

  const getTutorialSteps = (gameId: string) => {
    if (gameId === 'pattern') {
      return [
        { title: "Watch the lights", description: "A sequence of lights will flash on the grid. Pay close attention!" },
        { title: "Wait for your turn", description: "Once the lights stop, it's your turn to repeat the pattern." },
        { title: "Tap the buttons", description: "Tap the buttons in the exact same order as they flashed." },
        { title: "Level up", description: "The sequence gets longer with each successful round. Good luck!" }
      ];
    }
    if (gameId === 'pathfinder') {
      return [
        { title: "Alternating sequence", description: "Connect the dots in an alternating sequence: 1, A, 2, B, 3, C..." },
        { title: "Tap the dots", description: "Tap the correct dot to move to the next step." },
        { title: "Speed is key", description: "Try to complete the sequence as fast as possible." },
        { title: "Watch for errors", description: "Errors will reset your current progress, so be careful!" }
      ];
    }
    if (gameId === 'rhythm') {
      return [
        { title: "Watch the notes", description: "Notes will fall from the top of the screen." },
        { title: "Identify the quantity", description: "Each note contains a number of dots or a digit. Quickly identify the quantity!" },
        { title: "Tap to clear", description: "Tap the note to clear it before it reaches the bottom." },
        { title: "Keep the rhythm", description: "Don't let the notes reach the bottom! Good luck!" }
      ];
    }
    return [];
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 rounded-xl">
            <BrainIcon size={24} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Focus Flux</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 font-bold uppercase text-xs tracking-widest">
          <button 
            onClick={() => setView("dashboard")}
            className={cn("hover:text-yellow-500 flex items-center gap-2", view === "dashboard" && "text-yellow-500")}
          >
            <LayoutDashboard size={16} /> {t.dashboard}
          </button>
          <button 
            onClick={() => setView("library")}
            className={cn("hover:text-yellow-500 flex items-center gap-2", view === "library" && "text-yellow-500")}
          >
            <Trophy size={16} /> {t.arcade}
          </button>
          <button className="hover:text-yellow-500 flex items-center gap-2">
            <UsersIcon size={16} /> {t.challenges}
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200">
            <Globe size={14} className="text-stone-500" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent border-none outline-none font-bold text-[10px] uppercase cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="zu">ZU</option>
              <option value="xh">XH</option>
              <option value="af">AF</option>
              <option value="st">ST</option>
            </select>
          </div>

          {user ? (
            <>
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Logged in as</div>
                <div className="font-black text-sm">{user.displayName}</div>
              </div>
              <img 
                src={user.photoURL || ""} 
                alt={user.displayName || ""} 
                className="w-10 h-10 rounded-full border-2 border-black"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition-all"
            >
              <LogIn size={18} /> Login
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-12 flex flex-col lg:flex-row gap-8 items-start justify-center pb-24 md:pb-12">
        {!user ? (
          <div className="w-full max-w-2xl text-center py-20">
            <h2 className="text-4xl font-black uppercase mb-6">{t.welcome}</h2>
            <p className="text-xl text-gray-600 mb-8">{t.login_prompt}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleLogin}
                className="bg-yellow-400 text-black px-12 py-4 rounded-3xl font-black uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                {t.get_started}
              </button>
              <button 
                onClick={handleGuestMode}
                className="bg-white text-black px-12 py-4 rounded-3xl font-black uppercase tracking-widest border-4 border-black hover:bg-stone-50 transition-all"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === "menu" && (
              <motion.div 
                key="menu"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-2xl flex flex-col gap-8"
              >
                <div className="bg-white p-12 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none">
                    {t.train_your} <br /> <span className="text-yellow-500">{t.inhibition}</span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-8 font-medium">
                    {t.tagline}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setView("library")}
                      className="bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95"
                    >
                      {t.enter_arcade}
                    </button>
                    <button 
                      onClick={() => setShowOnboarding(true)}
                      className="bg-white text-black py-6 rounded-3xl font-black uppercase tracking-widest border-4 border-black hover:bg-stone-50 transition-all active:scale-95"
                    >
                      {t.start_discovery}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {recentGames.length > 0 ? (
                    recentGames.map((gameId, idx) => {
                      const game = GAMES.find(g => g.id === gameId);
                      if (!game) return null;
                      return (
                        <button
                          key={gameId}
                          onClick={() => {
                            setActiveGame(game);
                            setShowInstructions(true);
                          }}
                          className="bg-white h-32 rounded-3xl border-4 border-black flex flex-col items-center justify-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group"
                        >
                          <div className="p-2 bg-stone-100 rounded-xl group-hover:bg-yellow-400 transition-colors">
                            {React.createElement(ICON_MAP[game.icon] || BrainIcon, { size: 24 })}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-center px-2 line-clamp-1">
                            {game.title}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <>
                      <div className="bg-stone-200 h-32 rounded-3xl border-2 border-stone-300 flex items-center justify-center font-black text-stone-400">01</div>
                      <div className="bg-stone-200 h-32 rounded-3xl border-2 border-stone-300 flex items-center justify-center font-black text-stone-400">02</div>
                      <div className="bg-stone-200 h-32 rounded-3xl border-2 border-stone-300 flex items-center justify-center font-black text-stone-400">03</div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {view === "library" && (
              <motion.div 
                key="library"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full max-w-4xl"
              >
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <div className="flex flex-col">
                    <h2 className="text-4xl font-black uppercase tracking-tighter">{t.game_library}</h2>
                    {recommendedFocus && (
                      <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mt-1">
                        {t.recommended_for}: {recommendedFocus}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                      onClick={handleRandomGame}
                      className="bg-yellow-400 text-black px-6 py-2 rounded-full font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      {t.random}
                    </button>
                    <div className="flex items-center gap-2 bg-white border-2 border-black rounded-full px-4 py-2 flex-1">
                      <Search size={18} className="text-stone-400" />
                      <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.search_placeholder}
                        className="bg-transparent border-none outline-none font-bold text-sm w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 bg-stone-200 px-4 py-2 rounded-full">
                    <Filter size={14} className="text-stone-500" />
                    <select 
                      value={intensityFilter}
                      onChange={(e) => setIntensityFilter(e.target.value)}
                      className="bg-transparent border-none outline-none font-bold text-xs uppercase"
                    >
                      <option value="all">{t.all_intensity}</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-200 px-4 py-2 rounded-full">
                    <Filter size={14} className="text-stone-500" />
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-transparent border-none outline-none font-bold text-xs uppercase"
                    >
                      <option value="all">{t.all_categories}</option>
                      <option value="sorting">Sorting</option>
                      <option value="memory">Memory</option>
                      <option value="reaction">Reaction</option>
                      <option value="cognitive">Cognitive</option>
                      <option value="social">Social</option>
                      <option value="language">Language</option>
                      <option value="motor">Motor</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-200 px-4 py-2 rounded-full">
                    <Filter size={14} className="text-stone-500" />
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "recommended" | "frequent")}
                      className="bg-transparent border-none outline-none font-bold text-xs uppercase"
                    >
                      <option value="recommended">{t.recommended_for.split(" ")[0]}</option>
                      <option value="frequent">{t.frequently_used}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-12">
                  {/* Games Section */}
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                      <ZapIcon size={24} className="text-yellow-500" />
                      {t.cognitive_games}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredGames.filter(g => !g.isExercise).map(game => (
                        <GameCard 
                          key={game.id}
                          game={game}
                          recommendedFocus={recommendedFocus}
                          t={t}
                          onClick={() => handleGameSelect(game)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Exercises Section */}
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                      <WindIcon size={24} className="text-blue-500" />
                      {t.wellness_exercises}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredGames.filter(g => g.isExercise).map(game => (
                        <GameCard 
                          key={game.id}
                          game={game}
                          recommendedFocus={recommendedFocus}
                          t={t}
                          onClick={() => handleGameSelect(game)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === "game" && (
              <motion.div 
                key="game"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                {isGameLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    {activeGame?.id === "sorting" && <SortingGame onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "pattern" && <PatternMatch onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "rhythm" && <RhythmKeeper onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "pathfinder" && <PathfinderPro onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "social" && <SocialMirror onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "word" && <WordWander onGameEnd={handleGameEnd} language={language} />}
                    {activeGame?.id === "cascade" && <CalmCascade onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "grounding" && <GroundingGrid onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "muscle" && <MuscleMelt onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "reaction" && <SteadyStream onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "echo" && <EchoLink onGameEnd={handleGameEnd} language={language} />}
                    {activeGame?.id === "pressure" && <PressurePoint onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "space" && <SpaceMatch onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "emojimemory" && <EmojiMemory onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "reactionspeed" && <ReactionSpeed onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "bodyscan" && <BodyScan onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "visualization" && <Visualization onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "stroop" && <StroopEffect onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "gonogo" && <GoNoGo onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "flanker" && <FlankerTask onGameEnd={handleGameEnd} />}
                    {activeGame?.id === "reaction_old" && (
                      <div className="bg-white p-12 rounded-[40px] border-4 border-black text-center">
                        <h2 className="text-3xl font-black mb-4">COMING SOON</h2>
                        <button onClick={() => setView("library")} className="bg-black text-white px-8 py-2 rounded-full font-bold">BACK TO LIBRARY</button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {view === "report" && gameState && (
              <motion.div 
                key="report"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <CognitiveReport 
                  state={gameState} 
                  gameId={activeGame?.id}
                  onRestart={() => setView("menu")} 
                  onOpenPortal={() => setView("portal")}
                />
              </motion.div>
            )}

            {view === "dashboard" && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <Dashboard onOpenPortal={() => setView("portal")} language={language} />
              </motion.div>
            )}

            {view === "portal" && (
              <motion.div 
                key="portal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <ClinicalPortal onBack={() => setView("dashboard")} language={language} />
              </motion.div>
            )}

            {view === "escape" && (
              <motion.div 
                key="escape"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <QuietSpaceFinder />
                <div className="flex justify-center mt-8">
                  <button 
                    onClick={() => setView("library")}
                    className="bg-black text-white px-8 py-3 rounded-2xl font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Back to Arcade
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {showOnboarding && (
          <OnboardingTest 
            onComplete={handleOnboardingComplete} 
            onSkip={() => setShowOnboarding(false)} 
          />
        )}

        {showInstructions && activeGame && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-xl rounded-[40px] border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-400 p-4 rounded-2xl border-2 border-black">
                      {activeGame.icon === "Brain" && <BrainIcon size={32} />}
                      {activeGame.icon === "Zap" && <ZapIcon size={32} />}
                      {activeGame.icon === "Activity" && <Activity size={32} />}
                      {activeGame.icon === "Music" && <MusicIcon size={32} />}
                      {activeGame.icon === "Navigation" && <NavigationIcon size={32} />}
                      {activeGame.icon === "Users" && <UsersIcon size={32} />}
                      {activeGame.icon === "Type" && <TypeIcon size={32} />}
                      {activeGame.icon === "Wind" && <WindIcon size={32} />}
                      {activeGame.icon === "Volume2" && <VolumeIcon size={32} />}
                      {activeGame.icon === "PenTool" && <PenToolIcon size={32} />}
                      {activeGame.icon === "Box" && <BoxIcon size={32} />}
                      {activeGame.icon === "Eye" && <EyeIcon size={32} />}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{activeGame.title}</h2>
                      <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest mt-1">{activeGame.focus}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowInstructions(false)}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6 mb-12">
                  <h3 className="text-lg font-black uppercase tracking-tight border-b-2 border-stone-100 pb-2">{t.how_to_play}</h3>
                  <ul className="space-y-4">
                    {activeGame.howToPlay.map((step, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <div className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-stone-600 font-medium leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                { (activeGame.id === 'pattern' || activeGame.id === 'pathfinder' || activeGame.id === 'rhythm') && !playCounts[activeGame.id] && (
                  <button
                    onClick={() => {
                      setShowInstructions(false);
                      setShowTutorial(true);
                    }}
                    className="w-full bg-blue-500 text-white py-4 rounded-3xl font-black uppercase tracking-widest border-4 border-black mb-4 hover:bg-blue-600 transition-all"
                  >
                    Start Tutorial
                  </button>
                )}
                <button 
                  onClick={() => {
                    setShowInstructions(false);
                    setView("game");
                  }}
                  className="w-full bg-yellow-400 text-black py-6 rounded-3xl font-black uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
                >
                  {activeGame.isExercise ? t.start_exercise : t.start_game} {activeGame.title}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showTutorial && activeGame && (
          <TutorialModal
            title={activeGame.title}
            steps={getTutorialSteps(activeGame.id)}
            onComplete={() => {
              setShowTutorial(false);
              setView("game");
            }}
            onClose={() => setShowTutorial(false)}
          />
        )}

        {/* Sidebar / Chat */}
        {user && (
          <aside className="w-full lg:w-96 flex flex-col gap-6">
            <ChillChat user={user.displayName || "Anonymous"} room="global" />
            
            <div className="bg-white p-6 rounded-3xl border-2 border-stone-200">
              <h3 className="font-bold uppercase text-xs text-stone-400 mb-4 tracking-widest">{t.daily_tip}</h3>
              <p className="text-sm font-medium text-stone-600 italic">
                "Try adjusting your screen brightness to reduce sensory load during high-intensity rule changes."
              </p>
            </div>
          </aside>
        )}
      </main>

      {/* Floating Chat Trigger */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 bg-yellow-400 p-5 rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 flex items-center gap-3 group"
      >
        <div className="bg-black p-2 rounded-2xl">
          <Bot className="text-white" size={24} />
        </div>
        <span className="font-black uppercase tracking-tighter hidden group-hover:block transition-all">Focus Flow</span>
      </motion.button>

      <AnimatePresence>
        {showChat && <FocusFlowChat onClose={() => setShowChat(false)} />}
      </AnimatePresence>

      <footer className="p-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 border-t border-stone-200" dangerouslySetInnerHTML={{ __html: t.copyright }} />
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black p-4 flex justify-around items-center md:hidden z-50">
        <button 
          onClick={() => setView("dashboard")}
          className={cn("flex flex-col items-center gap-1", view === "dashboard" ? "text-yellow-500" : "text-stone-400")}
        >
          <LayoutDashboard size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{t.stats}</span>
        </button>
        <button 
          onClick={() => setView("library")}
          className={cn("flex flex-col items-center gap-1", view === "library" ? "text-yellow-500" : "text-stone-400")}
        >
          <Trophy size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{t.arcade}</span>
        </button>
        <button 
          onClick={handleRandomGame}
          className="bg-black text-white p-3 rounded-full -mt-10 border-4 border-white shadow-lg"
        >
          <ZapIcon size={24} />
        </button>
        <button 
          onClick={() => setView("portal")}
          className={cn("flex flex-col items-center gap-1", view === "portal" ? "text-yellow-500" : "text-stone-400")}
        >
          <FileText size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{t.portal}</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-stone-400"
        >
          <UsersIcon size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{t.social}</span>
        </button>
        <button 
          onClick={() => setView("escape")}
          className={cn("flex flex-col items-center gap-1", view === "escape" ? "text-yellow-500" : "text-stone-400")}
        >
          <WindIcon size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{t.escape}</span>
        </button>
      </nav>
    </div>
  );
}
