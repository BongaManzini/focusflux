# FocusFlux – Mental Wellness & ADHD Support App

FocusFlux is a full-stack web application designed to support individuals with ADHD and mental health challenges through engaging cognitive exercises, grounding techniques, AI-powered chat support, real-time community features, and a clinical portal for professionals.

---

## Features

### Cognitive Training Arcade
A library of gamified exercises targeting executive function and focus:

| Component | Purpose |
|---|---|
| **SortingGame** | Executive function & categorisation training |
| **PatternMatch** | Visual memory & pattern recognition |
| **RhythmKeeper** | Auditory processing & timing |
| **PathfinderPro** | Spatial navigation & planning |
| **SocialMirror** | Social cue recognition & emotional awareness |
| **WordWander** | Language processing & verbal fluency |
| **SpaceMatch** | Working memory & spatial reasoning |
| **SteadyStream** | Sustained attention training |

### Calm & Grounding Exercises
Therapeutic tools for regulation and de-escalation:

- **CalmCascade** – Guided visual breathing and calming flows
- **GroundingGrid** – Sensory grounding exercises (5-4-3-2-1 technique)
- **MuscleMelt** – Progressive muscle relaxation
- **PressurePoint** – Pressure-based self-regulation techniques
- **EchoLink** – Sound-based mindfulness
- **QuietSpaceFinder** – Sensory environment finder for calm spaces

### AI-Powered Support
- **FocusFlowChat** – A floating Gemini AI chatbot providing on-demand focus strategies, coping tips, and ADHD guidance
- **Personalised recommendations** based on onboarding assessment results

### Dashboard & Progress Tracking
- **Dashboard** – Visual progress metrics and session history via Recharts
- **CognitiveReport** – AI-generated summaries of cognitive performance trends
- **OnboardingTest** – Initial ADHD/focus assessment to tailor the experience

### Clinical Portal
- **ClinicalPortal** – Dedicated interface for clinicians and therapists to view patient data
- **ReportSender** – Secure report generation and sharing

### Real-Time Community
- **ChillChat** – Socket.io-powered global community chat room for peer support

### Internationalisation
- Multi-language support via a built-in `i18n` translation system

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6 |
| **Styling** | Tailwind CSS 4, `tailwind-merge`, `clsx` |
| **Animation** | Motion (Framer Motion) |
| **AI** | Google Gemini AI (`@google/genai`) |
| **Backend** | Express.js (TypeScript via `tsx`) |
| **Realtime** | Socket.io (client + server) |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication (Google OAuth) |
| **Charts** | Recharts |
| **Icons** | Lucide React |

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** (bundled with Node.js)
- A [Google AI Studio](https://aistudio.google.com/app/apikey) account (for the Gemini API key)
- A [Firebase](https://console.firebase.google.com/) project (optional, for auth & database)

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/focusflux.git
cd focusflux
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and set the following values:

```env
# Required – get yours from https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your_gemini_api_key_here"

# The URL where this app is hosted (e.g. http://localhost:3000 for local dev)
APP_URL="http://localhost:3000"
```

### 4. (Optional) Configure Firebase

If you want to use your own Firebase project:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com/).
2. Enable **Firestore** and **Google Authentication**.
3. Update `firebase-applet-config.json` with your project's web app credentials.
4. Deploy the Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## Running the App

FocusFlux uses a combined Express + Vite dev server.

```bash
npm run dev
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**.

### Other Scripts

| Command | Description |
|---|---|
| `npm run build` | Build the production frontend bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type-checking (`tsc --noEmit`) |
| `npm run clean` | Remove the `dist/` build output |

---

## Project Structure

```
focusflux/
├── src/
│  ├── components/    # All UI components (games, exercises, portals)
│  ├── lib/       # Utility functions (cn, etc.)
│  ├── i18n/       # Translation strings
│  ├── types.ts     # Shared TypeScript types
│  ├── constants.ts   # Game definitions and config
│  ├── firebase.ts    # Firebase initialisation
│  └── App.tsx      # Root application component & routing
├── server.ts       # Express + Socket.io backend server
├── firebase-applet-config.json # Firebase project config
├── firestore.rules    # Firestore security rules
├── vite.config.ts    # Vite build configuration
├── tsconfig.json     # TypeScript configuration
├── .env.example     # Environment variable template
└── index.html      # HTML entry point
```

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 FocusFlux Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
