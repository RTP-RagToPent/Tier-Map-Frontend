import { Suspense } from 'react';

import { SearchForm } from '@features/search/components/SearchForm';

function SearchContent() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 sm:py-12">
      <SearchForm />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">読み込み中...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
