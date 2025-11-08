export type TierRank = 'S' | 'A' | 'B';

export interface TierSpot {
  id: string;
  name: string;
  rating: number;
  tier: TierRank;
  memo?: string;
}

export function calculateTier(rating: number): TierRank {
  if (rating >= 4.5) return 'S';
  if (rating >= 3.5) return 'A';
  return 'B';
}

export function groupByTier(spots: TierSpot[]): Record<TierRank, TierSpot[]> {
  return {
    S: spots.filter((s) => s.tier === 'S'),
    A: spots.filter((s) => s.tier === 'A'),
    B: spots.filter((s) => s.tier === 'B'),
  };
}

export const tierColors = {
  S: {
    bg: 'bg-card neumorphism',
    border: 'border-0',
    text: 'text-card-foreground',
    badge: 'bg-primary text-primary-foreground neumorphism',
  },
  A: {
    bg: 'bg-card neumorphism',
    border: 'border-0',
    text: 'text-card-foreground',
    badge: 'bg-accent text-accent-foreground neumorphism',
  },
  B: {
    bg: 'bg-card neumorphism',
    border: 'border-0',
    text: 'text-card-foreground',
    badge: 'bg-secondary text-secondary-foreground neumorphism',
  },
};
