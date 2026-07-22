import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';

const CopilotWidget = ({ simulationParams }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello. I am the Flood Intelligence Copilot. How can I assist you with the simulation today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Inject current simulation context silently into the payload
      const payloadMessages = [
        ...newMessages,
        { 
          role: 'system', 
          content: `CURRENT SIMULATION STATE: Rainfall: ${simulationParams.rainfallIntensity}mm/hr, Sea Level Surge: ${simulationParams.seaLevelRise}m, Policy Active (Clear Waterways): ${simulationParams.clearWaterways}` 
        }
      ];

      const res = await fetch('http://localhost:8003/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages })
      });

      const data = await res.json();
      if (data.choices && data.choices[0]) {
        setMessages([...newMessages, data.choices[0].message]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Error communicating with DeepSeek.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: 'Connection failed. Ensure the Python backend is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000,
          background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', border: 'none',
          width: '64px', height: '64px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 10px 25px rgba(59,130,246,0.6)',
          transition: 'transform 0.2s ease', color: 'white',
          pointerEvents: 'auto'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Bot size={32} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: isMinimized ? '2rem' : '2rem', right: '2rem', zIndex: 1000,
      width: '400px', height: isMinimized ? 'auto' : '650px',
      background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      overflow: 'hidden', transition: 'all 0.3s ease',
      pointerEvents: 'auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: '#3b82f6', padding: '0.4rem', borderRadius: '8px' }}>
            <Bot size={20} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'white', fontWeight: '600' }}>Flood Intelligence Copilot</h3>
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }} /> Online
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex', gap: '0.8rem', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: msg.role === 'user' ? '#475569' : '#0ea5e9',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {msg.role === 'user' ? <User size={16} color="white" /> : <Bot size={16} color="white" />}
              </div>
              <div style={{
                background: msg.role === 'user' ? '#1e293b' : 'rgba(14,165,233,0.1)',
                border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(14,165,233,0.2)',
                padding: '0.8rem 1rem', borderRadius: '12px', color: '#f1f5f9', fontSize: '0.9rem',
                lineHeight: '1.5', whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={16} color="white" />
              </div>
              <div style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Loader2 size={16} className="animate-spin" /> DeepSeek is analyzing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Box */}
      {!isMinimized && (
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask the AI agent..."
              style={{
                flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
                padding: '0.8rem 1rem', color: 'white', outline: 'none', fontSize: '0.9rem',
                pointerEvents: 'auto'
              }}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                background: '#3b82f6', border: 'none', width: '45px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                opacity: (isLoading || !input.trim()) ? 0.5 : 1,
                pointerEvents: 'auto'
              }}
            >
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopilotWidget;
