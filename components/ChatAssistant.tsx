import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { analyzeSystem } from '../services/geminiService';
import { Camera, Recorder } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatAssistantProps {
  cameras: Camera[];
  recorders: Recorder[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ cameras, recorders }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý ảo của hệ thống Camera. Bạn có thể hỏi tôi về tình trạng, vị trí, hoặc thông tin kỹ thuật của các camera.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await analyzeSystem(input, cameras, recorders);

    const aiMsg: Message = { role: 'assistant', content: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-140px)]">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
        <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
        <h2 className="font-semibold text-gray-800">Trợ Lý AI Thông Minh</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600 ml-2' : 'bg-green-600 mr-2'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-3 rounded-lg shadow-sm text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>
                 <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex flex-row">
              <div className="w-8 h-8 rounded-full bg-green-600 mr-2 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-white p-3 rounded-lg rounded-tl-none border border-gray-200 text-gray-500 text-sm italic">
                Đang phân tích dữ liệu...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về hệ thống camera của bạn..."
            className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 bg-primary text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 text-xs text-center text-gray-400">
          AI có thể trả lời sai. Hãy kiểm tra lại thông tin quan trọng.
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
