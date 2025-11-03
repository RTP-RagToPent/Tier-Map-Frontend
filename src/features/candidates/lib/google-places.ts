import { Spot } from '@shared/types/spot';

/**
 * Google Places APIを使用してスポットを検索
 * Route Handlerを経由してAPIキーを隠蔽し、キャッシュ機能を統合
 * @param region 地域名（例: "渋谷区"）
 * @param genre ジャンル（例: "ラーメン"）
 * @returns スポットの配列
 */
export async function searchSpots(region: string, genre: string): Promise<Spot[]> {
  console.log('🔍 Searching spots:', region, '-', genre);

  try {
    const response = await fetch(
      `/api/google/spots?region=${encodeURIComponent(region)}&genre=${encodeURIComponent(genre)}`
    );

    if (!response.ok) {
      console.error('Failed to fetch spots:', response.status);
      return getMockSpots(region, genre); // フォールバック
    }

    const data = await response.json();

    if (data.spots && data.spots.length > 0) {
      console.log(
        data.source === 'cache' ? '📦 Using cached data' : '🌐 Using Google Places API data'
      );
      return data.spots;
    }

    console.warn('No results from API, using mock data');
    return getMockSpots(region, genre); // フォールバック
  } catch (error) {
    console.error('Error searching spots:', error);
    return getMockSpots(region, genre); // フォールバック
  }
}

/**
 * モックデータを返す（APIが利用できない場合のフォールバック）
 */
function getMockSpots(region: string, genre: string): Spot[] {
  console.warn('⚠️ Using mock data');

  return [
    {
      id: 'mock-spot-1',
      name: `${region}の${genre}スポット A (Mock)`,
      address: `${region} 1-1-1`,
      rating: 4.5,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: 'https://via.placeholder.com/300x200?text=Mock+Spot+A',
    },
    {
      id: 'mock-spot-2',
      name: `${region}の${genre}スポット B (Mock)`,
      address: `${region} 2-2-2`,
      rating: 4.2,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: 'https://via.placeholder.com/300x200?text=Mock+Spot+B',
    },
    {
      id: 'mock-spot-3',
      name: `${region}の${genre}スポット C (Mock)`,
      address: `${region} 3-3-3`,
      rating: 4.7,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: 'https://via.placeholder.com/300x200?text=Mock+Spot+C',
    },
    {
      id: 'mock-spot-4',
      name: `${region}の${genre}スポット D (Mock)`,
      address: `${region} 4-4-4`,
      rating: 4.0,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: 'https://via.placeholder.com/300x200?text=Mock+Spot+D',
    },
    {
      id: 'mock-spot-5',
      name: `${region}の${genre}スポット E (Mock)`,
      address: `${region} 5-5-5`,
      rating: 4.3,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: 'https://via.placeholder.com/300x200?text=Mock+Spot+E',
    },
  ];
}
