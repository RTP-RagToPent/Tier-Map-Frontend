'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { ROUTES } from '@shared/constants/routes';
import type { Spot } from '@shared/types/spot';

import { searchSpots } from '../lib/google-places';

export function useCandidates() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const region = searchParams.get('region') || '';
  const genre = searchParams.get('genre') || '';

  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null);
  const [selectedSpots, setSelectedSpots] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (region && genre) {
      searchSpots(region, genre)
        .then((data) => {
          setSpots(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [region, genre]);

  const toggleSpot = (spotId: string) => {
    const newSelected = new Set(selectedSpots);
    if (newSelected.has(spotId)) {
      newSelected.delete(spotId);
    } else {
      if (newSelected.size >= 5) {
        alert('最大5件まで選択できます');
        return;
      }
      newSelected.add(spotId);
    }
    setSelectedSpots(newSelected);
  };

  const handleCreateRally = () => {
    if (selectedSpots.size < 3) {
      alert('3件以上選択してください');
      return;
    }

    const selectedSpotIds = Array.from(selectedSpots).join(',');
    const params = new URLSearchParams({
      region,
      genre,
      spots: selectedSpotIds,
    });

    router.push(`${ROUTES.RALLY_CREATE}?${params.toString()}`);
  };

  return {
    region,
    genre,
    spots,
    loading,
    hoveredSpotId,
    setHoveredSpotId,
    selectedSpots,
    toggleSpot,
    handleCreateRally,
    isValid: selectedSpots.size >= 3 && selectedSpots.size <= 5,
  };
}
