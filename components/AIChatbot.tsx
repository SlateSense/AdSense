"use client"
import { useState, useRef, useEffect } from "react"

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hi! I'm your Spectra Star AI assistant. How can I help you today?" }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const newMessages = [...messages, { role: "user", content: input } as const]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      })

      if (!res.ok) throw new Error("Failed to get response")

      const data = await res.json()
      setMessages([...newMessages, { role: "assistant", content: data.message.content }])
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again later." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="ai-chatbot-root">
      {/* Floating Toggle Button */}
      <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle AI Chat">
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <strong>Spectra AI Assistant</strong>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>
                {m.content}
              </div>
            ))}
            {isLoading && <div className="chat-bubble assistant loading">...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything..."
            />
            <button onClick={handleSend} disabled={isLoading}>
              Send
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-chatbot-root { position: fixed; bottom: 20px; right: 20px; z-index: 1000; }
        .chat-toggle-btn { width: 56px; height: 56px; border-radius: 50%; background: var(--brand); color: #0a0c10; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.2s; }
        .chat-toggle-btn:hover { transform: scale(1.05); }
        .chat-window { position: absolute; bottom: 70px; right: 0; width: 320px; height: 450px; background: var(--card); border: 1px solid #1c2133; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .chat-header { padding: 12px; background: #171b29; border-bottom: 1px solid #1c2133; font-size: 14px; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .chat-bubble { padding: 8px 12px; border-radius: 12px; font-size: 13px; line-height: 1.4; max-width: 85%; }
        .chat-bubble.user { align-self: flex-end; background: var(--brand); color: #0a0c10; }
        .chat-bubble.assistant { align-self: flex-start; background: #1c2133; color: var(--text); }
        .chat-bubble.loading { opacity: 0.5; font-style: italic; }
        .chat-input-area { padding: 10px; border-top: 1px solid #1c2133; display: flex; gap: 8px; }
        .chat-input-area input { flex: 1; background: #0a0c10; border: 1px solid #1c2133; border-radius: 6px; padding: 6px 10px; color: var(--text); font-size: 13px; }
        .chat-input-area button { background: var(--brand); color: #0a0c10; border: none; border-radius: 6px; padding: 0 12px; font-weight: 600; cursor: pointer; font-size: 12px; }
        .chat-input-area button:disabled { opacity: 0.5; }
      `}</style>
    </div>
  )
}
