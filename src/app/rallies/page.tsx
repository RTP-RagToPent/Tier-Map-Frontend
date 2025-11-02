"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";

// モックデータ
type RallyStatus = "draft" | "in_progress" | "completed";

interface Rally {
  id: string;
  name: string;
  region: string;
  genre: string;
  spotCount: number;
  status: RallyStatus;
  createdAt: string;
}

const mockRallies: Rally[] = [
  {
    id: "rally-1",
    name: "渋谷区 ラーメンラリー",
    region: "渋谷区",
    genre: "ラーメン",
    spotCount: 5,
    status: "in_progress",
    createdAt: "2025-10-30",
  },
  {
    id: "rally-2",
    name: "新宿区 カフェラリー",
    region: "新宿区",
    genre: "カフェ",
    spotCount: 4,
    status: "draft",
    createdAt: "2025-10-29",
  },
];

const statusLabel = {
  draft: "下書き",
  in_progress: "進行中",
  completed: "完了",
};

export default function RalliesPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ラリー一覧</h1>
        <Link href="/search">
          <Button>新しいラリーを作成</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {mockRallies.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">まだラリーがありません</p>
            <Link href="/search">
              <Button className="mt-4">最初のラリーを作成</Button>
            </Link>
          </div>
        ) : (
          mockRallies.map((rally) => (
            <Link key={rally.id} href={`/rally/${rally.id}`}>
              <Card className="hover:border-blue-400 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{rally.name}</CardTitle>
                      <CardDescription>
                        {rally.region} - {rally.genre} （{rally.spotCount}件）
                      </CardDescription>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        rally.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : rally.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabel[rally.status]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    作成日: {rally.createdAt}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

