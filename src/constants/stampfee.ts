export const STAMP_FEE_TIERS: Record<string, Array<[number, number, number]>> = {
  "Sale": [
    [0, 1, 2],
    [1, 2, 3],
    [2, 5, 4],
    [5, 10, 5],
    [10, Infinity, 6],
  ],
  "Gift": [
    [0, 1, 2],
    [1, 2, 3],
    [2, 5, 4],
    [5, 10, 5],
    [10, Infinity, 6],
  ],
  "Transfer": [
    [0, 1, 2],
    [1, 2, 3],
    [2, 5, 4],
    [5, 10, 5],
    [10, Infinity, 6],
  ],
  "Exchange": [
    [0, 1, 2],
    [1, 2, 3],
    [2, 5, 4],
    [5, 10, 5],
    [10, Infinity, 6],
  ],
  "Lease": [
    [0, 1, 2],
    [1, 2, 3],
    [2, 5, 4],
    [5, 10, 5],
    [10, Infinity, 6],
  ],
  "Mortgage": [
    [0, 1, 2],
    [1, 2, 3],
    [2, 5, 4],
    [5, 10, 5],
    [10, Infinity, 6],
  ],
};

export const DEFAULT_STAMP_TIERS: Array<[number, number, number]> = [
  [0, 1, 2],
  [1, 2, 3],
  [2, 5, 4],
  [5, 10, 5],
  [10, Infinity, 6],
];

export function getStampPercentage(amountInEth: number, type?: string): number {
  const tiers = type && STAMP_FEE_TIERS[type] ? STAMP_FEE_TIERS[type] : DEFAULT_STAMP_TIERS;
  for (const [minAmount, maxAmount, percentage] of tiers) {
    if (amountInEth >= minAmount && amountInEth < maxAmount) {
      return percentage;
    }
  }
  return 2;
}

