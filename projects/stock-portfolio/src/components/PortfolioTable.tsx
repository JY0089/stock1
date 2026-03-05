'use client';

import { useState } from 'react';
import { Trash2, TrendingUp, Filter } from 'lucide-react';
import { StockEntry, PortfolioSummary } from '../types';

interface PortfolioTableProps {
    entries: StockEntry[];
    onDelete: (id: string) => void;
}

export function PortfolioTable({ entries, onDelete }: PortfolioTableProps) {
    const [filterSector, setFilterSector] = useState<string>('all');

    // Calculate Summary
    const totalInvestment = entries.reduce((sum, entry) => sum + entry.totalAmount, 0);

    const entriesWithWeight = entries.map(entry => ({
        ...entry,
        weight: totalInvestment > 0 ? (entry.totalAmount / totalInvestment) * 100 : 0
    }));

    const filteredEntries = filterSector === 'all'
        ? entriesWithWeight
        : entriesWithWeight.filter(e => e.sector === filterSector);

    const sectors = Array.from(new Set(entries.map(e => e.sector)));

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2 }).format(amount);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        포트폴리오 현황
                    </h3>
                    <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
                        {formatCurrency(totalInvestment)} <span className="text-lg font-normal text-slate-500">Total</span>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={filterSector}
                        onChange={(e) => setFilterSector(e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="all" className="dark:bg-slate-800">모든 섹터</option>
                        {sectors.map(s => (
                            <option key={s} value={s} className="dark:bg-slate-800">{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">종목명</th>
                            <th className="px-6 py-4 font-medium">섹터</th>
                            <th className="px-6 py-4 font-medium">매수일</th>
                            <th className="px-6 py-4 font-medium text-right">단가</th>
                            <th className="px-6 py-4 font-medium text-right">수량</th>
                            <th className="px-6 py-4 font-medium text-right">총 금액</th>
                            <th className="px-6 py-4 font-medium text-right">비중(%)</th>
                            <th className="px-6 py-4 font-medium text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                        {filteredEntries.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                    {entries.length === 0 ? '추가된 주식이 없습니다.' : '선택한 섹터에 해당하는 주식이 없습니다.'}
                                </td>
                            </tr>
                        ) : (
                            filteredEntries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        {entry.name}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs">
                                            {entry.sector}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{entry.purchaseDate}</td>
                                    <td className="px-6 py-3 text-right">{formatCurrency(entry.pricePerShare)}</td>
                                    <td className="px-6 py-3 text-right">{formatCurrency(entry.quantity)}</td>
                                    <td className="px-6 py-3 text-right font-medium">{formatCurrency(entry.totalAmount)}</td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="w-12">{entry.weight.toFixed(1)}%</span>
                                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${entry.weight}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <button
                                            onClick={() => onDelete(entry.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
