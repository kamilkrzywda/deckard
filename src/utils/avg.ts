export const getAvg = (prices: number[] | undefined): number => {
  if (!prices) return -1;
  else if (typeof prices[0] === "number") return _avg(prices as number[]);
  return 0;
};

const _avg = (prices: number[]): number =>
  (prices as number[])
    .slice()
    .sort((a, b) => a - b)
    .slice(Math.floor(prices.length * 0.1), Math.ceil(prices.length * 0.9))
    .reduce((sum, item) => sum + item, 0) /
  (Math.ceil(prices.length * 0.9) - Math.floor(prices.length * 0.1));
