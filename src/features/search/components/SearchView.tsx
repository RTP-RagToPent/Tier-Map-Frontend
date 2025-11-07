'use client';

import { ReplaceDialog } from '@shared/components/dialog/ReplaceDialog';
import { MapWithSheet } from '@shared/components/map/MapWithSheet';
import { SelectionBanner } from '@shared/components/selection/SelectionBanner';
import { SpotCard } from '@shared/components/spot/SpotCard';
import { Skeleton } from '@shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';

import { SearchBar } from '@features/search/components/SearchBar';

import { SearchViewProvider, useSearchView } from '../hooks/useSearchView';

function SearchInner() {
  const {
    region,
    setRegion,
    genre,
    setGenre,
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

  return (
    <div className="pb-24">
      <SearchBar
        region={region}
        genre={genre}
        onRegionChange={setRegion}
        onGenreChange={setGenre}
        onSearch={handleSearch}
        isValid={Boolean(region && genre)}
      />

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
