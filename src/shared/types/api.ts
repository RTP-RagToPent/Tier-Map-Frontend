/**
 * バックエンドAPI型定義
 * Supabase Edge Functions (/functions/v1/*)
 */

// ========================================
// 共通型
// ========================================

export interface ApiResponse<T> {
  data?: T;
  message: string;
  error?: string;
}

// ========================================
// 認証 (Login)
// ========================================

export interface LoginRequest {
  // Google OAuth accessToken
  accessToken: string;
}

export interface LoginResponse {
  sessionToken: string;
  message: string;
}

// ========================================
// プロフィール (Profiles)
// ========================================

export interface Profile {
  id: number;
  name: string;
}

export interface ProfileResponse extends Profile {
  message: string;
}

export interface CreateProfileRequest {
  name: string;
}

export interface UpdateProfileRequest {
  name: string;
}

// ========================================
// ラリー (Rallies)
// ========================================

export interface Rally {
  id: number;
  name: string;
  genre: string;
}

export interface RallyResponse extends Rally {
  message: string;
}

export interface RallyListResponse {
  rallies: Rally[];
  message: string;
}

export interface CreateRallyRequest {
  name: string;
  genre: string;
}

export interface UpdateRallyRequest {
  name?: string;
  genre?: string;
}

// ========================================
// スポット (Spots)
// ========================================

export interface RallySpot {
  id: string; // uuid
  name: string;
  order_no: number;
}

export interface RallySpotResponse extends RallySpot {
  message: string;
}

export interface RallySpotListResponse {
  spots: RallySpot[];
  message: string;
}

export interface AddSpotsRequest {
  spots: Array<{
    spot_id: string; // uuid (Google Place ID)
    name: string;
  }>;
}

// ========================================
// 評価 (Ratings)
// ========================================

export interface Rating {
  id: number;
  spot_id: string; // uuid
  name: string;
  order_no: number;
  stars: number; // 1-5
  memo: string;
}

export interface RatingResponse extends Rating {
  message: string;
}

export interface RatingListResponse {
  ratings: Rating[];
  message: string;
}

export interface CreateRatingRequest {
  spot_id: string;
  stars: number; // 1-5
  memo?: string;
}

// ========================================
// API Endpoints
// ========================================
