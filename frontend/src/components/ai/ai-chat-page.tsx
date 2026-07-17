import React, { useState } from 'react';
import { useAuth } from '@bmdinner/logreg';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faPaperPlane, 
  faSpinner,
  faUser,
  faTrash,
  faCopy,
  faCode,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'code' | 'explanation' | 'general';
}

export const AIChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I can help you generate code snippets, explain code, or improve existing code. What would you like to do?',
      type: 'general'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [mode, setMode] = useState<'generate' | 'explain' | 'improve'>('generate');

  const languages = [
    'javascript', 'python', 'typescript', 'go', 'rust', 'cpp', 'java', 'csharp', 'php', 'ruby', 'swift', 'kotlin'
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat cleared. How can I help you with code?',
        type: 'general'
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
      content: input,
      type: 'general'
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
      console.log('AI Chat Response:', data);
      
      if (data.success) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.data.response || 'I didn\'t understand that. Could you please rephrase?',
          type: 'general'
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
        content: `Error: ${error.message || 'Failed to process request. Please try again.'}`,
        type: 'general'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast.error(error.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faRobot} className="text-2xl text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">AI Assistant</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {mode === 'generate' ? 'Generate' : mode === 'explain' ? 'Explain' : 'Improve'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearChat}
            className="text-red-600 hover:text-red-700"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'generate' ? 'primary' : 'secondary'}
            onClick={() => setMode('generate')}
          >
            <FontAwesomeIcon icon={faCode} className="mr-1" />
            Generate
          </Button>
          <Button
            size="sm"
            variant={mode === 'explain' ? 'primary' : 'secondary'}
            onClick={() => setMode('explain')}
          >
            <FontAwesomeIcon icon={faLightbulb} className="mr-1" />
            Explain
          </Button>
          <Button
            size="sm"
            variant={mode === 'improve' ? 'primary' : 'secondary'}
            onClick={() => setMode('improve')}
          >
            Improve
          </Button>
        </div>

        {mode === 'generate' && (
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-gray-50 rounded-lg p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : message.type === 'code'
                  ? 'bg-gray-800 text-white font-mono text-sm relative group'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              {message.type === 'code' ? (
                <>
                  <pre className="whitespace-pre-wrap break-words">
                    <code>{message.content}</code>
                  </pre>
                  <button
                    onClick={() => handleCopy(message.content)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </>
              ) : (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-purple-600 mr-2" />
              <span className="text-gray-600">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === 'generate'
              ? 'Describe what you want to generate...'
              : mode === 'explain'
              ? 'Paste code to explain...'
              : 'Paste code to improve...'
          }
          className="flex-1"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </Button>
      </form>
    </div>
  );
};