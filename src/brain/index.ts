import { AgentContext, TradeDecision } from "../types/index.js";
import { analyze } from "./analyzer.js";
import { kellyCriterion } from "./kellyCalculator.js";

const HAS_CONTRACT = process.env.PREDICTION_MARKET_CONTRACT && process.env.PREDICTION_MARKET_CONTRACT !== "0x...";
const LIVE_MARKETS = new Set(["btc-100k-july"]);

export async function decide(context: AgentContext): Promise<TradeDecision[]> {
  const rawDecisions = await analyze(context);

  return rawDecisions.map((d) => {
    const market = context.markets.find((m) => m.marketId === d.marketId);
    if (!market) return { ...d, action: "SKIP" as const };

    if (HAS_CONTRACT && !LIVE_MARKETS.has(d.marketId)) {
      return { ...d, action: "SKIP" as const, kellyFraction: 0, amount: "0", reasoning: "Non-LIVE market (no deployed contract)" };
    }

    const marketOdds = d.outcome === "A" ? market.oddsA : market.oddsB;
    const edge = d.probability - marketOdds;
    const minEdge = 0.05;

    if (edge < minEdge || d.confidence < 0.6) {
      return { ...d, action: "SKIP" as const, kellyFraction: 0, amount: "0" };
    }

    const { fraction, amount } = kellyCriterion(d.probability, marketOdds);
    return {
      ...d,
      kellyFraction: fraction,
      amount,
      action: "BUY" as const,
    };
  });
}
