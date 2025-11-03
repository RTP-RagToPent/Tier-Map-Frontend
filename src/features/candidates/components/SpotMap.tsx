'use client';

import { useEffect, useRef, useState } from 'react';

import { Spot } from '@shared/types/spot';

interface SpotMapProps {
  spots: Spot[];
  hoveredSpotId?: string | null;
}

export function SpotMap({ spots, hoveredSpotId }: SpotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Google Maps の初期化（実装時は実際のGoogle Maps APIを使用）
    // 現在はプレースホルダーとして簡易的な地図表示
    if (!mapRef.current) return;

    // TODO: Google Maps API統合時にここを実装
    setError('Google Maps APIの統合が必要です（現在はプレースホルダー表示）');
  }, [spots]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={mapRef}
        className="h-full w-full rounded-lg bg-gray-200"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect fill="%23e5e7eb" width="800" height="600"/><text x="400" y="300" font-size="20" text-anchor="middle" fill="%239ca3af">地図エリア</text></svg>')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* スポットのピン（簡易版） */}
        <div className="relative h-full w-full">
          {spots.map((spot, index) => (
            <div
              key={spot.id}
              className={`absolute flex h-8 w-8 items-center justify-center rounded-full ${
                hoveredSpotId === spot.id ? 'bg-blue-600 ring-4 ring-blue-200' : 'bg-red-500'
              } text-xs font-bold text-white shadow-lg transition-all`}
              style={{
                left: `${20 + index * 15}%`,
                top: `${30 + (index % 3) * 20}%`,
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
      {error && (
        <div className="absolute bottom-4 left-4 rounded bg-yellow-100 px-3 py-2 text-xs text-yellow-800">
          {error}
        </div>
      )}
    </div>
  );
}
