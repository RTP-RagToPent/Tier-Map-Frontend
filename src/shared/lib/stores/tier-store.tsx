'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Tier, TierBoardState } from '@shared/types/ui';

interface TierStoreState {
  tiers: TierBoardState;
  moveSpot: (spotId: string, fromTier: Tier, toTier: Tier, index?: number) => void;
  setInitial: (state: TierBoardState) => void;
}

const defaultState: TierBoardState = { S: [], A: [], B: [] };

const TierStoreContext = createContext<TierStoreState | null>(null);

export function TierStoreProvider({
  children,
  initialState = defaultState,
}: {
  children: ReactNode;
  initialState?: TierBoardState;
}) {
  const [tiers, setTiers] = useState<TierBoardState>(initialState);

  const moveSpot = useCallback((spotId: string, fromTier: Tier, toTier: Tier, index?: number) => {
    if (fromTier === toTier) return;

    setTiers((prev) => {
      const fromList = prev[fromTier].filter((spot) => spot.id !== spotId);
      const movingSpot = prev[fromTier].find((spot) => spot.id === spotId);
      if (!movingSpot) return prev;

      const toList = [...prev[toTier]];
      const insertIndex = index ?? toList.length;
      toList.splice(insertIndex, 0, movingSpot);

      return {
        ...prev,
        [fromTier]: fromList,
        [toTier]: toList,
      };
    });
  }, []);

  const setInitial = useCallback((state: TierBoardState) => setTiers(state), []);

  const value = useMemo(() => ({ tiers, moveSpot, setInitial }), [tiers, moveSpot, setInitial]);

  return <TierStoreContext.Provider value={value}>{children}</TierStoreContext.Provider>;
}

export function useTierStore() {
  const context = useContext(TierStoreContext);
  if (!context) {
    throw new Error('useTierStore must be used within TierStoreProvider');
  }
  return context;
}
