export interface Spot {
  id: string;
  name: string;
  address: string;
  rating?: number;
  lat: number;
  lng: number;
  photoUrl?: string;
}

export interface Rally {
  id: string;
  name: string;
  region: string;
  genre: string;
  spots: Spot[];
  createdAt: string;
  status: "draft" | "in_progress" | "completed";
}

export interface SpotEvaluation {
  spotId: string;
  rating: number; // 1-5
  memo?: string;
  visitedAt?: string;
}

