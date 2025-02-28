export const COLORS = [
  "pink",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "mint",
  "lavender",
  "beige",
  "coral",
] as const;

export const IMPORTANCE_OPTIONS = ["veryLow", "low", "medium", "high", "veryHigh"] as const;

export const REPEAT_FREQUENCY_OPTIONS = ["daily", "weekly", "monthly", "yearly"] as const;

export const FREQUENCY = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
} as const;
