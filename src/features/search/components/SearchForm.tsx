'use client';

import { Button } from '@shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';

import { GENRES } from '../constants/genres';
import { useSearchForm } from '../hooks/useSearchForm';

export function SearchForm() {
  const { formData, handleRegionChange, handleGenreChange, handleSearch, isValid } =
    useSearchForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>スポットを探す</CardTitle>
        <CardDescription>地域とジャンルを選択して、おすすめのスポットを検索します</CardDescription>
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
            value={formData.region}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="text-base sm:text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="genre" className="text-sm font-medium text-gray-700">
            ジャンル
          </label>
          <Select value={formData.genre} onValueChange={handleGenreChange}>
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

        <Button onClick={handleSearch} className="w-full" disabled={!isValid}>
          探す
        </Button>
      </CardContent>
    </Card>
  );
}
