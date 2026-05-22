import { AgentContext } from "../types/index.js";
import { fetchMarketOdds } from "./marketDataProvider.js";
import { fetchNews } from "./newsSentimentProvider.js";

export async function ingest(): Promise<AgentContext> {
  const [markets, news] = await Promise.all([
    fetchMarketOdds(),
    fetchNews(),
  ]);

  return { markets, news, timestamp: Date.now() };
}
