# Focus Flux - Local Setup Guide
**https://drive.google.com/file/d/13bG1BSo14PvujiGe1e02_KZDfCr6v7ca/view?usp=sharing**
# Video
## Its on my drive
https://drive.google.com/file/d/1ZfRzgakVMZzKpksN5vZsb9RbUvh8uZ7s/view?usp=sharing



This guide will help you run **Focus Flux** on your local machine using VS Code.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **VS Code**

## Getting Started

### 1. Export the Code
You can export this project from AI Studio Build:
- Open the **Settings** menu (gear icon) in the AI Studio Build UI.
- Select **Export to GitHub** or **Download ZIP**.

### 2. Open in VS Code
- If you downloaded a ZIP, extract it and open the folder in VS Code.
- If you exported to GitHub, clone the repository and open it in VS Code.

### 3. Install Dependencies
Open the VS Code terminal (`Ctrl + ` `) and run:
```bash
npm install
```

### 4. Configure Environment Variables
- Create a new file named `.env` in the root directory.
- Copy the contents from `.env.example` into `.env`.
- Add your **Gemini API Key**:
  - You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
  - Set `GEMINI_API_KEY=your_api_key_here` in the `.env` file.

### 5. Run the Development Server
This project is a full-stack application using Express and Vite. To start it, run:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Project Structure

- `src/`: Frontend source code (React + Tailwind CSS).
- `server.ts`: Backend Express server.
- `firebase.ts`: Firebase configuration and initialization.
- `firestore.rules`: Security rules for your Firestore database.

## Firebase Setup (Optional)
If you want to use your own Firebase project locally:
1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore** and **Google Authentication**.
3. Update `firebase-applet-config.json` with your project's credentials.
