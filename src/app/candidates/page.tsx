import { Suspense } from 'react';

import { CandidatesList } from '@features/candidates/components/CandidatesList';

function CandidatesContent() {
  return <CandidatesList />;
}

export default function CandidatesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">読み込み中...</p>
        </div>
      }
    >
      <CandidatesContent />
    </Suspense>
  );
}
