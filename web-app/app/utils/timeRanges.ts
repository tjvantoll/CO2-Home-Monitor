export const TIME_RANGES = {
  "24h": 24 * 60 * 60,
  "3d": 3 * 24 * 60 * 60,
  "7d": 7 * 24 * 60 * 60,
  "14d": 14 * 24 * 60 * 60,
  "30d": 30 * 24 * 60 * 60,
} as const;

export type TimeRange = keyof typeof TIME_RANGES;

export function isTimeRange(value: string): value is TimeRange {
  return Object.hasOwn(TIME_RANGES, value);
}
