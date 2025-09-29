import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your account password'
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}