# Prediction Market Trader Intelligence

**Hackathon Agora Canteen × Circle — RFB 02**

Agent AI otonom untuk menganalisis berita/sentimen via GPT-4o, mengevaluasi probabilitas dengan **Kelly Criterion**, dan mengeksekusi trade prediction market **on-chain di Arc testnet** via **Circle Agent Stack CLI**.

## Arsitektur

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Ingestion     │────▶│     Brain       │────▶│   Execution      │
│                 │     │                 │     │                  │
│ Market Data     │     │ GPT-4o (OpenRouter) │  Circle Agent CLI │
│ News/Sentiment  │     │ Fractional Kelly │     │ PredictionMarket │
│                 │     │   (50%, cap 25%) │     │  (Arc testnet)   │
└─────────────────┘     └─────────────────┘     └──────────────────┘
                                              │
                                              ▼
                                         ┌──────────┐
                                         │Dashboard │
                                         │ :3000    │
                                         └──────────┘
```

## Fitur

- **Analisis LLM**: GPT-4o via OpenRouter — menganalisis berita terkini untuk probabilitas pasar
- **Kelly Criterion**: Fractional Kelly (50%, capped 25%) untuk ukuran posisi optimal
- **On-chain Execution**: Circle Agent Stack CLI → `buyOutcome(uint256,uint256)` di Arc testnet
- **Dashboard Real-time**: Express server port 3000 — stats on-chain, portfolio, trade history, market analysis
- **Dual-mode**: Heuristic fallback jika tidak ada API key LLM

## Prasyarat

- Node.js 22+
- Circle Agent Stack CLI ([install guide](https://docs.circle.com/agent-stack))
- Wallet ARC-TESTNET dengan USDC

## Instalasi

```bash
git clone <repo-url>
cd prediction-market-trader
cp .env.example .env
# isi PREDICTION_MARKET_CONTRACT, AGENT_STACK_ADDRESS, OPENROUTER_API_KEY
npm install
```

## Menjalankan

```bash
# Agent loop
npm start

# Dashboard
npm run dashboard
```

## Smart Contract

`PredictionMarket.sol` — Deployed di Arc testnet:
- **Contract**: `0x98cAbC5317F0d9BF14A9dD50860aC3B3BfC4E3B1`
- **Agent Wallet**: `0x6d7298b17f7e3007bf466df577006439c175f111`
- **Agent ID (ERC-8004)**: 19353
- **Job ID (ERC-8183)**: 38722

## Tech Stack

- TypeScript, Node.js
- Circle Agent Stack CLI
- ethers.js
- OpenRouter (GPT-4o)
- Express
- Solidity 0.8.35

## Submission

Hackathon Agora Canteen × Circle — Mei 2026
