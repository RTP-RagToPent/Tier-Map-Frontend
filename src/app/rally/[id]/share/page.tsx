"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { tierColors } from "@features/tier/lib/tier-calculator";
import { useRallyShare } from "@features/rally/hooks/useRallyShare";

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const rallyId = params.id as string;

  const {
    shareData,
    loading,
    copied,
    shareUrl,
    shareText,
    handleCopyLink,
    handleShareLine,
    handleShareTwitter,
    handleDownloadImage,
  } = useRallyShare(rallyId);

  if (loading || !shareData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  const { rally, spots, averageRating } = shareData;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{rally.name}</CardTitle>
          <CardDescription>
            ラリーを完走しました！結果をシェアしましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ティアサマリー */}
          <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">平均評価</p>
              <p className="text-4xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500">/ 5.0</p>
            </div>

            <div className="mt-6 space-y-2">
              {spots.map((spot) => (
                <div
                  key={spot.id}
                  className={`flex items-center justify-between rounded-md p-3 ${tierColors[spot.tier]}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{spot.tier}</span>
                    <span className="font-medium">{spot.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < spot.rating ? "text-yellow-500" : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* シェア用テキストプレビュー */}
          <div>
            <h3 className="mb-2 font-semibold text-gray-700">
              シェアテキスト
            </h3>
            <div className="whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-700">
              {shareText}
              {"\n"}
              {shareUrl}
            </div>
          </div>

          {/* シェアボタン */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">シェア方法</h3>

            {/* LINE */}
            <Button
              onClick={handleShareLine}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.771.039 1.09l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINEでシェア
            </Button>

            {/* Twitter/X */}
            <Button
              onClick={handleShareTwitter}
              className="w-full bg-black hover:bg-gray-800"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Xでシェア
            </Button>

            {/* URLコピー */}
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full"
            >
              {copied ? "✓ コピーしました！" : "URLをコピー"}
            </Button>

            {/* 画像ダウンロード（未実装） */}
            <Button
              onClick={handleDownloadImage}
              variant="outline"
              className="w-full"
              disabled
            >
              画像として保存（実装予定）
            </Button>
          </div>

          {/* 戻るボタン */}
          <Button
            onClick={() => router.push(`/rally/${rallyId}/tier`)}
            variant="outline"
            className="w-full"
          >
            ティア表に戻る
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
