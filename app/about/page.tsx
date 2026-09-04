'use client';

import React from 'react';
import { Box, Container, Typography, Stack, Button, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function AboutPage() {
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
          <Stack spacing={6}>
            {/* Hero Section */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: '#1a237e' }}>
                About TimeWise HRMS
              </Typography>
              <Typography variant="h6" sx={{ color: '#666', lineHeight: 1.8, maxWidth: '700px', mx: 'auto' }}>
                TimeWise is a modern, comprehensive Human Resource Management System designed to simplify and streamline HR operations for organizations of all sizes.
              </Typography>
            </Box>

            {/* Mission Section */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                Our Mission
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, fontSize: '1.05rem' }}>
                To eliminate HR busywork. We're building TimeWise so HR teams can stop drowning in spreadsheets and start making decisions that grow their business and create better workplaces.
              </Typography>
            </Paper>

            {/* Vision Section */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                Our Vision
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, fontSize: '1.05rem' }}>
                Every organization—from startups to enterprises—should have access to world-class HR technology. TimeWise levels the playing field, giving every company the tools to manage people like the best companies do.
              </Typography>
            </Paper>

            {/* Core Values Section */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#2196f3' }}>
                Core Values
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                    Innovation
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                    We continuously invest in technology to deliver cutting-edge HR solutions that anticipate and exceed customer needs.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                    Reliability
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                    Our platform is built on enterprise-grade infrastructure with 99.9% uptime guarantee and robust security measures.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                    Customer Success
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                    Your success is our success. We provide comprehensive support, training, and resources to ensure you get the most from TimeWise.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                    Integrity
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                    We maintain the highest standards of data privacy, security, and ethical business practices.
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Features Overview */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#2196f3' }}>
                What We Offer
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, mb: 2 }}>
                TimeWise provides a comprehensive suite of HR management tools including:
              </Typography>
              <Stack component="ul" sx={{ pl: 3, color: '#666', lineHeight: 1.8 }}>
                <Typography component="li" variant="body2">Employee management and organizational structure</Typography>
                <Typography component="li" variant="body2">Advanced leave management with multi-tier approvals</Typography>
                <Typography component="li" variant="body2">Attendance tracking and analytics</Typography>
                <Typography component="li" variant="body2">Comprehensive reporting and analytics dashboards</Typography>
                <Typography component="li" variant="body2">Customizable approval workflows</Typography>
                <Typography component="li" variant="body2">Enterprise-grade security and compliance</Typography>
              </Stack>
            </Paper>

            {/* CTA Section */}
            <Box sx={{ textAlign: 'center', pt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/signin')}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
              >
                Get Started with TimeWise
              </Button>
            </Box>
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
