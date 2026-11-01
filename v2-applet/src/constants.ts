import { Game } from "./types";

export const GAMES: Game[] = [
  {
    id: "sorting",
    title: "Focus Flux",
    description: "The classic infinite sorting challenge. Adapt to changing rules in real-time.",
    intensity: "high",
    category: "sorting",
    icon: "Brain",
    focus: "ADHD / Inhibition",
    howToPlay: [
      "Sort shapes into the correct zones based on the current rule.",
      "The rule (Color or Shape) changes periodically.",
      "Watch for the background color shift to signal a rule change.",
      "Maintain speed and accuracy to maximize your score."
    ]
  },
  {
    id: "pattern",
    title: "Pattern Pulse",
    description: "Match sequences of light and sound. Designed for sensory comfort.",
    intensity: "low",
    category: "memory",
    icon: "Zap",
    focus: "Working Memory",
    howToPlay: [
      "A sequence of lights will flash on the grid.",
      "Wait for the sequence to finish.",
      "Repeat the sequence by clicking the buttons in the same order.",
      "The sequence gets longer with each successful round."
    ]
  },
  {
    id: "rhythm",
    title: "The Rhythm Keeper",
    description: "Categorize falling notes by quantity. Measures subitizing speed.",
    intensity: "medium",
    category: "cognitive",
    icon: "Music",
    focus: "Dyscalculia",
    howToPlay: [
      "Notes will fall from the top of the screen.",
      "Each note contains a number of dots.",
      "Quickly identify the quantity and tap the corresponding number button.",
      "Don't let the notes reach the bottom!"
    ]
  },
  {
    id: "pathfinder",
    title: "Pathfinder Pro",
    description: "Connect dots in alternating sequences (1-A-2-B). Measures switching cost.",
    intensity: "high",
    category: "cognitive",
    icon: "Navigation",
    focus: "Executive Function",
    howToPlay: [
      "Connect the dots in an alternating sequence: 1, A, 2, B, 3, C...",
      "Tap the correct dot to move to the next step.",
      "Try to complete the sequence as fast as possible.",
      "Errors will reset your current progress."
    ]
  },
  {
    id: "social",
    title: "The Social Mirror",
    description: "Identify social cues and sarcasm in everyday scenarios. Focus on social cue recognition.",
    intensity: "medium",
    category: "social",
    icon: "Users",
    focus: "Autism (ASD)",
    howToPlay: [
      "Read the social scenario presented on the screen.",
      "Identify the social cue, such as sarcasm, tone, or emotion.",
      "Select the correct interpretation from the options provided.",
      "Learn to recognize subtle social cues in a safe, predictable environment."
    ]
  },
  {
    id: "word",
    title: "Word Wander",
    description: "Identify words in a shifting landscape. Focus on phonological awareness.",
    intensity: "medium",
    category: "language",
    icon: "Type",
    focus: "Dyslexia",
    howToPlay: [
      "A target word is displayed at the top.",
      "Find and tap the exact same word from the options below.",
      "Watch out for scrambled or reversed versions of the word.",
      "Respond as quickly as possible to track your processing speed."
    ]
  },
  {
    id: "cascade",
    title: "Calm Cascade",
    description: "A sensory-friendly experience to regulate emotional state.",
    intensity: "low",
    category: "reaction",
    icon: "Wind",
    focus: "Emotional Regulation",
    isExercise: true,
    howToPlay: [
      "Follow the visual guide to regulate your breathing.",
      "Inhale when the circle expands.",
      "Hold when the circle is at its peak.",
      "Exhale when the circle contracts.",
      "Focus on the rhythm to calm your nervous system."
    ]
  },
  {
    id: "reaction",
    title: "Steady Stream",
    description: "Tap the targets while maintaining a steady hand. Tracks tremors.",
    intensity: "medium",
    category: "reaction",
    icon: "Activity",
    focus: "ADHD / Motor Control",
    howToPlay: [
      "Targets will appear randomly on the screen.",
      "Tap each target as quickly as you can.",
      "Try to keep your movements smooth and precise.",
      "The AI tracks your motor jitter and reaction time."
    ]
  },
  {
    id: "echo",
    title: "Echo Link",
    description: "Hear a pseudo-word and pick its visual phonemes. Measures phonological awareness.",
    intensity: "medium",
    category: "language",
    icon: "Volume2",
    focus: "Dyslexia / Auditory Processing",
    howToPlay: [
      "Listen to the spoken 'pseudo-word'.",
      "Look at the floating phoneme clusters.",
      "Select the visual representation that matches what you heard.",
      "This helps bridge sounds to symbols without relying on vocabulary."
    ]
  },
  {
    id: "pressure",
    title: "Pressure Point",
    description: "Trace the moving line precisely. Measures motor jitter and impulsivity.",
    intensity: "high",
    category: "motor",
    icon: "PenTool",
    focus: "Dysgraphia / ADHD",
    howToPlay: [
      "A line will move across the screen.",
      "Trace the line as accurately as possible with your finger or cursor.",
      "Stay within the path to maintain your score.",
      "The game measures your touch pressure and movement jitter."
    ]
  },
  {
    id: "space",
    title: "Space Match",
    description: "Rotate 3D shapes to fit shifting cutouts. Measures mental rotation speed.",
    intensity: "medium",
    category: "memory",
    icon: "Box",
    focus: "Dyspraxia / Spatial Awareness",
    howToPlay: [
      "Look at the 'Target Orientation' on the left.",
      "Use the Pitch, Yaw, and Roll buttons to rotate your shape on the right.",
      "Match your shape's orientation to the target.",
      "Click 'Match Orientation' when you think they are aligned."
    ]
  },
  {
    id: "grounding",
    title: "Grounding Grid",
    description: "A 5-4-3-2-1 sensory grounding exercise to anchor yourself in the present.",
    intensity: "low",
    category: "reaction",
    icon: "Anchor",
    focus: "Anxiety / Grounding",
    isExercise: true,
    howToPlay: [
      "Identify 5 things you can see.",
      "Identify 4 things you can touch.",
      "Identify 3 things you can hear.",
      "Identify 2 things you can smell.",
      "Identify 1 thing you can taste.",
      "Tap the screen to progress through each stage."
    ]
  },
  {
    id: "muscle",
    title: "Muscle Melt",
    description: "Progressive muscle relaxation to release physical tension and stress.",
    intensity: "low",
    category: "reaction",
    icon: "Cloud",
    focus: "Stress Relief / Physical Regulation",
    isExercise: true,
    howToPlay: [
      "Follow the prompts to tense specific muscle groups.",
      "Hold the tension for 5 seconds.",
      "Release and feel the 'melt' as the tension leaves your body.",
      "Focus on the sensation of relaxation in each area."
    ]
  },
  {
    id: "emojimemory",
    title: "Emoji Memory",
    description: "Remember the emojis and answer questions.",
    intensity: "medium",
    category: "memory",
    icon: "Brain",
    focus: "Working Memory",
    howToPlay: [
      "Memorize the emojis in the grid.",
      "The grid will disappear.",
      "Answer the question about the emoji locations.",
      "You have 3 rounds."
    ]
  },
  {
    id: "reactionspeed",
    title: "Reaction Speed",
    description: "Tap the target as fast as you can. Measures reaction time.",
    intensity: "high",
    category: "reaction",
    icon: "Zap",
    focus: "ADHD / Inhibition",
    howToPlay: [
      "Wait for the target to appear.",
      "Tap it immediately.",
      "Try to improve your reaction time with each tap.",
      "Avoid tapping early."
    ]
  },
  {
    id: "bodyscan",
    title: "Body Scan",
    description: "Progressive body scan to release tension.",
    intensity: "low",
    category: "reaction",
    icon: "User",
    focus: "Stress Relief",
    isExercise: true,
    howToPlay: [
      "Focus on your feet.",
      "Slowly move your attention up to your head.",
      "Release any tension you find.",
      "Breathe deeply."
    ]
  },
  {
    id: "visualization",
    title: "Visualization",
    description: "Guided visualization for calm.",
    intensity: "low",
    category: "cognitive",
    icon: "Image",
    focus: "Stress Relief",
    isExercise: true,
    howToPlay: [
      "Close your eyes.",
      "Imagine a peaceful place.",
      "Focus on the details of the scene.",
      "Stay in this state for a few minutes."
    ]
  },
  {
    id: "stroop",
    title: "Stroop Effect",
    description: "Tap the color of the ink, not the word. Measures inhibition.",
    intensity: "high",
    category: "cognitive",
    icon: "Eye",
    focus: "ADHD / Inhibition",
    howToPlay: [
      "A word will appear in a color.",
      "Tap the name of the color the word is written in.",
      "Ignore what the word says.",
      "You have 5 seconds per word."
    ]
  },
  {
    id: "gonogo",
    title: "Go / No-Go",
    description: "Tap for circles, wait for squares. Measures inhibition.",
    intensity: "high",
    category: "cognitive",
    icon: "Activity",
    focus: "ADHD / Inhibition",
    howToPlay: [
      "A shape will appear.",
      "Tap 'TAP' if it's a circle.",
      "Tap 'WAIT' if it's a square.",
      "You have 5 seconds per shape."
    ]
  },
  {
    id: "flanker",
    title: "Flanker Task",
    description: "Tap the direction of the center arrow. Measures focus.",
    intensity: "high",
    category: "cognitive",
    icon: "Zap",
    focus: "ADHD / Focus",
    howToPlay: [
      "A row of arrows will appear.",
      "Tap the direction of the center arrow.",
      "Ignore the flanking arrows.",
      "You have 5 seconds per round."
    ]
  }
];
