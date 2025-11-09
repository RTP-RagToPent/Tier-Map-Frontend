'use client';

import { useCallback, useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { SelectionStoreProvider, useSelectionStore } from '@shared/lib/stores/selection-store';
import { Spot } from '@shared/types/spot';
import type { UISpot } from '@shared/types/ui';

import { searchSpots } from '@features/candidates/lib/google-places';

interface UseSearchViewResult {
  region: string;
  setRegion: (value: string) => void;
  genre: string;
  setGenre: (value: string) => void;
  customGenres: string[];
  addCustomGenre: (genre: string) => void;
  view: 'list' | 'map';
  setView: (value: 'list' | 'map') => void;
  spots: UISpot[];
  loading: boolean;
  error: string | null;
  pendingSpot: UISpot | null;
  setPendingSpot: (spot: UISpot | null) => void;
  activeSpotId: string | undefined;
  setActiveSpotId: (value: string | undefined) => void;
  selectedSpotIds: string[];
  selectedSpots: UISpot[];
  maxSelection: number;
  handleSearch: () => Promise<void>;
  handleToggleSpot: (spot: UISpot) => void;
  handleReplace: (index: number) => void;
  handleProceed: () => void;
}

export function useSearchView(): UseSearchViewResult {
  const router = useRouter();
  const params = useSearchParams();
  const initialRegion = params.get('region') ?? '';
  const initialGenre = params.get('genre') ?? '';

  const { selectedSpotIds, add, remove, maxSelection } = useSelectionStore();

  const [region, setRegion] = useState(initialRegion);
  const [genre, setGenre] = useState(initialGenre);
  const [customGenres, setCustomGenres] = useState<string[]>([]);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [spots, setSpots] = useState<UISpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSpot, setPendingSpot] = useState<UISpot | null>(null);
  const [activeSpotId, setActiveSpotId] = useState<string | undefined>(undefined);

  const selectedSpots = useMemo(
    () => spots.filter((spot) => selectedSpotIds.includes(spot.id)),
    [spots, selectedSpotIds]
  );

  const handleSearch = useCallback(async () => {
    if (!region || !genre) return;
    setLoading(true);
    setError(null);
    try {
      const result = await searchSpots(region, genre);
      if (result.error) {
        setError(result.error);
      }
      const enriched: UISpot[] = result.spots.map((spot, index) => ({
        ...spot,
        priceRange: ['¥', '¥¥', '¥¥¥'][index % 3] as UISpot['priceRange'],
        thumbnailUrl: spot.photoUrl,
        isOpen: index % 2 === 0,
      }));
      setSpots(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スポットの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [region, genre]);

  const handleToggleSpot = useCallback(
    (spot: UISpot) => {
      const isSelected = selectedSpotIds.includes(spot.id);
      if (isSelected) {
        remove(spot.id);
        return;
      }
      if (selectedSpotIds.length >= maxSelection) {
        setPendingSpot(spot);
        return;
      }
      add(spot.id);
    },
    [add, remove, maxSelection, selectedSpotIds]
  );

  const handleReplace = useCallback(
    (index: number) => {
      if (!pendingSpot) return;
      const targetId = selectedSpotIds[index];
      remove(targetId);
      add(pendingSpot.id);
      setPendingSpot(null);
    },
    [add, remove, pendingSpot, selectedSpotIds]
  );

  const handleProceed = useCallback(() => {
    // 選択されたスポット情報をセッションストレージに保存
    const selectedSpotsData: Spot[] = selectedSpots.map((spot) => ({
      id: spot.id,
      name: spot.name,
      address: spot.address || '',
      lat: spot.lat,
      lng: spot.lng,
      rating: spot.rating,
      photoUrl: spot.thumbnailUrl || spot.photoUrl,
    }));

    try {
      sessionStorage.setItem('selectedSpots', JSON.stringify(selectedSpotsData));
    } catch (error) {
      console.error('Failed to save selected spots to sessionStorage:', error);
    }

    const query = new URLSearchParams({ region, genre, spots: selectedSpotIds.join(',') });
    router.push(`/candidates?${query.toString()}`);
  }, [genre, region, router, selectedSpotIds, selectedSpots]);

  const addCustomGenre = useCallback((newGenre: string) => {
    setCustomGenres((prev) => {
      if (prev.includes(newGenre)) {
        return prev;
      }
      return [...prev, newGenre];
    });
    // カスタムジャンルを追加したら、それを選択状態にする
    setGenre(newGenre);
  }, []);

  return {
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
  };
}

export function SearchViewProvider({ children }: { children: React.ReactNode }) {
  return <SelectionStoreProvider maxSelection={5}>{children}</SelectionStoreProvider>;
}
