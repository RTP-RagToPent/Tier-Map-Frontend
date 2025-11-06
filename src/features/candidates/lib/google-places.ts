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
      console.error('⚠️  Spots API failed:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();

    if (data.spots && data.spots.length > 0) {
      const source = data.source === 'cache' ? '📦 Cache' : '🌐 Google API';
      console.log(`✅ Found ${data.spots.length} spots from ${source}`);
      return data.spots;
    }

    console.warn('⚠️  No spots found');
    return [];
  } catch (error) {
    console.error('Spots search error:', error);
    return [];
  }
}
