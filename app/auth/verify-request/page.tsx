import { Suspense } from 'react';
import { Container, Box, Paper, Typography, Alert } from '@mui/material';
import { Email as EmailIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import Logo from '@/components/Logo';

export default function VerifyRequestPage() {
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
            textAlign: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Logo width={64} height={64} />
            <Typography
              component="h1"
              variant="h5"
              sx={{ mt: 2, fontWeight: 'bold' }}
            >
              Check your email
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <EmailIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          </Box>

          <Alert 
            severity="success" 
            icon={<CheckIcon />}
            sx={{ mb: 3, width: '100%' }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              Magic link sent successfully!
            </Typography>
          </Alert>

          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            We sent you a secure sign-in link. Click the link in the email to access your TimeWise HRMS account.
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            The link will expire in 24 hours for security reasons.
          </Typography>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              💡 <strong>Tip:</strong> Check your spam folder if you don't see the email.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              🔒 This is a secure, passwordless sign-in method - no password required!
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
            Didn't receive the email?{' '}
            <a 
              href="/signin" 
              style={{ 
                color: '#1976d2', 
                textDecoration: 'none',
                fontWeight: 'medium'
              }}
            >
              Try again
            </a>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}