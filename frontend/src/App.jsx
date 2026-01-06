import React, { useState, useRef, useEffect } from 'react'
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
  const isListeningRef = useRef(false) // Ref to track listening state inside event handlers

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
        // Just stay listening/idle? usually best to stop and let user try again if silent
        // But for continuous mode maybe we ignore?
        // Let's reset to be safe so user sees they need to click again
        setIsListening(false)
        setVoiceState(VOICE_STATES.IDLE)
      } else {
        // Other errors
        setIsListening(false)
        setVoiceState(VOICE_STATES.IDLE)
      }
    }

    recognition.onend = () => {
      // Use ref to check if we intended to keep listening
      if (isListeningRef.current) {
        try {
          recognition.start()
        } catch (e) {
          console.error('Failed to restart recognition:', e)
          setIsListening(false)
          setVoiceState(VOICE_STATES.IDLE)
        }
      } else {
        // Intentionally stopped
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
        return { text: 'Ready to listen', color: 'var(--text-secondary)' }
      case VOICE_STATES.LISTENING:
        return { text: 'Listening...', color: 'var(--accent)' }
      case VOICE_STATES.THINKING:
        return { text: 'Thinking...', color: 'var(--accent)' }
      case VOICE_STATES.SPEAKING:
        return { text: 'Keiko is speaking...', color: 'var(--accent)' }
      default:
        return { text: '', color: 'var(--text-secondary)' }
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
      if (voiceState !== VOICE_STATES.IDLE) return // Prevent starting in wrong state

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

    // Stop any ongoing speech when toggling off
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

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9  // Slightly slower for calm delivery
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.lang = 'en-US'

    // Try to select a natural female voice
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

    // Voice state callbacks
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
        // Small delay to ensure message is rendered
        setTimeout(() => {
          speakText(lastMessage.content)
        }, 100)
      }
    }
  }, [messages, voiceEnabled])

  // Keyboard controls for voice
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Space to toggle mic (only when not typing in input)
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && voiceState === VOICE_STATES.IDLE) {
        e.preventDefault()
        toggleListening()
      }
      // Escape to stop everything
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

    // Stop recording AND speaking when message is sent
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
    setVoiceState(VOICE_STATES.THINKING) // Set thinking state while waiting for AI

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage
    }])

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/chat', {
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

      // Add AI response to chat
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

  return (
    <div className="app">
      <div className="chat-container">
        {/* Header */}
        <header className="chat-header">
          <h1>🌙 KeikoChat</h1>
          <p className="subtitle">Your supportive AI companion</p>
          {ttsSupported && (
            <button
              className="voice-toggle"
              onClick={toggleVoice}
              title={voiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </button>
          )}
        </header>

        {/* Controls */}
        <div className="controls">
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
        </div>

        {/* Voice State Indicator */}
        {speechSupported && voiceEnabled && (
          <div
            className={`voice-state-indicator ${voiceState}`}
            style={{ color: getStateDisplay().color }}
          >
            {getStateDisplay().text}
          </div>
        )}

        {/* Messages */}
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>👋 Hi! I'm Keiko.</p>
              <p>I'm here to listen, support, and chat with you.</p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
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
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role}`}
            >
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message assistant">
              <div className="message-content loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="input-container" onSubmit={sendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            disabled={isLoading}
            maxLength={2000}
          />
          {speechSupported && (
            <button
              type="button"
              className={`mic-button ${voiceState === VOICE_STATES.LISTENING ? 'listening' : ''} ${voiceState === VOICE_STATES.THINKING ? 'disabled' : ''}`}
              onClick={toggleListening}
              disabled={isLoading || voiceState === VOICE_STATES.THINKING}
              title={voiceState === VOICE_STATES.SPEAKING ? "Click to interrupt" : isListening ? "Stop recording" : "Start voice input"}
            >
              {isListening ? '⏹️' : '🎤'}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
          >
            Send
          </button>
        </form>

        {/* Safety Disclaimer */}
        <div className="disclaimer">
          KeikoChat is an AI companion, not a human or professional service.
          Conversations are not saved permanently.
        </div>
      </div>
    </div>
  )
}

export default App
