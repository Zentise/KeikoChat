import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

// Voice conversation states
const VOICE_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'speaking'
}

function App() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [mode, setMode] = useState('chat')
  const [persona, setPersona] = useState('listener')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem('keikoVoiceEnabled')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [ttsSupported, setTtsSupported] = useState(true)
  const [voiceState, setVoiceState] = useState(VOICE_STATES.IDLE)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const utteranceRef = useRef(null)
  const isListeningRef = useRef(false)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update ref whenever state changes
  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSpeechSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
      setInputMessage(transcript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)

      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.')
        setIsListening(false)
        setVoiceState(VOICE_STATES.IDLE)
      } else if (event.error === 'no-speech') {
        setIsListening(false)
        setVoiceState(VOICE_STATES.IDLE)
      } else {
        setIsListening(false)
        setVoiceState(VOICE_STATES.IDLE)
      }
    }

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start()
        } catch (e) {
          console.error('Failed to restart recognition:', e)
          setIsListening(false)
          setVoiceState(VOICE_STATES.IDLE)
        }
      } else {
        setVoiceState(VOICE_STATES.IDLE)
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [])

  // Get voice state display info
  const getStateDisplay = () => {
    switch (voiceState) {
      case VOICE_STATES.IDLE:
        return { text: 'Ready to listen', color: 'rgba(125, 211, 252, 0.5)' }
      case VOICE_STATES.LISTENING:
        return { text: 'Listening...', color: '#7dd3fc' }
      case VOICE_STATES.THINKING:
        return { text: 'Thinking...', color: '#38bdf8' }
      case VOICE_STATES.SPEAKING:
        return { text: 'Keiko is speaking...', color: '#7dd3fc' }
      default:
        return { text: '', color: 'rgba(125, 211, 252, 0.5)' }
    }
  }

  const toggleListening = () => {
    if (!speechSupported) {
      setError('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    // If AI is speaking, interrupt and start listening
    if (voiceState === VOICE_STATES.SPEAKING) {
      window.speechSynthesis.cancel()
      setVoiceState(VOICE_STATES.LISTENING)
      setError(null)
      setInputMessage('')
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (e) {
        console.error('Failed to start recognition:', e)
        setError('Failed to start voice input. Please try again.')
        setVoiceState(VOICE_STATES.IDLE)
      }
      return
    }

    // Normal toggle for idle/listening states
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      setVoiceState(VOICE_STATES.IDLE)
    } else {
      if (voiceState !== VOICE_STATES.IDLE) return

      setError(null)
      setInputMessage('')
      try {
        recognitionRef.current?.start()
        setIsListening(true)
        setVoiceState(VOICE_STATES.LISTENING)
      } catch (e) {
        console.error('Failed to start recognition:', e)
        setError('Failed to start voice input. Please try again.')
      }
    }
  }

  // Initialize TTS and check support
  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false)
    }
  }, [])

  // Save voice preference to localStorage
  useEffect(() => {
    localStorage.setItem('keikoVoiceEnabled', JSON.stringify(voiceEnabled))
  }, [voiceEnabled])

  const toggleVoice = () => {
    if (!ttsSupported) {
      setError('Text-to-speech is not supported in this browser.')
      return
    }

    if (voiceEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    setVoiceEnabled(!voiceEnabled)
  }

  const speakText = (text) => {
    if (!voiceEnabled || !ttsSupported || !window.speechSynthesis) {
      setVoiceState(VOICE_STATES.IDLE)
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.lang = 'en-US'

    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v =>
      v.name.includes('Female') ||
      v.name.includes('Samantha') ||
      v.name.includes('Zira') ||
      v.lang === 'en-US'
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => {
      setVoiceState(VOICE_STATES.SPEAKING)
    }

    utterance.onend = () => {
      setVoiceState(VOICE_STATES.IDLE)
    }

    utterance.onerror = () => {
      setVoiceState(VOICE_STATES.IDLE)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  // Speak AI responses when they arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        setTimeout(() => {
          speakText(lastMessage.content)
        }, 100)
      }
    }
  }, [messages, voiceEnabled])

  // Keyboard controls for voice
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && voiceState === VOICE_STATES.IDLE) {
        e.preventDefault()
        toggleListening()
      }
      if (e.code === 'Escape') {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel()
        }
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
        setIsListening(false)
        setVoiceState(VOICE_STATES.IDLE)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [voiceState])

  const sendMessage = async (e) => {
    e.preventDefault()

    if (!inputMessage.trim() || isLoading) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setError(null)
    setVoiceState(VOICE_STATES.THINKING)

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage
    }])

    setIsLoading(true)

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          mode: mode,
          persona: persona,
          session_id: 'default'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }])

    } catch (err) {
      console.error('Error:', err)
      setError('Sorry, I couldn\'t connect. Please make sure the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        ease: 'easeOut'
      }
    }
  }

  const messageVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  }

  const micButtonVariants = {
    idle: {
      scale: 1,
    },
    listening: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <div className="app">
      <motion.div
        className="chat-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header
          className="chat-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1>🌙 KeikoChat</h1>
          <p className="subtitle">Your supportive AI companion</p>
          {ttsSupported && (
            <motion.button
              className="voice-toggle"
              onClick={toggleVoice}
              title={voiceEnabled ? "Disable voice" : "Enable voice"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </motion.button>
          )}
        </motion.header>

        {/* Controls */}
        <motion.div
          className="controls"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="control-group">
            <label htmlFor="mode">What do you need?</label>
            <select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={isLoading}
            >
              <option value="chat">💬 Chat — Just talk</option>
              <option value="vent">😮‍💨 Vent — Let it out</option>
              <option value="support">🤝 Support — Need encouragement</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="persona">How should I respond?</label>
            <select
              id="persona"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              disabled={isLoading}
            >
              <option value="listener">👂 Listener — Calm & reflective</option>
              <option value="friend">💙 Friend — Warm & casual</option>
              <option value="motivator">✨ Motivator — Encouraging & hopeful</option>
            </select>
          </div>
        </motion.div>

        {/* Voice State Indicator */}
        <AnimatePresence>
          {speechSupported && voiceEnabled && (
            <motion.div
              className={`voice-state-indicator ${voiceState}`}
              style={{ color: getStateDisplay().color }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              {getStateDisplay().text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="messages">
          {messages.length === 0 && (
            <motion.div
              className="welcome-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <p>👋 Hi! I'm Keiko.</p>
              <p>I'm here to listen, support, and chat with you.</p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'rgba(125, 211, 252, 0.5)' }}>
                Choose what you need above — whether you want to chat casually,
                vent your feelings, or get some support. Then pick how you'd like
                me to respond.
              </p>
              <p className="disclaimer">
                <small>
                  Note: I'm an AI companion, not a therapist.
                  For professional help, please reach out to a mental health professional.
                </small>
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                className={`message ${msg.role}`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="message-content">
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              className="message assistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="message-content loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.form
          className="input-container"
          onSubmit={sendMessage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            disabled={isLoading}
            maxLength={2000}
          />
          {speechSupported && (
            <motion.button
              type="button"
              className={`mic-button ${voiceState === VOICE_STATES.LISTENING ? 'listening' : ''} ${voiceState === VOICE_STATES.THINKING ? 'disabled' : ''}`}
              onClick={toggleListening}
              disabled={isLoading || voiceState === VOICE_STATES.THINKING}
              title={voiceState === VOICE_STATES.SPEAKING ? "Click to interrupt" : isListening ? "Stop recording" : "Start voice input"}
              variants={micButtonVariants}
              animate={isListening ? 'listening' : 'idle'}
              whileHover={!isListening && voiceState === VOICE_STATES.IDLE ? 'hover' : {}}
              whileTap={{ scale: 0.95 }}
            >
              {isListening ? '⏹️' : '🎤'}
            </motion.button>
          )}
          <motion.button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Send
          </motion.button>
        </motion.form>

        {/* Safety Disclaimer */}
        <div className="disclaimer">
          KeikoChat is an AI companion, not a human or professional service.
          Conversations are not saved permanently.
        </div>
      </motion.div>
    </div>
  )
}

export default App
