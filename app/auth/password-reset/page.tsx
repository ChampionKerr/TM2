import { notFound } from 'next/navigation';
import ResetPasswordClient from './ResetPasswordClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your account password'
};

export default function ResetPasswordPage(props: any) {
  const { searchParams } = props;
  if (!searchParams.token || Array.isArray(searchParams.token)) {
    notFound();
  }

  return <ResetPasswordClient token={searchParams.token} />;
}