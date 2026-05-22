export interface TradeRecord {
  timestamp: number;
  marketId: string;
  outcome: string;
  amount: string;
  probability: number;
  marketOdds: number;
  result: "PENDING" | "WON" | "LOST";
  pnl: string;
  txId?: string;
}

export class PerformanceTracker {
  private trades: TradeRecord[] = [];
  private bankroll = 1000;

  recordTrade(trade: Omit<TradeRecord, "timestamp" | "result" | "pnl">): void {
    this.trades.push({
      ...trade,
      timestamp: Date.now(),
      result: "PENDING",
      pnl: "0",
    });
  }

  settleTrade(marketId: string, won: boolean): void {
    const trade = this.trades.find(
      (t) => t.marketId === marketId && t.result === "PENDING"
    );
    if (!trade) return;

    const amount = parseFloat(trade.amount) / 1_000_000;
    if (won) {
      const payout = amount * (1 / trade.marketOdds);
      trade.pnl = (payout - amount).toFixed(2);
      this.bankroll += payout - amount;
    } else {
      trade.pnl = (-amount).toFixed(2);
      this.bankroll -= amount;
    }
    trade.result = won ? "WON" : "LOST";
  }

  getStats(): { totalTrades: number; wins: number; losses: number; pnl: number; bankroll: number; winRate: number } {
    const settled = this.trades.filter((t) => t.result !== "PENDING");
    const wins = settled.filter((t) => t.result === "WON").length;
    const losses = settled.filter((t) => t.result === "LOST").length;
    const pnl = settled.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
    return {
      totalTrades: settled.length,
      wins,
      losses,
      pnl,
      bankroll: this.bankroll,
      winRate: settled.length > 0 ? wins / settled.length : 0,
    };
  }

  getBankroll(): number {
    return this.bankroll;
  }

  getAllTrades(): TradeRecord[] {
    return this.trades;
  }
}
