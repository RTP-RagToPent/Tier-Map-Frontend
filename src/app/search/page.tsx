"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GENRES = [
  "ラーメン",
  "カフェ",
  "居酒屋",
  "イタリアン",
  "焼肉",
  "寿司",
  "ベーカリー",
  "スイーツ",
];

function SearchContent() {
  const router = useRouter();
  const [region, setRegion] = useState("");
  const [genre, setGenre] = useState("");

  const handleSearch = () => {
    if (!region || !genre) {
      alert("地域とジャンルを両方選択してください");
      return;
    }
    
    // 候補一覧ページへ遷移（クエリパラメータで地域とジャンルを渡す）
    router.push(`/candidates?region=${encodeURIComponent(region)}&genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>スポットを探す</CardTitle>
          <CardDescription>
            地域とジャンルを選択して、おすすめのスポットを検索します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="region" className="text-sm font-medium text-gray-700">
              地域（市区町村）
            </label>
            <Input
              id="region"
              type="text"
              placeholder="例: 渋谷区、新宿区"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="genre" className="text-sm font-medium text-gray-700">
              ジャンル
            </label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger id="genre">
                <SelectValue placeholder="ジャンルを選択" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSearch}
            className="w-full"
            disabled={!region || !genre}
          >
            探す
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

