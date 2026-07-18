import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../hooks/useAI';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faUser, 
  faPaperPlane,
  faTrash 
} from '@fortawesome/free-solid-svg-icons';
import type { AIMessage } from '../../types';

interface AIChatProps {
  onInsertCode?: (code: string) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ onInsertCode }) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I can help you generate, optimize, or explain code. What would you like me to do?' 
    }
  ]);
  const [input, setInput] = useState('');
  const { chat, loading } = useAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: AIMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await chat([...messages, userMessage]);
      const assistantMessage: AIMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: 'Hello! I can help you generate, optimize, or explain code. What would you like me to do?' 
      }
    ]);
  };

  const handleInsertCode = (code: string) => {
    if (onInsertCode) {
      onInsertCode(code);
    }
  };

  const extractCodeFromMessage = (content: string): string | null => {
    const codeMatch = content.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (!codeMatch || !codeMatch[1]) {
      return null;
    }
    return codeMatch[1].trim();
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faRobot} className="h-4 w-4 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-gray-500 hover:text-red-600">
          <FontAwesomeIcon icon={faTrash} className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => {
          const code = extractCodeFromMessage(msg.content);
          const displayContent = code ? msg.content.replace(/```[\s\S]*?```/, '').trim() : msg.content;

          return (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <FontAwesomeIcon
                    icon={msg.role === 'user' ? faUser : faRobot}
                    className={msg.role === 'user' ? 'text-red-200' : 'text-red-600'}
                  />
                  <span className="text-sm font-medium">
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                </div>
                
                {displayContent && (
                  <div className="whitespace-pre-wrap text-sm">{displayContent}</div>
                )}
                
                {code && (
                  <div className="mt-3">
                    <pre className="p-3 rounded-lg text-xs overflow-x-auto border border-gray-200">
                      <code className="hljs">{code}</code>
                    </pre>
                    {onInsertCode && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleInsertCode(code)}
                      >
                        Insert Code
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t pt-4">
        <div className="flex space-x-2">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to generate code, explain something, or optimize your snippets..."
            rows={3}
            disabled={loading}
            className="focus:ring-red-500 focus:border-red-500"
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="self-end bg-red-600 hover:bg-red-700"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};