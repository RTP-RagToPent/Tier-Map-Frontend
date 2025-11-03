"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { useRallies } from "@features/rally/hooks/useRallies";

const statusLabel = {
  draft: "下書き",
  in_progress: "進行中",
  completed: "完了",
};

export default function RalliesPage() {
  const { rallies, loading } = useRallies();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ラリー一覧</h1>
        <Link href="/search">
          <Button>新しいラリーを作成</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {rallies.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">まだラリーがありません</p>
            <p className="mt-2 text-sm text-gray-500">
              新しいラリーを作成してスポット巡りを始めましょう！
            </p>
            <Link href="/search" className="mt-4 inline-block">
              <Button>ラリーを作成</Button>
            </Link>
          </div>
        ) : (
          rallies.map((rally) => (
            <Link key={rally.id} href={`/rally/${rally.id}`}>
              <Card className="transition-all hover:border-gray-400 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{rally.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {rally.genre}
                      </CardDescription>
                    </div>
                    {rally.status && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          rally.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : rally.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusLabel[rally.status]}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{rally.createdAt && `作成日: ${rally.createdAt}`}</span>
                    <span className="font-medium text-blue-600">詳細を見る →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
