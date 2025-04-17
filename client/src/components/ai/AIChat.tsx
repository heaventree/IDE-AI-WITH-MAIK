/** @jsxImportSource theme-ui */
import React, { useState, useRef, useEffect } from 'react';
import { Zap, Send, Bot, User, Loader2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { AIMessage } from '@/types';

interface AIChatProps {
  initialOpen?: boolean;
}

const AIChat: React.FC<AIChatProps> = ({ initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [query, setQuery] = useState('');
  const { messages, isProcessing, sendQuery, clearMessages } = useAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the messages container when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isProcessing) {
      sendQuery(query);
      setQuery('');
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div sx={{ position: 'fixed', bottom: 3, right: 3, zIndex: 1000 }}>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'primary',
          color: 'white',
          border: 'none',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          position: isOpen ? 'absolute' : 'relative',
          bottom: isOpen ? 0 : 'auto',
          right: isOpen ? 0 : 'auto',
          zIndex: 1001,
          transition: 'all 0.3s ease'
        }}
      >
        <Zap size={24} />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          sx={{
            position: 'absolute',
            bottom: '60px',
            right: 0,
            width: ['100vw', '350px'],
            maxWidth: ['calc(100vw - 20px)', '350px'],
            height: '500px',
            backgroundColor: 'background',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'border'
          }}
        >
          {/* Chat Header */}
          <div
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: 3,
              backgroundColor: 'primary',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            <Zap size={18} sx={{ marginRight: 2 }} />
            <span>AI Assistant</span>
            <button
              onClick={clearMessages}
              sx={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: 1,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Clear Chat
            </button>
          </div>

          {/* Messages Container */}
          <div
            sx={{
              flex: 1,
              overflowY: 'auto',
              padding: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            {messages.length === 0 ? (
              <div
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  color: 'text',
                  opacity: 0.7
                }}
              >
                <Bot size={40} sx={{ marginBottom: 3, opacity: 0.5 }} />
                <p>How can I help you today?</p>
                <div sx={{ marginTop: 3 }}>
                  <p sx={{ fontWeight: 'bold', marginBottom: 2 }}>Try asking:</p>
                  <ul sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li sx={{ marginBottom: 2 }}>How do I implement a WebContainer?</li>
                    <li sx={{ marginBottom: 2 }}>Debug this useEffect code</li>
                    <li sx={{ marginBottom: 2 }}>Is my website WCAG compliant?</li>
                  </ul>
                </div>
              </div>
            ) : (
              messages.map((message: AIMessage) => (
                <div
                  key={message.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: 3
                  }}
                >
                  <div
                    sx={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: message.role === 'user' ? 'gray' : 'primary',
                      color: 'white',
                      marginRight: 2,
                      flexShrink: 0
                    }}
                  >
                    {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div
                    sx={{
                      flex: 1,
                      backgroundColor: message.role === 'user' ? 'muted' : 'highlight',
                      padding: 3,
                      borderRadius: '8px',
                      fontSize: 1,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {isProcessing && (
              <div
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 3
                }}
              >
                <div
                  sx={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'primary',
                    color: 'white',
                    marginRight: 2
                  }}
                >
                  <Bot size={16} />
                </div>
                <div
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'highlight',
                    padding: 3,
                    borderRadius: '8px',
                    fontSize: 1
                  }}
                >
                  <Loader2 size={16} sx={{ marginRight: 2, animation: 'spin 1s linear infinite' }} />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              padding: 3,
              borderTop: '1px solid',
              borderColor: 'border'
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your message..."
              disabled={isProcessing}
              sx={{
                flex: 1,
                padding: 2,
                borderRadius: '4px',
                border: '1px solid',
                borderColor: 'border',
                backgroundColor: 'background',
                color: 'text',
                '&:focus': {
                  outline: 'none',
                  borderColor: 'primary'
                }
              }}
            />
            <button
              type="submit"
              disabled={!query.trim() || isProcessing}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'primary',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0 16px',
                marginLeft: 2,
                cursor: query.trim() && !isProcessing ? 'pointer' : 'not-allowed',
                opacity: query.trim() && !isProcessing ? 1 : 0.6
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChat;