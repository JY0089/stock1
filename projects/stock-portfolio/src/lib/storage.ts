import { StockEntry } from '../types';

const STORAGE_KEY = 'stock_portfolio_entries';

export function getEntries(): StockEntry[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveEntries(entries: StockEntry[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addEntry(entry: Omit<StockEntry, 'id' | 'totalAmount'>): StockEntry {
    const entries = getEntries();
    const totalAmount = entry.pricePerShare * entry.quantity;
    const newEntry: StockEntry = {
        ...entry,
        id: crypto.randomUUID(),
        totalAmount,
    };
    saveEntries([...entries, newEntry]);
    return newEntry;
}

export function updateEntry(updatedEntry: StockEntry): void {
    const entries = getEntries();
    const newEntries = entries.map((entry) =>
        entry.id === updatedEntry.id ? { ...updatedEntry, totalAmount: updatedEntry.pricePerShare * updatedEntry.quantity } : entry
    );
    saveEntries(newEntries);
}

export function deleteEntry(id: string): void {
    const entries = getEntries();
    const newEntries = entries.filter((entry) => entry.id !== id);
    saveEntries(newEntries);
}
