'use client';

import { Box, Container, Paper, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import SignInForm from './SignInForm';
import Logo from '@/components/Logo';

export default function SignInClient() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (session) {
    redirect('/dashboard');
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          pt: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Logo width={64} height={64} />
            <Typography
              component="h1"
              variant="h5"
              sx={{ mt: 2, fontWeight: 'bold' }}
            >
              Sign in to TimeWise HRMS
            </Typography>
          </Box>
          <SignInForm />
        </Paper>
      </Box>
    </Container>
  );
}
