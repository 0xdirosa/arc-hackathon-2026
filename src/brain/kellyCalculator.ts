const BANKROLL_USDC = 1000;
const MAX_FRACTION = 0.25;
const FRACTIONAL_KELLY = 0.5;

export function kellyCriterion(
  estimatedProbability: number,
  marketOdds: number
): { fraction: number; amount: string } {
  if (marketOdds <= 0 || marketOdds >= 1) {
    return { fraction: 0, amount: "0" };
  }

  const b = 1 / marketOdds - 1;
  if (b <= 0) return { fraction: 0, amount: "0" };

  const p = estimatedProbability;
  const q = 1 - p;
  const fullKelly = (b * p - q) / b;
  const fraction = Math.max(0, Math.min(fullKelly * FRACTIONAL_KELLY, MAX_FRACTION));
  const amountAtomic = BigInt(Math.floor(fraction * BANKROLL_USDC * 1_000_000)).toString();

  return { fraction, amount: amountAtomic };
}
