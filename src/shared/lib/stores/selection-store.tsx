'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface SelectionStoreState {
  selectedSpotIds: string[];
  maxSelection: number;
  add: (spotId: string) => void;
  remove: (spotId: string) => void;
  toggle: (spotId: string) => void;
  reset: () => void;
}

const SelectionStoreContext = createContext<SelectionStoreState | null>(null);

export function SelectionStoreProvider({
  children,
  maxSelection = 5,
}: {
  children: ReactNode;
  maxSelection?: number;
}) {
  const [selectedSpotIds, setSelectedSpotIds] = useState<string[]>([]);

  const add = useCallback(
    (spotId: string) => {
      setSelectedSpotIds((prev) => {
        if (prev.includes(spotId)) return prev;
        if (prev.length >= maxSelection) return prev;
        return [...prev, spotId];
      });
    },
    [maxSelection]
  );

  const remove = useCallback((spotId: string) => {
    setSelectedSpotIds((prev) => prev.filter((id) => id !== spotId));
  }, []);

  const toggle = useCallback(
    (spotId: string) => {
      setSelectedSpotIds((prev) => {
        if (prev.includes(spotId)) {
          return prev.filter((id) => id !== spotId);
        }
        if (prev.length >= maxSelection) {
          return prev;
        }
        return [...prev, spotId];
      });
    },
    [maxSelection]
  );

  const reset = useCallback(() => setSelectedSpotIds([]), []);

  const value = useMemo(
    () => ({ selectedSpotIds, maxSelection, add, remove, toggle, reset }),
    [selectedSpotIds, maxSelection, add, remove, toggle, reset]
  );

  return <SelectionStoreContext.Provider value={value}>{children}</SelectionStoreContext.Provider>;
}

export function useSelectionStore() {
  const context = useContext(SelectionStoreContext);
  if (!context) {
    throw new Error('useSelectionStore must be used within SelectionStoreProvider');
  }
  return context;
}
