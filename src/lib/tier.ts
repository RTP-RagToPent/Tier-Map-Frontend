export type TierRank = "S" | "A" | "B";

export interface TierSpot {
  id: string;
  name: string;
  rating: number;
  tier: TierRank;
  memo?: string;
}

export function calculateTier(rating: number): TierRank {
  if (rating >= 4.5) return "S";
  if (rating >= 3.5) return "A";
  return "B";
}

export function groupByTier(spots: TierSpot[]): Record<TierRank, TierSpot[]> {
  return {
    S: spots.filter((s) => s.tier === "S"),
    A: spots.filter((s) => s.tier === "A"),
    B: spots.filter((s) => s.tier === "B"),
  };
}

export const tierColors = {
  S: {
    bg: "bg-yellow-100",
    border: "border-yellow-500",
    text: "text-yellow-900",
    badge: "bg-yellow-500 text-white",
  },
  A: {
    bg: "bg-blue-100",
    border: "border-blue-500",
    text: "text-blue-900",
    badge: "bg-blue-500 text-white",
  },
  B: {
    bg: "bg-gray-100",
    border: "border-gray-500",
    text: "text-gray-900",
    badge: "bg-gray-500 text-white",
  },
};

