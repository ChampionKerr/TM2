'use client';

import React from 'react';
import { Box, Container, Typography, Stack, Button, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function TermsPage() {
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
                Terms of Service
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Last updated: September 2024
              </Typography>
            </Box>

            {/* Introduction */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8 }}>
                These Terms of Service ("Terms") govern your access to and use of TimeWise HRMS ("Service"). By accessing or using TimeWise, you agree to be bound by these Terms. If you disagree with any part of these Terms, then you may not use the Service.
              </Typography>
            </Paper>

            {/* Section 1 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                1. License and Use
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                TimeWise grants you a limited, non-exclusive, non-transferable license to access and use the Service for your internal business purposes. You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service without express written permission.
              </Typography>
            </Paper>

            {/* Section 2 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                2. User Responsibilities
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8, mb: 2 }}>
                You agree to:
              </Typography>
              <Stack component="ul" sx={{ pl: 3, color: '#666', lineHeight: 1.8 }}>
                <Typography component="li" variant="body2">Maintain the confidentiality of your account credentials</Typography>
                <Typography component="li" variant="body2">Accept responsibility for all activities under your account</Typography>
                <Typography component="li" variant="body2">Comply with all applicable laws and regulations</Typography>
                <Typography component="li" variant="body2">Not engage in unauthorized access or data collection</Typography>
                <Typography component="li" variant="body2">Not transmit malware or harmful code</Typography>
                <Typography component="li" variant="body2">Report security breaches immediately</Typography>
              </Stack>
            </Paper>

            {/* Section 3 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                3. Intellectual Property Rights
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                All content, features, and functionality of TimeWise, including but not limited to software, text, graphics, and logos, are owned by TimeWise, its licensors, or other providers of such material. Your use of the Service does not grant you ownership of any intellectual property rights.
              </Typography>
            </Paper>

            {/* Section 4 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                4. Limitation of Liability
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                To the fullest extent permitted by law, TimeWise shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service, even if advised of the possibility of such damages.
              </Typography>
            </Paper>

            {/* Section 5 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                5. Disclaimer of Warranties
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                TimeWise provides the Service on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the Service, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </Typography>
            </Paper>

            {/* Section 6 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                6. Termination
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                TimeWise may suspend or terminate your account and access to the Service at any time, with or without notice, if you violate these Terms or engage in conduct that TimeWise believes is harmful or unlawful.
              </Typography>
            </Paper>

            {/* Section 7 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                7. Modifications to Terms
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                TimeWise reserves the right to modify these Terms at any time. Your continued use of the Service following the posting of modified Terms constitutes your acceptance of those modifications.
              </Typography>
            </Paper>

            {/* Section 8 */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                8. Contact Information
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                If you have questions about these Terms of Service, please contact us at legal@timewise-hrms.com.
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
