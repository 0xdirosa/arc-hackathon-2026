# PLAN — Prediction Market Trader Intelligence Agent

## Arsitektur 3 Langkah (Loop Otonom)

```
┌──────────────────────────────────────────────────────┐
│                     Agent Loop                        │
│  ┌──────────┐    ┌──────────┐    ┌────────────────┐  │
│  │  Data    │───▶│  Brain   │───▶│  Execution     │  │
│  │Ingestion │    │ (OpenAI) │    │ (Circle DCW)   │  │
│  └──────────┘    └──────────┘    └────────────────┘  │
│        │                                               │
│        └─────────── Loop kembali ─────────────────────┘
```

---

## 1. Data Ingestion (`src/ingestion/`)

### Tujuan
Mengumpulkan data eksternal untuk feed agen: odds prediction market + berita/sentimen.

### Komponen
- **`marketDataProvider.ts`** — Mengambil mock odds dari prediction market (struktur: `{ marketId, outcomeA, outcomeB, currentOdds, liquidity }`). Nantinya bisa diganti dengan Polymarket API atau oracle onchain.
- **`newsSentimentProvider.ts`** — Mengambil mock berita/trigger event (struktur: `{ headline, source, timestamp, relevance }`). Nantinya bisa diganti dengan News API / RSS.
- **`index.ts`** — Orchestrator yang menggabungkan kedua sumber menjadi `AgentContext` tunggal.

### Output
```typescript
type AgentContext = {
  markets: MarketOdds[];
  news: NewsItem[];
  timestamp: number;
};
```

### Referensi dari Sample
Tidak ada dependencies langsung ke Circle di layer ini — murni data fetching.

---

## 2. Brain (`src/brain/`)

### Tujuan
Menggunakan OpenAI untuk menganalisis konteks dan memutuskan: **(a)** probabilitas kemenangan, **(b)** ukuran trade (Kelly Criterion), **(c)** apakah akan eksekusi.

### Komponen
- **`analyzer.ts`** — Memanggil OpenAI Chat Completion dengan prompt yang menyusun:
  - Market odds vs analyzed probability
  - Sentimen berita (positif/negatif/netral terhadap setiap outcome)
  - Rekomendasi: beli outcome A, B, atau skip
- **`kellyCalculator.ts`** — Menghitung ukuran posisi optimal:
  ```
  f* = (bp - q) / b
  dimana:
    b = odds-implied payout multiplier
    p = probability dari AI
    q = 1 - p
  ```
- **`index.ts`** — Orchestrator: panggil analyzer → hitung Kelly → hasilkan `TradeDecision`.

### Output
```typescript
type TradeDecision = {
  marketId: string;
  outcome: "A" | "B";
  confidence: number;        // 0-1
  probability: number;       // AI-estimated win %
  kellyFraction: number;     // % bankroll to bet
  amount: string;            // USDC amount (atomic units)
  action: "BUY" | "SKIP";
  reasoning: string;
};
```

### Referensi dari Sample
- **`openAIClient.ts`** (`arc-escrow/lib/utils/openAIClient.ts:21-25`) — Pola inisialisasi OpenAI client:
  ```typescript
  import OpenAI from "openai";
  export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3,
    timeout: 60_000,
  });
  ```

---

## 3. Execution (`src/execution/`)

### Tujuan
Mengeksekusi trade ke prediction market smart contract di Arc via Circle Developer-Controlled Wallets. Polling status sampai terminal.

### Komponen
- **`circleClient.ts`** — Inisialisasi Circle DCW SDK (sama persis pola sample).
- **`tradeExecutor.ts`** — Memanggil `createContractExecutionTransaction` ke prediction market contract:
  - Fungsi: `buyOutcome(address market, uint256 outcomeId, uint256 amount)`
  - Parameter: marketId, outcomeId, amount (USDC dalam atomic units 6 desimal)
  - Fee level: MEDIUM (Arc ~$0.01/tx)
- **`transactionPoller.ts`** — Poll status transaksi sampai `COMPLETE` atau `FAILED`.

### Flow
```
TradeDecision
    │
    ▼
convertToSmallestUnit(amount)    ← 6 desimal USDC
    │
    ▼
circleDeveloperSdk.createContractExecutionTransaction({
  walletId,
  contractAddress: PREDICTION_MARKET_CONTRACT,
  abiFunctionSignature: "buyOutcome(address,uint256,uint256)",
  abiParameters: [marketId, outcomeId, atomicAmount],
  fee: { type: "level", config: { feeLevel: "MEDIUM" } },
})
    │
    ▼
Poll → COMPLETE / FAILED
    │
    ▼
Log hasil + loop kembali ke step 1
```

### Referensi dari Sample
- **`developer-controlled-wallets-client.ts`** (`arc-fintech` & `arc-escrow`) — Pola inisialisasi:
  ```typescript
  import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
  export const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET,
  });
  ```
- **`executeContract.ts`** (`arc-escrow/lib/utils/executeContract.ts:30-63`) — Pola `createContractExecutionTransaction` dengan error handling.
- **`route.ts` (wallet/transfer)** (`arc-fintech/app/api/wallet/transfer/route.ts:25-29`) — Konversi USDC ke atomic units (6 desimal).

---

## Entry Point (`src/index.ts`)

```typescript
async function main() {
  await loadEnv();
  
  while (true) {
    const context = await ingest();          // Step 1
    const decision = await analyze(context); // Step 2
    
    if (decision.action === "BUY") {
      const result = await execute(decision); // Step 3
      console.log(`Trade executed: ${result.transactionId}`);
    }
    
    await sleep(60_000); // Loop tiap 60 detik
  }
}
```

---

## Environment Variables (`.env`)

```
OPENAI_API_KEY=sk-...
CIRCLE_API_KEY=PREFIX:ID:SECRET
CIRCLE_ENTITY_SECRET=...
PREDICTION_MARKET_CONTRACT=0x...
AGENT_WALLET_ID=wallet_...
```

---

## File Structure Final

```
src/
├── index.ts                     # Entry point, main loop
├── ingestion/
│   ├── index.ts                 # Orchestrator ingestion
│   ├── marketDataProvider.ts    # Mock market odds
│   └── newsSentimentProvider.ts # Mock news/sentiment
├── brain/
│   ├── index.ts                 # Orchestrator brain
│   ├── analyzer.ts              # OpenAI prompt + parsing
│   └── kellyCalculator.ts       # Kelly Criterion
├── execution/
│   ├── index.ts                 # Orchestrator execution
│   ├── circleClient.ts          # Circle DCW SDK init
│   ├── tradeExecutor.ts         # Contract call
│   └── transactionPoller.ts     # Poll tx status
└── types/
    └── index.ts                 # Shared type definitions
```

---

## Catatan Penting

- **Tidak ada endpoint API yang dibuat-buat** — semua referensi API Circle diambil dari sample yang sudah ada (`@circle-fin/developer-controlled-wallets` SDK).
- **Polymarket / prediction market contract address** akan menjadi konfigurasi environment, bukan hardcode.
- **Agent Wallet** menggunakan Developer-Controlled Wallets (DCW) agar agen memiliki full custody otonom.
- **Arc mainnet** biaya ~$0.01 per tx dalam USDC — cocok untuk high-frequency agentic trading.
- **Mapper RFB**: Solusi ini langsung menjawab RFB 02 — "mencari +EV bets, Kelly Criterion position sizing, informasi agregasi dengan source credibility weighting."
