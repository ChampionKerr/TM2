import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Disable static generation for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const session = await getServerSession(authOptions);
  redirect(session ? '/dashboard' : '/signin');
}
