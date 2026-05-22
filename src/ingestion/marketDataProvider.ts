import { MarketOdds } from "../types/index.js";

const MOCK_MARKETS: MarketOdds[] = [
  {
    marketId: "btc-100k-july",
    title: "Bitcoin above $100k by July 1 2026",
    outcomeA: "Yes >=$100k",
    outcomeB: "No <$100k",
    oddsA: 0.35,
    oddsB: 0.65,
    liquidity: "45000",
  },
  {
    marketId: "fed-rate-cut-june",
    title: "Fed rate cut at June 2026 meeting",
    outcomeA: "Rate cut >=25bp",
    outcomeB: "No cut or hold",
    oddsA: 0.42,
    oddsB: 0.58,
    liquidity: "75000",
  },
  {
    marketId: "usdc-supply-2b",
    title: "USDC supply grows $2B+ in May 2026",
    outcomeA: "Yes, exceeds $2B",
    outcomeB: "No, below $2B",
    oddsA: 0.55,
    oddsB: 0.45,
    liquidity: "10000",
  },
];

export async function fetchMarketOdds(): Promise<MarketOdds[]> {
  return MOCK_MARKETS;
}
