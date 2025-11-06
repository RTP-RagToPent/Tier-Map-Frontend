'use client';

import { Button } from '@shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';

import { useCandidates } from '../hooks/useCandidates';

import { SpotMap } from './SpotMap';

export function CandidatesList() {
  const {
    region,
    genre,
    spots,
    loading,
    error,
    hoveredSpotId,
    setHoveredSpotId,
    selectedSpots,
    toggleSpot,
    handleCreateRally,
    isValid,
  } = useCandidates();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* タイトル部分（モバイルではスクロールで上に消える） */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">
          {region} - {genre}
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          候補から3〜5件選択してラリーを作成します
        </p>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                {error.includes('REQUEST_DENIED') && (
                  <div className="mt-2">
                    <p className="font-semibold">解決方法:</p>
                    {error.includes('referer restrictions') ? (
                      <div className="mt-2 space-y-2">
                        <p className="font-semibold text-red-800">
                          HTTPリファラー制限が設定されたAPIキーはサーバーサイドで使用できません
                        </p>
                        <div className="rounded bg-yellow-50 p-3 text-xs">
                          <p className="font-semibold mb-1">推奨される解決方法:</p>
                          <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Google Cloud Consoleで新しいAPIキーを作成（サーバーサイド用）</li>
                            <li>
                              サーバーサイド用APIキーには制限を設定しないか、IPアドレス制限を設定
                            </li>
                            <li>
                              クライアントサイド用APIキー（地図表示用）にはHTTPリファラー制限を設定
                            </li>
                            <li>
                              <code className="bg-gray-100 px-1 rounded">.env.local</code>{' '}
                              に以下を設定:
                              <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                                {`# サーバーサイド用（Geocoding API、Places API用）
GOOGLE_MAPS_API_KEY_SERVER=サーバーサイド用のAPIキー

# クライアントサイド用（Maps JavaScript API用）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=クライアントサイド用のAPIキー`}
                              </pre>
                            </li>
                            <li>開発サーバーを再起動</li>
                          </ol>
                        </div>
                      </div>
                    ) : (
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Google Maps APIキーが正しく設定されているか確認</li>
                        <li>Geocoding APIまたはPlaces APIが有効化されているか確認</li>
                        <li>APIキーの制限設定を確認（IPアドレス制限または制限なし）</li>
                        <li>開発サーバーを再起動して環境変数を読み込み直す</li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-6">
        {/* 地図（モバイルではヘッダーの下に固定） */}
        <div className="sticky top-16 z-10 mb-4 shrink-0 lg:sticky lg:top-4 lg:h-[600px] lg:mb-0">
          <Card className="h-[calc(50vh-4rem)] min-h-[250px] sm:h-[400px] lg:h-full">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">地図</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)] p-3 sm:h-[calc(100%-5rem)] sm:p-6">
              <SpotMap spots={spots} hoveredSpotId={hoveredSpotId} />
            </CardContent>
          </Card>
        </div>

        {/* スポット一覧（モバイルではスクロール可能） */}
        <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              候補スポット ({spots.length}件)
            </h2>
            <span className="text-xs text-gray-600 sm:text-sm">選択中: {selectedSpots.size}/5</span>
          </div>

          <div className="flex flex-col space-y-3 sm:space-y-4">
            {spots.map((spot) => (
              <Card
                key={spot.id}
                className={`min-h-[44px] cursor-pointer transition-all active:scale-[0.98] ${
                  selectedSpots.has(spot.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:border-gray-400'
                }`}
                onMouseEnter={() => setHoveredSpotId(spot.id)}
                onMouseLeave={() => setHoveredSpotId(null)}
                onClick={() => toggleSpot(spot.id)}
              >
                <CardHeader className="p-3 sm:p-6 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg">{spot.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{spot.address}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {spot.rating && (
                        <span className="text-xs text-gray-600 sm:text-sm">⭐ {spot.rating}</span>
                      )}
                    </div>
                    {selectedSpots.has(spot.id) && (
                      <span className="text-xs font-semibold text-blue-600 sm:text-sm">選択中</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="sticky bottom-0 bg-white pb-4 pt-2 lg:static lg:bg-transparent lg:pb-0 lg:pt-0">
            <Button onClick={handleCreateRally} disabled={!isValid} className="w-full">
              選択したスポットでラリーを作成 ({selectedSpots.size}件)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
