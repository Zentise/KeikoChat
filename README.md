# 🌸 KeikoChat — Your AI Friend for Calm Conversations

KeikoChat is a **text-based AI support chatbot** designed to feel like a friend you can talk to anytime.  
It's a safe space to **chat, vent, and feel heard** — without judgment, pressure, or accounts.

KeikoChat is **not a professional mental health service**.  
It's simply an AI companion that listens, supports, and gently helps you regain emotional balance.

---

## 🎯 Current Stage: Stage 1 - Text-Only MVP

This is the **minimal working version** of KeikoChat. Voice features will be added in future stages.

### ✨ Features

- 💬 **Text-based AI chat** with Gemini API
- 🧩 **Multiple conversation modes**
  - Chat (casual, friendly)
  - Vent (validating, listening)
  - Support (encouraging, uplifting)
- 🎭 **Persona-based responses**
  - Listener (quiet, validating)
  - Friend (warm, conversational)
  - Motivator (uplifting, hopeful)
- 🧠 **Session memory** (last 3 messages)
- 🌙 **Clean, dark minimal UI**
- 🔐 **Privacy-first** (no login, no storage)

---

## 🛠️ Tech Stack

**Backend**

- Python 3.8+
- FastAPI
- Gemini API (free tier)
- Pydantic
- Uvicorn

**Frontend**

- React 18
- Vite
- Plain CSS (dark theme)
- Fetch API

---

## 🚀 Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   - Windows:

     ```bash
     venv\Scripts\activate
     ```

   - Mac/Linux:

     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Add your Gemini API key to `.env`:

     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

6. **Run the backend**

   ```bash
   uvicorn main:app --reload
   ```

   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

### Usage

1. Make sure both backend and frontend are running
2. Open `http://localhost:5173` in your browser
3. Select a mode (Chat/Vent/Support) and persona (Listener/Friend/Motivator)
4. Start chatting with Keiko!

---

## 🔐 Privacy & Safety

- No accounts or logins required
- No permanent chat storage
- Session memory only (last 3 messages)
- KeikoChat does **not** provide medical or professional mental health advice

> If you're feeling unsafe or overwhelmed, please reach out to a trusted person or a qualified professional.

---

## 🌱 Roadmap

See [Stages.md](Stages.md) for the complete development roadmap.

**Upcoming Stages:**

- Stage 2: Enhanced emotional modes and personas
- Stage 3: Voice input (STT)
- Stage 4: Voice output (TTS)
- Stage 5: Real-time voice chat
- Stage 6: Safety, memory & polish

---

## 📄 License

MIT License

---

> Built with care, calm, and curiosity 🌙  
> KeikoChat — sometimes, all you need is someone to listen.
