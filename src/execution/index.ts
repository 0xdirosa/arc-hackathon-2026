import { TradeDecision, ExecutionResult } from "../types/index.js";
import { executeTrade } from "./tradeExecutor.js";

export async function execute(decision: TradeDecision): Promise<ExecutionResult> {
  return executeTrade(decision);
}
