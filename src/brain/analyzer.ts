import { AgentContext, TradeDecision } from "../types/index.js";

const SYSTEM_PROMPT = `You are an elite quantitative trading AI for prediction markets.
Your task is to analyze market odds, news sentiment, and estimate true probabilities.

For each market, consider:
1. Do the market odds reflect all available information?
2. How does recent news shift the probability?
3. Is there a mispricing (edge) between market-implied probability and your estimate?

Respond with a JSON array of decisions, one per market:
{
  "decisions": [
    {
      "marketId": "...",
      "estimatedProbability": 0.65,
      "confidence": 0.8,
      "reasoning": "Brief explanation of your analysis",
      "recommendedOutcome": "A" or "B"
    }
  ]
}

Rules:
- estimatedProbability is your true probability estimate for recommendedOutcome (0-1)
- confidence is how sure you are about this estimate (0-1)
- Only recommend BUY if estimatedProbability differs significantly from market odds
- Be conservative — prefer SKIP over weak edges`;

function buildUserPrompt(context: AgentContext): string {
  const marketsBlock = context.markets
    .map(
      (m) =>
        `Market: ${m.title} (ID: ${m.marketId})
  Outcome A ("${m.outcomeA}"): odds ${(m.oddsA * 100).toFixed(1)}%
  Outcome B ("${m.outcomeB}"): odds ${(m.oddsB * 100).toFixed(1)}%
  Liquidity: ${m.liquidity} USDC`
    )
    .join("\n\n");

  const newsBlock = context.news
    .map((n) => `- [${new Date(n.timestamp).toISOString()}] ${n.headline} (relevance: ${n.relevance})`)
    .join("\n");

  return `Current time: ${new Date(context.timestamp).toISOString()}

Markets:
${marketsBlock}

Recent news:
${newsBlock}

Analyze each market and recommend trades. Return JSON only.`;
}

const KEYWORD_MAP: Record<string, { market: string; shift: number }[]> = {
  "fed|rate cut|inflation|jobs|employment|cpi": [
    { market: "fed-rate-cut-june", shift: -0.08 },
  ],
  "bitcoin|btc|etf inflow|institutional": [
    { market: "btc-100k-july", shift: 0.10 },
  ],
  "usdc supply|stablecoin|usdc growth": [
    { market: "usdc-supply-2b", shift: 0.12 },
  ],
  "stablefx|fx trade|usdc.*eurc": [
    { market: "stablefx-launch", shift: 0.15 },
  ],
  "ethereum|eth|l2|staking": [
    { market: "eth-etf-inflow-record", shift: 0.06 },
  ],
};

function heuristicAnalyze(context: AgentContext): TradeDecision[] {
  return context.markets.map((m) => {
    let totalShift = 0;
    for (const [pattern, mappings] of Object.entries(KEYWORD_MAP)) {
      for (const mapping of mappings) {
        if (mapping.market !== m.marketId) continue;
        const regex = new RegExp(pattern, "i");
        for (const news of context.news) {
          if (regex.test(news.headline)) {
            totalShift += mapping.shift * news.relevance;
          }
        }
      }
    }

    const probA = Math.max(0.05, Math.min(0.95, m.oddsA + totalShift));
    const edgeA = probA - m.oddsA;
    const edgeB = (1 - probA) - m.oddsB;

    if (edgeA > edgeB && edgeA > 0.05) {
      return {
        marketId: m.marketId,
        outcome: "A" as const,
        confidence: Math.min(0.95, 0.6 + Math.abs(edgeA) * 2),
        probability: probA,
        kellyFraction: 0,
        amount: "0",
        action: "BUY" as const,
        reasoning: `News sentiment shift: ${(totalShift * 100).toFixed(1)}% → edge ${(edgeA * 100).toFixed(1)}% on ${m.outcomeA}`,
      };
    }
    if (edgeB > edgeA && edgeB > 0.05) {
      return {
        marketId: m.marketId,
        outcome: "B" as const,
        confidence: Math.min(0.95, 0.6 + Math.abs(edgeB) * 2),
        probability: 1 - probA,
        kellyFraction: 0,
        amount: "0",
        action: "BUY" as const,
        reasoning: `News sentiment shift: ${(totalShift * 100).toFixed(1)}% → edge ${(edgeB * 100).toFixed(1)}% on ${m.outcomeB}`,
      };
    }
    return {
      marketId: m.marketId,
      outcome: "A" as const,
      confidence: 0.5,
      probability: m.oddsA,
      kellyFraction: 0,
      amount: "0",
      action: "SKIP" as const,
      reasoning: `No significant edge (max ${(Math.max(edgeA, edgeB) * 100).toFixed(1)}%) after news analysis`,
    };
  });
}

export async function analyze(context: AgentContext): Promise<TradeDecision[]> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const effectiveKey = openRouterKey || openAiKey;
  const model = process.env.LLM_MODEL || "openai/gpt-4o";

  if (!effectiveKey) {
    return heuristicAnalyze(context);
  }

  const { OpenAI } = await import("openai");
  const client = new OpenAI({
    apiKey: effectiveKey,
    baseURL: openRouterKey ? "https://openrouter.ai/api/v1" : undefined,
    maxRetries: 3,
    timeout: 60_000,
  });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(context) },
    ],
    max_tokens: 2000,
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from LLM");

  const parsed = JSON.parse(content);
  const decisions = parsed.decisions ?? parsed;

  return decisions.map((d: any) => ({
    marketId: d.marketId,
    outcome: d.recommendedOutcome as "A" | "B",
    confidence: d.confidence,
    probability: d.estimatedProbability,
    kellyFraction: 0,
    amount: "0",
    action: "SKIP" as const,
    reasoning: d.reasoning,
  }));
}
