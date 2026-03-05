'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { analyzePortfolio } from '../lib/gemini';
import { StockEntry } from '../types';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

interface AIChatProps {
    apiKey: string;
    portfolio: StockEntry[];
}

export function AIChat({ apiKey, portfolio }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: '안녕하세요! 포트폴리오를 분석해드릴까요? 투자 방향이나 특정 섹터에 대해 궁금한 점을 물어보세요.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !apiKey) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await analyzePortfolio(apiKey, portfolio, userMessage);
            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        } catch (error: any) {
            setMessages(prev => [
                ...prev,
                { role: 'ai', content: error.message || '오류가 발생했습니다. API Key와 네트워크 상태를 확인해주세요.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <Bot className="w-5 h-5 text-blue-500" />
                    AI 투자 상담
                </h3>
                {!apiKey && (
                    <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-medium">
                        API Key 필요
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700 text-slate-500 text-sm px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                            <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={!apiKey || isLoading}
                        placeholder={apiKey ? "포트폴리오에 대해 물어보세요..." : "먼저 API Key를 설정해주세요."}
                        className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || !apiKey || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
