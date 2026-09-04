'use client';

import React from 'react';
import { Box, Container, Typography, Stack, Button, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function PrivacyPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      {/* Header Navigation */}
      <Box
        component="nav"
        sx={{
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <Logo width={40} height={40} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                TimeWise
              </Typography>
            </Box>
            <Button variant="contained" onClick={() => router.push('/signin')} sx={{ textTransform: 'none', fontSize: '1rem', px: 3 }}>
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, pt: isMobile ? 10 : 12, pb: 6 }}>
        <Container maxWidth="md">
          <Stack spacing={4}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#1a237e' }}>
                Privacy Policy
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Last updated: September 2024
              </Typography>
            </Box>

            {/* Introduction */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8 }}>
                TimeWise HRMS ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </Typography>
            </Paper>

            {/* Section 1 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                1. Information We Collect
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                    Personal Data You Provide:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                    When you register for an account, we collect information such as your name, email address, phone number, company name, and password. During use of our platform, we may collect additional information about your employees, organizational structure, and HR-related data.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                    Automatically Collected Information:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                    We automatically collect certain information about your device and usage patterns, including IP address, browser type, operating system, referring URLs, and pages visited. This data helps us improve our services.
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Section 2 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                2. How We Use Your Information
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8, mb: 2 }}>
                We use the information we collect to:
              </Typography>
              <Stack component="ul" sx={{ pl: 3, color: '#666', lineHeight: 1.8 }}>
                <Typography component="li" variant="body2">Provide, operate, and maintain our services</Typography>
                <Typography component="li" variant="body2">Improve, personalize, and expand our services</Typography>
                <Typography component="li" variant="body2">Communicate with you about service updates and support</Typography>
                <Typography component="li" variant="body2">Send promotional communications (with your consent)</Typography>
                <Typography component="li" variant="body2">Prevent fraudulent transactions and enhance security</Typography>
                <Typography component="li" variant="body2">Monitor and analyze usage patterns and trends</Typography>
                <Typography component="li" variant="body2">Comply with legal obligations</Typography>
              </Stack>
            </Paper>

            {/* Section 3 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                3. Data Security
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                We implement comprehensive security measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your data.
              </Typography>
            </Paper>

            {/* Section 4 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                4. Sharing Your Information
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                We do not sell, trade, or rent your personal information to third parties. We may share your information with service providers who assist us in operating our website and conducting our business, subject to strict confidentiality agreements.
              </Typography>
            </Paper>

            {/* Section 5 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                5. Cookies and Tracking Technologies
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                We use cookies and similar technologies to enhance your experience, remember your preferences, and understand how you use our services. You can control cookie settings through your browser.
              </Typography>
            </Paper>

            {/* Section 6 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                6. Your Rights
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8, mb: 2 }}>
                You have the right to:
              </Typography>
              <Stack component="ul" sx={{ pl: 3, color: '#666', lineHeight: 1.8 }}>
                <Typography component="li" variant="body2">Access your personal data</Typography>
                <Typography component="li" variant="body2">Correct inaccurate information</Typography>
                <Typography component="li" variant="body2">Request deletion of your data</Typography>
                <Typography component="li" variant="body2">Opt-out of promotional communications</Typography>
              </Stack>
            </Paper>

            {/* Section 7 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                7. Contact Us
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                If you have questions about this Privacy Policy or our privacy practices, please contact us at privacy@timewise-hrms.com.
              </Typography>
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ backgroundColor: '#1a237e', color: '#fff', py: 4, textAlign: 'center' }}>
        <Typography variant="body2">
          © 2024 TimeWise HRMS. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
