'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ResetPasswordForm = dynamic(() => import('./ResetPasswordForm'), {
  ssr: false
});

interface ResetPasswordClientProps {
  token: string;
}

export default function ResetPasswordClient({ token }: ResetPasswordClientProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm token={token} />
    </Suspense>
  );
}