'use client';

import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Alert, Paper } from '@mui/material';
import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address');

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      emailSchema.parse(email);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof z.ZodError ? 'Please enter a valid email address' : 
               err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" gutterBottom>
            Reset Password
          </Typography>
          
          {status === 'success' ? (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              If an account exists with this email, you will receive password reset instructions.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
              <Typography sx={{ mb: 3 }}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </Typography>

              {status === 'error' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={status === 'loading'}
                sx={{ mb: 2 }}
              >
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button
                fullWidth
                variant="text"
                href="/signin"
                sx={{ mt: 1 }}
              >
                Back to Sign In
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
