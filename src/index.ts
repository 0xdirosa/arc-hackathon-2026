import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ingest } from "./ingestion/index.js";
import { decide } from "./brain/index.js";
import { execute } from "./execution/index.js";
import { PerformanceTracker } from "./core/performance.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HAS_CONTRACT = process.env.PREDICTION_MARKET_CONTRACT && process.env.PREDICTION_MARKET_CONTRACT !== "0x...";
const DRY_RUN = !HAS_CONTRACT;

const tracker = new PerformanceTracker();

function saveState(extra?: Record<string, any>) {
  try {
    const dataFile = path.resolve(__dirname, "..", "dashboard", "data.json");
    const data = { trades: tracker.getAllTrades(), stats: tracker.getStats(), markets: [], news: [], decisions: [], ...extra };
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch {}
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Prediction Market Trader Agent`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (simulasi)" : "LIVE (Arc Testnet)"}`);
  if (!DRY_RUN) {
    console.log(`  Contract: ${process.env.PREDICTION_MARKET_CONTRACT}`);
    console.log(`  Wallet:   ${process.env.AGENT_STACK_ADDRESS}`);
  }
  console.log(`Bankroll: $${tracker.getBankroll().toFixed(2)} USDC`);
  console.log(`\n`);

  let firstLoop = true;

  while (true) {
    try {
      const ts = new Date().toISOString();
      console.log(`[${ts}] --- Agent Loop ---`);

      const context = await ingest();
      console.log(`  Market: ${context.markets.length}, News: ${context.news.length}`);

      const decisions = await decide(context);

      for (const d of decisions) {
        if (d.action === "SKIP") {
          console.log(`  SKIP ${d.marketId}: ${d.reasoning}`);
          continue;
        }

        const market = context.markets.find((m) => m.marketId === d.marketId);
        const odds = d.outcome === "A" ? market?.oddsA : market?.oddsB;

        console.log(`  BUY ${d.marketId}`);
        console.log(`    Outcome: ${d.outcome} | Prob: ${(d.probability * 100).toFixed(1)}% | Edge: ${(((d.probability - (odds ?? 0)) * 100)).toFixed(1)}%`);
        console.log(`    Kelly: ${(d.kellyFraction * 100).toFixed(1)}% | Amount: ${(parseInt(d.amount) / 1_000_000).toFixed(2)} USDC`);
        console.log(`    Reasoning: ${d.reasoning}`);

        if (DRY_RUN) {
          console.log(`    -> DRY RUN: trade tercatat (tidak dieksekusi)`);
          tracker.recordTrade({
            marketId: d.marketId,
            outcome: d.outcome,
            amount: d.amount,
            probability: d.probability,
            marketOdds: odds ?? 0.5,
          });

          const won = d.probability > 0.5;
          tracker.settleTrade(d.marketId, won);

          const stats = tracker.getStats();
          console.log(`    -> Simulasi: ${won ? "WIN" : "LOSS"} | Bankroll: $${stats.bankroll.toFixed(2)} | Rate: ${(stats.winRate * 100).toFixed(1)}%`);
        } else {
          const result = await execute(d);
          console.log(`    -> Tx: ${result.transactionId} | Status: ${result.status} | Success: ${result.success}`);
          if (result.success) {
            tracker.recordTrade({
              marketId: d.marketId,
              outcome: d.outcome,
              amount: d.amount,
              probability: d.probability,
              marketOdds: odds ?? 0.5,
            });
            const won = d.probability > 0.5;
            tracker.settleTrade(d.marketId, won);
          }
        }
      }

      const stats = tracker.getStats();
      if (stats.totalTrades > 0) {
        console.log(`  [Portfolio] Trades: ${stats.totalTrades} | W:${stats.wins} L:${stats.losses} | PnL: $${stats.pnl.toFixed(2)} | Bankroll: $${stats.bankroll.toFixed(2)}`);
      }

      saveState({ markets: context.markets, news: context.news, decisions: decisions.map((d: any) => ({ marketId: d.marketId, action: d.action, outcome: d.outcome, confidence: d.confidence, probability: d.probability, kellyFraction: d.kellyFraction, amount: d.amount, reasoning: d.reasoning })) });
      console.log(`--- Selesai ---\n`);
    } catch (err) {
      console.error("Error di agent loop:", err);
    }

    if (firstLoop) {
      firstLoop = false;
      console.log("Test selesai. Agent akan lanjut loop tiap 60 detik.");
      console.log("Ctrl+C untuk berhenti.\n");
    }

    await sleep(60_000);
  }
}

main().catch(console.error);
