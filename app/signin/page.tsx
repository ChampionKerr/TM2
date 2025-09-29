import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
// Disable static generation for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import SignInClient from './SignInClient';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  }

  return <SignInClient />;
}
