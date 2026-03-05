export interface StockEntry {
    id: string;
    name: string;
    sector: string;
    purchaseDate: string;
    pricePerShare: number;
    quantity: number;
    totalAmount: number; // price * quantity
}

export interface PortfolioSummary {
    totalInvestment: number;
    entries: (StockEntry & { weight: number })[];
}
