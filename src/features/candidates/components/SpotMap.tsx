'use client';

import { useMemo } from 'react';

import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

import { Spot } from '@shared/types/spot';

interface SpotMapProps {
  spots: Spot[];
  hoveredSpotId?: string | null;
}

const libraries: 'places'[] = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 35.6812, // 東京駅
  lng: 139.7671,
};

export function SpotMap({ spots, hoveredSpotId }: SpotMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  // 地図の中心を計算（スポットの平均位置、または最初のスポット）
  const center = useMemo(() => {
    if (spots.length === 0) return defaultCenter;

    if (spots.length === 1) {
      return {
        lat: spots[0].lat,
        lng: spots[0].lng,
      };
    }

    // 複数スポットの場合は中心を計算
    const avgLat = spots.reduce((sum, spot) => sum + spot.lat, 0) / spots.length;
    const avgLng = spots.reduce((sum, spot) => sum + spot.lng, 0) / spots.length;

    return { lat: avgLat, lng: avgLng };
  }, [spots]);

  // ズームレベルを計算
  const zoom = useMemo(() => {
    if (spots.length === 0) return 13;
    if (spots.length === 1) return 15;
    return 13;
  }, [spots.length]);

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-200">
        <div className="text-center text-gray-600">
          <p className="text-sm">Google Maps APIキーが設定されていません</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-red-50">
        <div className="text-center text-red-600">
          <p className="text-sm font-semibold">地図の読み込みに失敗しました</p>
          <p className="mt-1 text-xs">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-200">
        <div className="text-center text-gray-600">
          <p className="text-sm">地図を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {spots.map((spot) => {
          // ホバー時のアイコン設定
          const isHovered = hoveredSpotId === spot.id;
          let markerIcon: google.maps.Icon | undefined;
          let markerAnimation: google.maps.Animation | undefined;

          if (typeof window !== 'undefined' && window.google?.maps) {
            if (isHovered) {
              markerIcon = {
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new window.google.maps.Size(40, 40),
              };
              markerAnimation = window.google.maps.Animation.BOUNCE;
            } else {
              markerIcon = {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(32, 32),
              };
            }
          }

          return (
            <Marker
              key={spot.id}
              position={{ lat: spot.lat, lng: spot.lng }}
              title={spot.name}
              animation={markerAnimation}
              icon={markerIcon}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
}
