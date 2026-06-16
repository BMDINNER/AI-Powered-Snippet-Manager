import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAI } from '../../hooks/useAI';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faPaperPlane, 
  faArrowLeft,
  faSpinner,
  faUser,
  faTrash,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { chat } = useAI();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Hello! I am your AI assistant. I can help you with code-related questions, explain concepts, and assist with your snippets. What can I help you with today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const chatMessages = messages
        .concat(userMessage)
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const response = await chat(chatMessages);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || 'Failed to get response from AI');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'system',
        content: 'Chat cleared. How can I help you?',
        timestamp: new Date()
      }
    ]);
    toast.success('Chat cleared');
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-black to-gray-800 text-white">
        <Container className="py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/snippets')}
              className="flex items-center text-white hover:text-gray-300 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
              <span>Back to Snippets</span>
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={clearChat}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                Clear Chat
              </button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-6">
        <Card className="bg-white shadow-xl p-6 h-[calc(100vh-220px)] flex flex-col">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faRobot} className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-500">Powered by CodeLlama 7B</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const isSystem = message.role === 'system';
              
              if (isSystem && message.id === '1') {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm max-w-2xl text-center">
                      {message.content}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-gray-200' : 'bg-black'}`}>
                    <FontAwesomeIcon 
                      icon={isUser ? faUser : faRobot} 
                      className={`h-4 w-4 ${isUser ? 'text-gray-600' : 'text-white'}`}
                    />
                  </div>
                  <div className={`max-w-3xl ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-lg px-4 py-3 ${
                      isUser 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {formatTime(message.timestamp)}
                      </span>
                      {!isUser && (
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isSending && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faRobot} className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about code, snippets, or programming..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm min-h-[52px] max-h-[150px]"
                rows={2}
                disabled={isSending}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className={`h-[52px] w-[52px] flex items-center justify-center ${
                  isSending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ padding: '0' }}
              >
                {isSending ? (
                  <FontAwesomeIcon icon={faSpinner} className="h-5 w-5 animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faPaperPlane} className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </span>
              <span className="text-xs text-gray-400">
                {messages.filter(m => m.role === 'user').length} messages
              </span>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};