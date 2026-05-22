import { execFileSync } from "child_process";
import { TradeDecision, ExecutionResult } from "../types/index.js";

const CLI = "./node_modules/.bin/circle";
const WALLET = process.env.AGENT_STACK_ADDRESS;
const CHAIN = "ARC-TESTNET";

export async function executeTrade(decision: TradeDecision): Promise<ExecutionResult> {
  if (!WALLET) throw new Error("AGENT_STACK_ADDRESS not set");
  const contractAddress = process.env.PREDICTION_MARKET_CONTRACT;
  if (!contractAddress) throw new Error("PREDICTION_MARKET_CONTRACT not set");

  const outcomeId = decision.outcome === "A" ? "0" : "1";
  const amountAtomic = BigInt(decision.amount);

  const args = [
    "wallet", "execute",
    "buyOutcome(uint256,uint256)",
    outcomeId,
    amountAtomic.toString(),
    "--contract", contractAddress,
    "--address", WALLET,
    "--chain", CHAIN,
    "--testnet",
    "--output", "json",
  ];

  try {
    const output = execFileSync(CLI, args, { encoding: "utf-8", cwd: process.cwd() });
    const parsed = JSON.parse(output);
    const txData = parsed.data;

    return {
      transactionId: txData.id,
      status: txData.state,
      success: txData.state === "COMPLETE",
    };
  } catch (err: any) {
    throw new Error(`Circle CLI execute failed: ${err.stderr || err.message}`);
  }
}
