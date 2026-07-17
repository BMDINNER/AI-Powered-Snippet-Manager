import React, { useState } from 'react';
import { useAuth } from '@bmdinner/logreg';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
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
    <div className="flex flex-col h-[calc(100vh-80px)] w-full">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faRobot} className="text-2xl text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">AI Assistant</h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClearChat}
          className="text-red-600 hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTrash} className="mr-1" />
          Clear Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-gray-50 rounded-lg p-6 w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FontAwesomeIcon icon={faRobot} className="text-6xl mb-4" />
            <p className="text-lg">Start a conversation with the AI assistant</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
            >
              <div
                className={`rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white max-w-[80%]'
                    : 'bg-white border border-gray-200 text-gray-800 w-full'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon
                    icon={message.role === 'user' ? faUser : faRobot}
                    className={message.role === 'user' ? 'text-purple-200' : 'text-purple-600'}
                  />
                  <span className="text-sm font-medium">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                </div>
                
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                ) : (
                  <MarkdownRenderer content={message.content} className="w-full" />
                )}
                
                {message.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(message.content)}
                    className="mt-2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                  >
                    <FontAwesomeIcon icon={faCopy} className="mr-1" />
                    Copy
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start w-full">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-purple-600 mr-2" />
              <span className="text-gray-600">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 w-full px-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 w-full"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 px-6"
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </Button>
      </form>
    </div>
  );
};