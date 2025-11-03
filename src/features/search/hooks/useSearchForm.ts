'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@shared/constants/routes';

import type { SearchFormData } from '../types/search';

export function useSearchForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SearchFormData>({
    region: '',
    genre: '',
  });

  const handleRegionChange = (region: string) => {
    setFormData((prev) => ({ ...prev, region }));
  };

  const handleGenreChange = (genre: string) => {
    setFormData((prev) => ({ ...prev, genre }));
  };

  const handleSearch = () => {
    if (!formData.region || !formData.genre) {
      alert('地域とジャンルを両方選択してください');
      return;
    }

    const searchParams = new URLSearchParams({
      region: formData.region,
      genre: formData.genre,
    });

    router.push(`${ROUTES.CANDIDATES}?${searchParams.toString()}`);
  };

  const isValid = Boolean(formData.region && formData.genre);

  return {
    formData,
    handleRegionChange,
    handleGenreChange,
    handleSearch,
    isValid,
  };
}
