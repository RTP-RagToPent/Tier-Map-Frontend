/**
 * Google Places API の型定義
 * @see https://developers.google.com/maps/documentation/places/web-service/search
 */

// Geocoding API レスポンス
export interface GeocodeResult {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }>;
  status: string;
}

// Places Text Search レスポンス
export interface PlacesSearchResult {
  results: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    rating?: number;
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
    }>;
    types?: string[];
    business_status?: string;
  }>;
  status: string;
  error_message?: string;
}

// Places Details レスポンス
export interface PlaceDetailsResult {
  result: {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    rating?: number;
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
    }>;
    formatted_phone_number?: string;
    opening_hours?: {
      open_now?: boolean;
      weekday_text?: string[];
    };
    website?: string;
  };
  status: string;
}

// ジャンルとGoogle Places タイプのマッピング
export const GENRE_TYPE_MAPPING: Record<string, string> = {
  ラーメン: 'ramen_restaurant',
  カフェ: 'cafe',
  居酒屋: 'bar',
  イタリアン: 'italian_restaurant',
  焼肉: 'restaurant',
  寿司: 'sushi_restaurant',
  ベーカリー: 'bakery',
  スイーツ: 'bakery|cafe',
};

// Google Places API のステータスコード
export const PlacesStatus = {
  OK: 'OK',
  ZERO_RESULTS: 'ZERO_RESULTS',
  INVALID_REQUEST: 'INVALID_REQUEST',
  OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
  REQUEST_DENIED: 'REQUEST_DENIED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type PlacesStatusType = (typeof PlacesStatus)[keyof typeof PlacesStatus];
