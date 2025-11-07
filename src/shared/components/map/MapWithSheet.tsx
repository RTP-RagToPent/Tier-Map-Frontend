'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { LoaderIcon } from 'lucide-react';

import { SpotCard } from '@shared/components/spot/SpotCard';
import { Button } from '@shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/components/ui/sheet';
import type { UISpot } from '@shared/types/ui';

export interface MapWithSheetProps {
  spots: UISpot[];
  selectedSpotId?: string;
  onSelectSpot: (spotId: string) => void;
  onAddSpot: (spot: UISpot) => void;
}

/**
 * Google Mapsを模したスタブコンポーネント。
 * 実プロジェクトでは @react-google-maps/api 等で実装する。
 */
export function MapWithSheet({
  spots,
  selectedSpotId,
  onSelectSpot,
  onAddSpot,
}: MapWithSheetProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  const selectedSpot = useMemo(
    () => spots.find((spot) => spot.id === selectedSpotId),
    [spots, selectedSpotId]
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader(
    useMemo(
      () => ({
        id: 'tier-map-google-map',
        googleMapsApiKey: apiKey ?? '',
      }),
      [apiKey]
    )
  );

  const googleMaps = typeof window !== 'undefined' ? window.google?.maps : undefined;

  const handleMarkerClick = useCallback(
    (spot: UISpot) => {
      onSelectSpot(spot.id);
      setSheetOpen(true);
    },
    [onSelectSpot]
  );

  useEffect(() => {
    if (!mapRef || !isLoaded || spots.length === 0 || !googleMaps) {
      return;
    }

    const bounds = new googleMaps.LatLngBounds();
    spots.forEach((spot) => {
      bounds.extend({ lat: spot.lat, lng: spot.lng });
    });

    mapRef.fitBounds(bounds);
  }, [mapRef, spots, isLoaded, googleMaps]);

  useEffect(() => {
    if (!mapRef || !selectedSpot || typeof window === 'undefined') {
      return;
    }

    mapRef.panTo({ lat: selectedSpot.lat, lng: selectedSpot.lng });
    if ((mapRef.getZoom() ?? 0) < 14) {
      mapRef.setZoom(14);
    }
  }, [mapRef, selectedSpot]);

  const mapCenter = useMemo(() => {
    if (selectedSpot) {
      return { lat: selectedSpot.lat, lng: selectedSpot.lng };
    }

    if (spots.length > 0) {
      const first = spots[0];
      return { lat: first.lat, lng: first.lng };
    }

    return { lat: 35.6803997, lng: 139.7690174 };
  }, [selectedSpot, spots]);

  return (
    <div className="relative h-[50vh] min-h-[280px] w-full overflow-hidden rounded-2xl border bg-muted">
      {!apiKey && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
          <span>環境変数 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` が設定されていません。</span>
          <span>`.env.local` などに API キーを設定してください。</span>
        </div>
      )}

      {apiKey && loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-red-500">
          <span>Google マップの読み込みに失敗しました。</span>
          <span>ネットワーク状態や API キーを確認してください。</span>
        </div>
      )}

      {apiKey && !loadError && !isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderIcon className="size-5 animate-spin" />
          <span>マップを読み込んでいます…</span>
        </div>
      )}

      {apiKey && isLoaded && !loadError && (
        <GoogleMap
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
          }}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={mapCenter}
          onLoad={(map) => setMapRef(map)}
          onUnmount={() => setMapRef(null)}
        >
          {spots.map((spot) => (
            <MarkerF
              key={spot.id}
              position={{ lat: spot.lat, lng: spot.lng }}
              onClick={() => handleMarkerClick(spot)}
              title={spot.name}
              animation={
                selectedSpotId === spot.id && googleMaps ? googleMaps.Animation.DROP : undefined
              }
              icon={
                selectedSpotId === spot.id && googleMaps
                  ? {
                      path: googleMaps.SymbolPath.CIRCLE,
                      fillColor: '#2563eb',
                      fillOpacity: 0.9,
                      strokeColor: '#1d4ed8',
                      strokeWeight: 2,
                      scale: 10,
                    }
                  : undefined
              }
            />
          ))}
        </GoogleMap>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <span className="sr-only">スポット詳細を開く</span>
        </SheetTrigger>
        <SheetContent className="w-full max-w-lg">
          <SheetHeader>
            <SheetTitle>スポット詳細</SheetTitle>
            <SheetDescription>マップ上のピンをタップすると詳細が表示されます。</SheetDescription>
          </SheetHeader>

          {selectedSpot ? (
            <div className="space-y-4">
              <SpotCard
                spot={selectedSpot}
                showMeta
                actionLabel="候補に追加"
                onToggle={() => onAddSpot(selectedSpot)}
              />
              <Button onClick={() => onAddSpot(selectedSpot)} className="w-full" size="lg">
                追加する
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              ピンを選択してください
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
