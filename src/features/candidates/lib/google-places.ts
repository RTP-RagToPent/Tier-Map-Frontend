import { Spot } from '@shared/types/spot';

/**
 * スポット検索のメイン関数
 * バックエンドAPIを経由してGoogle Places APIを呼び出し
 * キャッシュ機能もバックエンド側で実装
 */
export async function searchSpots(region: string, genre: string): Promise<Spot[]> {
  console.log('🔍 Searching spots:', region, '-', genre);

  try {
    // バックエンドAPI経由でスポット検索
    const response = await fetch(
      `/api/spots?region=${encodeURIComponent(region)}&genre=${encodeURIComponent(genre)}`,
      {
        // キャッシュ戦略: 5分間はブラウザキャッシュを使用
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.warn('⚠️  Spots API failed, returning mock data');
      return getMockSpots(region, genre);
    }

    const data = await response.json();

    if (data.spots && data.spots.length > 0) {
      const source = data.source === 'cache' ? '📦 Cache' : '🌐 Google API';
      console.log(`✅ Found ${data.spots.length} spots from ${source}`);
      return data.spots;
    }

    console.warn('⚠️  No spots found, returning mock data');
    return getMockSpots(region, genre);
  } catch (error) {
    console.error('Spots search error:', error);
    return getMockSpots(region, genre);
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
