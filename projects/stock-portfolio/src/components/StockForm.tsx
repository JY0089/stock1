'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { StockEntry } from '../types';

interface StockFormProps {
    onAdd: (entry: Omit<StockEntry, 'id' | 'totalAmount'>) => void;
}

export function StockForm({ onAdd }: StockFormProps) {
    const [name, setName] = useState('');
    const [sector, setSector] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [pricePerShare, setPricePerShare] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');

    const SECTORS = ['IT/기술', '금융', '헬스케어', '소비재', '산업재', '에너지', '기타'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!name || !sector || !purchaseDate || !pricePerShare || !quantity) {
            setError('모든 칸을 입력해주세요.');
            return;
        }

        const price = Number(pricePerShare);
        const qty = Number(quantity);

        if (isNaN(price) || price <= 0) {
            setError('단가는 0보다 큰 숫자여야 합니다.');
            return;
        }

        if (isNaN(qty) || qty <= 0) {
            setError('수량은 0보다 큰 숫자여야 합니다.');
            return;
        }

        onAdd({
            name,
            sector,
            purchaseDate,
            pricePerShare: price,
            quantity: qty,
        });

        // Reset form
        setName('');
        setSector('');
        setPurchaseDate('');
        setPricePerShare('');
        setQuantity('');
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-100">
                <Plus className="w-5 h-5" />
                새 주식 추가
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                    <X className="w-4 h-4 cursor-pointer" onClick={() => setError('')} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">종목명</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="애플 (AAPL)"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">섹터</label>
                    <select
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="" disabled className="dark:bg-slate-800">선택하세요</option>
                        {SECTORS.map(s => (
                            <option key={s} value={s} className="dark:bg-slate-800">{s}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">매수일</label>
                    <input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm [color-scheme:light] dark:[color-scheme:dark]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">매수 단가 ($/₩)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pricePerShare}
                        onChange={(e) => setPricePerShare(e.target.value)}
                        placeholder="150"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">수량 (주)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="10"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors flex-shrink-0"
                        >
                            추가
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
