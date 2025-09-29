'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Typography, Box, Snackbar, Alert, Paper, Grid, CircularProgress } from '@mui/material';
import LeaveRequestForm from '@/components/LeaveRequestForm';
import LeaveRequestsList from '@/components/LeaveRequestsList';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface LeaveRequestData {
  type: 'Annual' | 'Sick' | 'Unpaid' | 'Other';
  startDate: string;
  endDate: string;
  reason?: string;
}

export default function RequestsPage() {
  const { data: session, status } = useSession() as { data: Session | null; status: 'loading' | 'authenticated' | 'unauthenticated' };
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  // Show loading while session is loading
  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  // Don't render if not authenticated or no session
  if (status === 'unauthenticated' || !session?.user) {
    return null;
  }

  const handleSubmit = async (data: LeaveRequestData) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // The data is already properly formatted by the form
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      setShowSuccess(true);
      setRefreshKey(prev => prev + 1); // Trigger refresh of requests list
      router.refresh();
      
      // Wait for the success message to be shown before redirecting
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      throw error;
    }
  };

  const handleCloseSnackbar = () => {
    setShowSuccess(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Leave Requests
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Submit New Request
            </Typography>
            <LeaveRequestForm onSubmit={handleSubmit} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Leave Requests
            </Typography>
            <ErrorBoundary>
              {session?.user?.id ? (
                <LeaveRequestsList 
                  userId={session.user.id} 
                  enablePagination={true}
                  defaultPageSize={8}
                  key={refreshKey}
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Unable to load requests. Please try refreshing the page.
                  </Typography>
                </Box>
              )}
            </ErrorBoundary>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Leave request submitted successfully! Redirecting to dashboard...
        </Alert>
      </Snackbar>
    </Box>
  );
}
