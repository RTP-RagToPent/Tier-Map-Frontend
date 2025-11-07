'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface EvaluationEntry {
  rating: number;
  memo?: string;
}

interface EvaluationStoreState {
  evaluations: Record<string, EvaluationEntry>;
  setRating: (spotId: string, rating: number) => void;
  setMemo: (spotId: string, memo: string) => void;
  clear: () => void;
}

const EvaluationStoreContext = createContext<EvaluationStoreState | null>(null);

export function EvaluationStoreProvider({ children }: { children: ReactNode }) {
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationEntry>>({});

  const setRating = useCallback((spotId: string, rating: number) => {
    setEvaluations((prev) => ({ ...prev, [spotId]: { ...prev[spotId], rating } }));
  }, []);

  const setMemo = useCallback((spotId: string, memo: string) => {
    setEvaluations((prev) => ({ ...prev, [spotId]: { ...prev[spotId], memo } }));
  }, []);

  const clear = useCallback(() => setEvaluations({}), []);

  const value = useMemo(
    () => ({ evaluations, setRating, setMemo, clear }),
    [evaluations, setRating, setMemo, clear]
  );

  return (
    <EvaluationStoreContext.Provider value={value}>{children}</EvaluationStoreContext.Provider>
  );
}

export function useEvaluationStore() {
  const context = useContext(EvaluationStoreContext);
  if (!context) {
    throw new Error('useEvaluationStore must be used within EvaluationStoreProvider');
  }
  return context;
}
