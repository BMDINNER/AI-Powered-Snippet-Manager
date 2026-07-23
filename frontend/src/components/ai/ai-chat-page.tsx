import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@bmdinner/logreg';
import { ChatMarkdownRenderer } from '../ui/ChatMarkdownRenderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faPaperPlane, 
  faSpinner,
  faUser,
  faTrash,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. I can help you with code generation, explanations, and improvements. What would you like help with?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat cleared. How can I help you with code?'
      }
    ]);
    toast.success('Chat cleared');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ]
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.data.response || 'I didn\'t understand that. Could you please rephrase?'
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || 'Failed to get AI response');
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to process request. Please try again.'}`
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast.error(error.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 80px)',
      width: '100%',
      maxWidth: '100%',
      padding: '0 16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FontAwesomeIcon icon={faRobot} style={{ fontSize: '24px', color: '#7c3aed' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>AI Assistant</h1>
        </div>
        <button
          onClick={handleClearChat}
          style={{
            padding: '6px 16px',
            fontSize: '14px',
            color: '#dc2626',
            background: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <FontAwesomeIcon icon={faTrash} style={{ marginRight: '4px' }} />
          Clear Chat
        </button>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#9ca3af'
          }}>
            <FontAwesomeIcon icon={faRobot} style={{ fontSize: '48px', marginBottom: '16px' }} />
            <p style={{ fontSize: '18px' }}>Start a conversation with the AI assistant</p>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    maxWidth: message.role === 'user' ? '80%' : '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: message.role === 'user' ? '#7c3aed' : '#ffffff',
                    color: message.role === 'user' ? '#ffffff' : '#1f2937',
                    border: message.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
                    width: message.role === 'assistant' ? '100%' : 'auto'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FontAwesomeIcon
                      icon={message.role === 'user' ? faUser : faRobot}
                      style={{ color: message.role === 'user' ? '#c4b5fd' : '#7c3aed' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                  </div>
                  
                  {message.role === 'user' ? (
                    <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                      {message.content}
                    </p>
                  ) : (
                    <ChatMarkdownRenderer content={message.content} />
                  )}
                  
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(message.content)}
                      style={{
                        marginTop: '8px',
                        fontSize: '14px',
                        color: '#9ca3af',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 0'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#4b5563'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                    >
                      <FontAwesomeIcon icon={faCopy} style={{ marginRight: '4px' }} />
                      Copy
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" style={{ color: '#7c3aed', marginRight: '8px' }} />
                  <span style={{ color: '#6b7280' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '8px',
          width: '100%',
          flexShrink: 0
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '12px',
            fontSize: '16px',
            outline: 'none',
            minHeight: '50px',
            width: '100%'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7c3aed'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (!loading && input.trim()) {
              e.currentTarget.style.backgroundColor = '#6d28d9';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#7c3aed';
          }}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </div>
  );
};