'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'An error occurred during authentication.';
  if (error === 'CredentialsSignin') {
    errorMessage = 'Invalid email or password. Please try again.';
  } else if (error === 'Configuration') {
    errorMessage = 'There is a problem with the server configuration.';
  } else if (error === 'AccessDenied') {
    errorMessage = 'You do not have permission to access this resource.';
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
          <Typography
            component="h1"
            variant="h5"
            color="error"
            sx={{ mb: 2 }}
          >
            Authentication Error
          </Typography>
          <Typography sx={{ mb: 4, textAlign: 'center' }}>
            {errorMessage}
          </Typography>
          <Button
            component={Link}
            href="/signin"
            variant="contained"
            fullWidth
          >
            Return to Sign In
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
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
            <Typography variant="h5" sx={{ mb: 2 }}>
              Loading...
            </Typography>
          </Paper>
        </Box>
      </Container>
    }>
      <ErrorContent />
    </Suspense>
  );
}
