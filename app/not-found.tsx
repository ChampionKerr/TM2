'use client';

import { Box, Typography, Button, Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Home as HomeIcon, ArrowBack as BackIcon } from '@mui/icons-material';

export default function NotFound() {
  const router = useRouter();

  return (
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
            color: 'primary.main',
            mb: 2,
          }}
        >
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sorry, the page you are looking for doesn&apos;t exist or has been moved.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => router.push('/dashboard')}
          >
            Go Home
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
}