import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(process.cwd(), '..', 'dashboard', 'data.json');

function readData(): any {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return { trades: [], stats: { totalTrades: 0, wins: 0, losses: 0, pnl: 0, bankroll: 1000 } };
  }
}

export async function GET() {
  const data = readData();
  return NextResponse.json({
    onchain: data.onchain || { sharesA: 0, sharesB: 0, poolSize: 0, priceA: 0, priceB: 0, resolved: false },
    portfolio: data.stats || { totalTrades: 0, wins: 0, losses: 0, pnl: 0, bankroll: 1000, winRate: 0 },
    markets: data.markets || [],
    decisions: data.decisions || [],
    history: data.history || [],
    news: data.news || [],
    contract: process.env.PREDICTION_MARKET_CONTRACT || '0x98cAbC5317F0d9BF14A9dD50860aC3B3BfC4E3B1',
    agent: process.env.AGENT_STACK_ADDRESS || '0x6d7298b17f7e3007bf466df577006439c175f111',
    model: 'openai/gpt-4o',
    timestamp: new Date().toISOString(),
  });
}
