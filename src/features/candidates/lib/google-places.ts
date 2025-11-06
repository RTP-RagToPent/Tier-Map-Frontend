import { Spot } from '@shared/types/spot';

/**
 * スポット検索のメイン関数
 * バックエンドAPIを経由してGoogle Places APIを呼び出し
 * キャッシュ機能もバックエンド側で実装
 */
export interface SearchSpotsResult {
  spots: Spot[];
  error?: string;
}

export async function searchSpots(region: string, genre: string): Promise<SearchSpotsResult> {
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error || `API request failed: ${response.status} ${response.statusText}`;
      console.error('⚠️  Spots API failed:', response.status, errorMessage);
      return { spots: [], error: errorMessage };
    }

    const data = await response.json();

    if (data.error) {
      console.error('⚠️  API returned error:', data.error);
      return { spots: [], error: data.error };
    }

    if (data.spots && data.spots.length > 0) {
      const source = data.source === 'cache' ? '📦 Cache' : '🌐 Google API';
      console.log(`✅ Found ${data.spots.length} spots from ${source}`);
      return { spots: data.spots };
    }

    console.warn('⚠️  No spots found');
    return { spots: [] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Spots search error:', errorMessage);
    return { spots: [], error: errorMessage };
  }
}
