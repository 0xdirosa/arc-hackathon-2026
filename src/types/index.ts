export type MarketOutcome = "A" | "B";

export interface MarketOdds {
  marketId: string;
  title: string;
  outcomeA: string;
  outcomeB: string;
  oddsA: number;
  oddsB: number;
  liquidity: string;
}

export interface NewsItem {
  headline: string;
  source: string;
  timestamp: number;
  relevance: number;
}

export interface AgentContext {
  markets: MarketOdds[];
  news: NewsItem[];
  timestamp: number;
}

export interface TradeDecision {
  marketId: string;
  outcome: MarketOutcome;
  confidence: number;
  probability: number;
  kellyFraction: number;
  amount: string;
  action: "BUY" | "SKIP";
  reasoning: string;
}

export interface ExecutionResult {
  transactionId: string;
  status: string;
  success: boolean;
}
