import type { Spot as ApiSpot } from '@shared/types/spot';

export type PriceRange = '¥' | '¥¥' | '¥¥¥';

export interface UISpot extends ApiSpot {
  distanceKm?: number;
  priceRange?: PriceRange;
  thumbnailUrl?: string;
  isOpen?: boolean;
  memo?: string;
}

export type Tier = 'S' | 'A' | 'B';

export interface TierBoardState {
  S: UISpot[];
  A: UISpot[];
  B: UISpot[];
}

export interface EvaluationState {
  spotId: string;
  rating: number;
  memo?: string;
  visitedAt?: string;
}

export interface SelectionState {
  selectedSpotIds: string[];
  maxSelection: number;
}
