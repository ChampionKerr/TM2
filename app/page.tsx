import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import LandingPage from '@/components/LandingPage';

// Disable static generation for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  // Otherwise show landing page
  return <LandingPage />;
}
