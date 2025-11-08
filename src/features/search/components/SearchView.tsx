'use client';

import { useState } from 'react';

import { ReplaceDialog } from '@shared/components/dialog/ReplaceDialog';
import { MapWithSheet } from '@shared/components/map/MapWithSheet';
import { SelectionBanner } from '@shared/components/selection/SelectionBanner';
import { SpotCard } from '@shared/components/spot/SpotCard';
import { Skeleton } from '@shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';

import { SearchBar } from '@features/search/components/SearchBar';

import { SearchViewProvider, useSearchView } from '../hooks/useSearchView';

function SearchInner() {
  const [imageError, setImageError] = useState(false);
  const {
    region,
    setRegion,
    genre,
    setGenre,
    customGenres,
    addCustomGenre,
    view,
    setView,
    spots,
    loading,
    error,
    pendingSpot,
    setPendingSpot,
    activeSpotId,
    setActiveSpotId,
    selectedSpotIds,
    selectedSpots,
    maxSelection,
    handleSearch,
    handleToggleSpot,
    handleReplace,
    handleProceed,
  } = useSearchView();

  const hasSearched = spots.length > 0 || loading || error !== null;

  return (
    <div className="pb-24">
      <SearchBar
        region={region}
        genre={genre}
        onRegionChange={setRegion}
        onGenreChange={setGenre}
        onSearch={handleSearch}
        customGenres={customGenres}
        onAddCustomGenre={addCustomGenre}
        isValid={Boolean(region && genre)}
      />

      {!hasSearched ? (
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center">
              {imageError ? (
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                  Tier Map
                </h1>
              ) : (
                <img
                  src="/tier-map-icon.png"
                  alt="Tier Map"
                  className="h-32 w-32 rounded-full object-cover sm:h-40 sm:w-40"
                  onError={() => setImageError(true)}
                />
              )}
            </div>
            <p className="mt-4 text-base leading-7 text-gray-600 sm:mt-6 sm:text-lg sm:leading-8">
              地域のスポットをラリー形式で巡り、ティア表で評価するWebアプリ
            </p>

            <div className="mt-10 space-y-6 sm:mt-12">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-left">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">使い方</h2>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">地域とジャンルを選択</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">候補スポットから3〜5件選択</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">ラリーを作成</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      4
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">各スポットを評価</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      5
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        ティア表で結果を確認・友達に共有(SNS等)
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-6">
                <a
                  href="/rallies"
                  className="min-h-[44px] w-full rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-gray-100 sm:w-auto sm:text-sm"
                >
                  ラリー一覧を見る <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="container mx-auto px-4 py-6">
            <Tabs value={view} onValueChange={(value) => setView(value as 'list' | 'map')}>
              <TabsList>
                <TabsTrigger value="list">リスト</TabsTrigger>
                <TabsTrigger value="map">マップ</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="mt-6 space-y-4">
                {loading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-64" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {spots.map((spot) => (
                      <SpotCard
                        key={spot.id}
                        spot={spot}
                        selected={selectedSpotIds.includes(spot.id)}
                        onToggle={handleToggleSpot}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="map" className="mt-6">
                <MapWithSheet
                  spots={spots}
                  selectedSpotId={activeSpotId}
                  onSelectSpot={setActiveSpotId}
                  onAddSpot={handleToggleSpot}
                />
              </TabsContent>
            </Tabs>
          </div>

          <SelectionBanner
            count={selectedSpotIds.length}
            max={maxSelection}
            onProceed={handleProceed}
          />

          {pendingSpot && (
            <ReplaceDialog
              open={Boolean(pendingSpot)}
              onOpenChange={(open) => !open && setPendingSpot(null)}
              currentCandidates={selectedSpots}
              newSpot={pendingSpot}
              onReplace={handleReplace}
            />
          )}
        </>
      )}
    </div>
  );
}

export function SearchView() {
  return (
    <SearchViewProvider>
      <SearchInner />
    </SearchViewProvider>
  );
}
