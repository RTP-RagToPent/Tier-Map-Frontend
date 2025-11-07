export interface Rally {
  id: number;
  name: string;
  genre: string;
}

export interface Spot {
  id: string;
  name: string;
  order_no: number;
}

export interface Rating {
  id: number;
  spot_id: string;
  name: string;
  order_no: number;
  stars: number;
  memo: string;
}

export interface Profile {
  id: number;
  name: string;
}

export interface ProfileResponse {
  data: Profile;
  message: string;
}

export interface RallyListResponse {
  data: Rally[];
  message: string;
}

export interface RallyResponse {
  data: Rally;
  message: string;
}

export interface SpotListResponse {
  data: Spot[];
  message: string;
}

export interface SpotResponse {
  data: Spot;
  message: string;
}

export interface RatingListResponse {
  data: Rating[];
  message: string;
}

export interface RatingResponse {
  data: Rating;
  message: string;
}
