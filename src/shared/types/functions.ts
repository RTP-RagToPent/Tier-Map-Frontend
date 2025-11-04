export interface Rally {
  id: number;
  name: string;
  genre: string;
  message?: string;
}

export interface Spot {
  id: string;
  name: string;
  order_no: number;
  message?: string;
}

export interface Rating {
  id: number;
  spot_id: string;
  name: string;
  order_no: number;
  stars: number;
  memo: string;
  message?: string;
}

export interface RallyListResponse {
  rallies: Rally[];
  message: string;
}

export interface SpotListResponse {
  spots: Spot[];
  message: string;
}

export interface RatingListResponse {
  ratings: Rating[];
  message: string;
}
