# KeikoChat

> A laptop-focused, smooth, fluid AI chat + live voice interface.

Built by **[ShrijithSM](https://github.com/ShrijithSM)**.

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Overview

KeikoChat is a production-quality AI voice chat UI designed to feel **calm**, **minimal**, and **buttery smooth**. It mimics the fluidity of modern voice interfaces like Gemini Live and ChatGPT Voice, focusing on a clean laptop-centric experience.

### Key Features

- **State-Driven UI**: Strictly follows `IDLE` → `LISTENING` → `THINKING` → `RESPONDING` states for a predictable flow.
- **Real-Time Visualization**: Custom Canvas-based audio waveform that reacts dynamically to microphone input.
- **Fluid Motion**: Powered by **Framer Motion** for subtle, non-distracting animations.
- **Voice First**: Built with the **Web Audio API** and `MediaRecorder` for seamless voice interaction.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Lucide React
- **Backend Ref**: FastAPI
- **Audio**: Web Audio API, Canvas API

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+) for backend

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Zentise/KeikoChat.git
   cd KeikoChat
   ```

2. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`.

3. **Backend Setup** (If applicable)
   Navigate to the backend directory and follow standard Python/FastAPI setup (e.g., `uvicorn main:app --reload`).

## 📂 Project Structure

```
/frontend
 ├─ src/
 │   ├─ components/
 │   │   ├─ ChatArea.jsx       // Message list & layout
 │   │   ├─ Message.jsx        // Bubble component with motion
 │   │   ├─ VoiceControl.jsx   // Interactive Mic button
 │   │   ├─ Waveform.jsx       // Canvas audio visualizer
 │   ├─ hooks/
 │   │   ├─ useChat.js         // Chat logic & state machine
 │   │   ├─ useVoiceRecorder.js // Audio capture & analysis
 │   ├─ services/              // API integration
 │   └─ App.jsx                // Main Application
```

## 🔗 Repository

[https://github.com/Zentise/KeikoChat](https://github.com/Zentise/KeikoChat)

---
*Created with ❤️ by ShrijithSM*
