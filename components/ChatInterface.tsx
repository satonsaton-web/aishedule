import React, { useState, useRef, useEffect } from 'react';
import { processRosterRequest, AgentResponse } from '../services/geminiService';
import { ChatMessage, Employee, ShiftType, ScheduleData } from '../types';
import { Send, Loader2, Bot, User as UserIcon, X } from 'lucide-react';

interface ChatInterfaceProps {
  employees: Employee[];
  shiftTypes: ShiftType[];
  schedule: ScheduleData;
  onUpdateSchedule: (updates: NonNullable<AgentResponse['updates']>) => void;
  year: number;
  month: number;
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  employees,
  shiftTypes,
  schedule,
  onUpdateSchedule,
  year,
  month,
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'こんにちは！勤務表アシスタントです。「毎週金曜日は佐藤さんをカミングにする」のように指示してください。', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await processRosterRequest(
        userMsg.text,
        employees,
        shiftTypes,
        schedule,
        year,
        month
      );

      if (response.type === 'UPDATE' && response.updates) {
        onUpdateSchedule(response.updates);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: `✅ ${response.message}`,
          timestamp: Date.now()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response.message,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: '申し訳ありません。エラーが発生しました。',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50 transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-indigo-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h2 className="font-bold">AI アシスタント</h2>
        </div>
        <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-lg text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-indigo-600" size={16} />
              <span className="text-xs text-gray-500">考え中...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="ここに指示を入力..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          例: 「赤木さんを毎週金曜朝Nにして」「今月の休みの数を数えて」
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
