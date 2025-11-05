import { Suspense } from 'react';

import { LoginContent } from '@/features/auth/components/LoginContent';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
