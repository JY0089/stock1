'use client';

import { useState, useEffect } from 'react';
import { ApiKeySettings } from '@/components/ApiKeySettings';
import { StockForm } from '@/components/StockForm';
import { PortfolioTable } from '@/components/PortfolioTable';
import { AIChat } from '@/components/AIChat';
import { StockEntry } from '@/types';
import { getEntries, addEntry, deleteEntry } from '@/lib/storage';
import { Wallet, LineChart, Sparkles } from 'lucide-react';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai'>('dashboard');

  useEffect(() => {
    setIsClient(true);
    setEntries(getEntries());
  }, []);

  const handleAddEntry = (entry: Omit<StockEntry, 'id' | 'totalAmount'>) => {
    const newEntry = addEntry(entry);
    setEntries(getEntries());
  };

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
    setEntries(getEntries());
  };

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Portfolio Insights</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">스마트한 자산 관리와 AI 투자 상담</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <LineChart className="w-4 h-4" />
            대시보드
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'ai'
                ? 'bg-white dark:bg-slate-800 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Sparkles className="w-4 h-4" />
            AI 어시스턴트
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <StockForm onAdd={handleAddEntry} />
            <PortfolioTable entries={entries} onDelete={handleDeleteEntry} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
              <ApiKeySettings onKeyChange={setApiKey} currentKey={apiKey} />
              <div className="bg-fuchsia-50 dark:bg-fuchsia-900/10 p-5 rounded-xl border border-fuchsia-100 dark:border-fuchsia-900/30">
                <h4 className="font-semibold text-fuchsia-800 dark:text-fuchsia-300 flex items-center gap-2 mb-2 text-sm">
                  <Sparkles className="w-4 h-4" />
                  AI 활용 가이드
                </h4>
                <ul className="text-sm text-fuchsia-700/80 dark:text-fuchsia-400/80 space-y-2 list-disc list-inside">
                  <li>현재 포트폴리오의 섹터 비율을 평가해달라고 해보세요.</li>
                  <li>특정 종목의 최근 시장 상황과 전망을 물어보세요.</li>
                  <li>리밸런싱이 필요한지 조언을 구해보세요.</li>
                </ul>
              </div>
            </div>
            <div className="lg:col-span-3">
              <AIChat apiKey={apiKey} portfolio={entries} />
            </div>
          </div>
        )}
      </div>

    </main>
  );
}
