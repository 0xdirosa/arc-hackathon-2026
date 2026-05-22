import { NewsItem } from "../types/index.js";

const MOCK_NEWS: NewsItem[] = [
  {
    headline: "Fed Chair signals willingness to cut rates if inflation continues to moderate",
    source: "Reuters",
    timestamp: Date.now() - 3_600_000,
    relevance: 0.85,
  },
  {
    headline: "Bitcoin institutional inflows reach 6-month high as spot ETFs see record demand",
    source: "CoinDesk",
    timestamp: Date.now() - 7_200_000,
    relevance: 0.82,
  },
  {
    headline: "Circle reports USDC supply grew $2.3B in May, fastest growth in 12 months",
    source: "Circle Blog",
    timestamp: Date.now() - 2_000_000,
    relevance: 0.90,
  },
  {
    headline: "StableFX processes $50M in first week, on track to exceed $100M monthly",
    source: "The Block",
    timestamp: Date.now() - 4_000_000,
    relevance: 0.78,
  },
  {
    headline: "Ethereum L2 activity surges, boosting demand for ETH gas and staking yields",
    source: "CoinDesk",
    timestamp: Date.now() - 5_500_000,
    relevance: 0.55,
  },
  {
    headline: "US jobs data beats expectations, reducing probability of imminent Fed cut",
    source: "Bloomberg",
    timestamp: Date.now() - 1_500_000,
    relevance: 0.88,
  },
];

export async function fetchNews(): Promise<NewsItem[]> {
  return MOCK_NEWS;
}
