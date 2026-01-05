import React, { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [mode, setMode] = useState('chat')
  const [persona, setPersona] = useState('listener')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()

    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setError(null)

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
        </header>

        {/* Controls */}
        <div className="controls">
          <div className="control-group">
            <label htmlFor="mode">Mode</label>
            <select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={isLoading}
            >
              <option value="chat">Chat</option>
              <option value="vent">Vent</option>
              <option value="support">Support</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="persona">Persona</label>
            <select
              id="persona"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              disabled={isLoading}
            >
              <option value="listener">Listener</option>
              <option value="friend">Friend</option>
              <option value="motivator">Motivator</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>👋 Hi! I'm Keiko.</p>
              <p>I'm here to listen, support, and chat with you.</p>
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
            placeholder="Type your message..."
            disabled={isLoading}
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
