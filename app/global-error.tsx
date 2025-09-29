'use client';

import { Box, Typography, Button, Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Home as HomeIcon, Refresh as RefreshIcon } from '@mui/icons-material';

export default function GlobalError() {
  const router = useRouter();

  return (
    <html>
      <body>
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center',
              py: 4,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: '6rem',
                fontWeight: 'bold',
                color: 'error.main',
                mb: 2,
              }}
            >
              500
            </Typography>
            
            <Typography variant="h4" gutterBottom>
              Internal Server Error
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Something went wrong on our end. Please try refreshing the page or contact support.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => router.push('/dashboard')}
              >
                Go Home
              </Button>
            </Box>
          </Box>
        </Container>
      </body>
    </html>
  );
}