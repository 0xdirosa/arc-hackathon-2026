import express from "express";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, "data.json");
const PUBLIC_DIR = path.resolve(__dirname, "public");

const RPC = "https://rpc.testnet.arc-node.thecanteenapp.com/v1/swrm_c81020558cf176102b226829332a6d025d6efcdacdbd03efbbff1050fd2fe7fa";
const CONTRACT = "0x98cAbC5317F0d9BF14A9dD50860aC3B3BfC4E3B1";
const AGENT = "0x6d7298b17f7e3007bf466df577006439c175f111";

const provider = new ethers.JsonRpcProvider(RPC);
const marketAbi = [
  "function getPrice(uint256 outcome) view returns (uint256)",
  "function totalSharesA() view returns (uint256)",
  "function totalSharesB() view returns (uint256)",
  "function sharesA(address) view returns (uint256)",
  "function sharesB(address) view returns (uint256)",
  "function sharesB(address) view returns (uint256)",
  "function question() view returns (string)",
  "function resolved() view returns (bool)",
];
const contract = new ethers.Contract(CONTRACT, marketAbi, provider);

const app = express();
const PORT = Number(process.env.DASHBOARD_PORT) || 3000;

function readData(): any {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return { trades: [], stats: { totalTrades: 0, wins: 0, losses: 0, pnl: 0, bankroll: 1000 } };
  }
}

app.get("/api/stats", async (_req, res) => {
  try {
    const [rawSharesA, rawSharesB, rawTotalA, rawTotalB, rawResolved, rawPriceA, rawPriceB] = await Promise.all([
      contract.sharesA(AGENT),
      contract.sharesB(AGENT),
      contract.totalSharesA(),
      contract.totalSharesB(),
      contract.resolved(),
      contract.getPrice(0),
      contract.getPrice(1),
    ]);

    const data = readData();

    res.json({
      onchain: {
        sharesA: Number(ethers.formatUnits(rawSharesA, 6)),
        sharesB: Number(ethers.formatUnits(rawSharesB, 6)),
        totalSharesA: Number(ethers.formatUnits(rawTotalA, 6)),
        totalSharesB: Number(ethers.formatUnits(rawTotalB, 6)),
        poolSize: Number(ethers.formatUnits(rawTotalA + rawTotalB, 6)),
        priceA: Number(rawPriceA) / 1e6,
        priceB: Number(rawPriceB) / 1e6,
        resolved: rawResolved,
      },
      portfolio: data.stats || { totalTrades: 0, wins: 0, losses: 0, pnl: 0, bankroll: 1000 },
      markets: data.markets || [],
      decisions: data.decisions || [],
      history: data.history || [],
      contract: CONTRACT,
      agent: AGENT,
      model: process.env.LLM_MODEL || "openai/gpt-4o",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/trades", (_req, res) => {
  const data = readData();
  const trades = (data.trades || []).slice(-50).reverse();
  res.json({ trades });
});

app.use(express.static(PUBLIC_DIR));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Dashboard: http://0.0.0.0:${PORT}`);
  console.log(`Contract:  ${CONTRACT}`);
  console.log(`Agent:     ${AGENT}`);
});
