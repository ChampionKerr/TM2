'use client';

import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  BarChart as BarChartIcon,
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarMonthIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Logo from './Logo';

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        <Icon
          sx={{
            fontSize: 48,
            color: 'primary.main',
            mb: 2,
          }}
        />
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, mb: 1 }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: PeopleIcon,
      title: 'Employee Management',
      description: 'Manage employee records, profiles, and organizational structure efficiently.',
    },
    {
      icon: AccessTimeIcon,
      title: 'Leave Management',
      description: 'Track leave requests, approvals, and balance with multi-tier workflows.',
    },
    {
      icon: CalendarMonthIcon,
      title: 'Attendance Tracking',
      description: 'Monitor attendance patterns and generate detailed reports.',
    },
    {
      icon: BarChartIcon,
      title: 'Analytics & Reports',
      description: 'Comprehensive dashboards and customizable analytics for data-driven decisions.',
    },
    {
      icon: TrendingUpIcon,
      title: 'Payroll Export',
      description: 'Export payroll data and leave summaries with a single click.',
    },
    {
      icon: CheckCircleIcon,
      title: 'Approval Workflows',
      description: 'Multi-tier approval workflows for leave, overtime, and administrative tasks.',
    },
  ];

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Navigation Bar */}
      <Box
        component="nav"
        sx={{
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Logo width={40} height={40} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  letterSpacing: 0.5,
                }}
              >
                TimeWise
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => router.push('/signin')}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                px: 3,
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
          py: isMobile ? 6 : 10,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    lineHeight: 1.2,
                  }}
                >
                  Manage Your Workforce with TimeWise
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  A comprehensive Human Resource Management System designed to streamline employee management, leave tracking, and payroll operations.
                </Typography>
                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/signin')}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '300px',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    backgroundColor: 'primary.main',
                    borderRadius: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Logo width={120} height={120} color="#fff" />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: isMobile ? 6 : 10, backgroundColor: '#fff' }}>
        <Container maxWidth="lg">
          <Stack spacing={4} sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                textAlign: 'center',
                color: 'text.primary',
              }}
            >
              Powerful Features
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Everything you need to manage your workforce efficiently and effectively
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box
        sx={{
          py: isMobile ? 6 : 10,
          backgroundColor: '#f5f5f5',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4} sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                textAlign: 'center',
                color: 'text.primary',
              }}
            >
              Why Choose TimeWise?
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            {[
              {
                title: 'Streamlined Operations',
                description: 'Automate routine tasks and reduce administrative overhead.',
              },
              {
                title: 'Better Insights',
                description: 'Make informed decisions with comprehensive analytics and reports.',
              },
              {
                title: 'Improved Compliance',
                description: 'Maintain accurate records and audit trails for regulatory compliance.',
              },
              {
                title: 'Employee Self-Service',
                description: 'Empower employees to manage their own requests and information.',
              },
              {
                title: 'Scalability',
                description: 'Grow your organization without worrying about system limitations.',
              },
              {
                title: '24/7 Availability',
                description: 'Access your data anytime, anywhere with our cloud-based platform.',
              },
            ].map((benefit, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <CheckCircleIcon
                    sx={{
                      color: 'primary.main',
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {benefit.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: isMobile ? 6 : 10,
          backgroundColor: 'primary.main',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
              }}
            >
              Ready to Transform Your HR Operations?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.1rem',
                opacity: 0.95,
              }}
            >
              Join hundreds of organizations using TimeWise to streamline their HR processes.
            </Typography>
            <Box sx={{ pt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/signin')}
                sx={{
                  backgroundColor: '#fff',
                  color: 'primary.main',
                  fontWeight: 600,
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                Get Started Now
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          px: 2,
          backgroundColor: '#1a1a1a',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  TimeWise
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Modern HRMS for the future of work
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Product
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Features
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Pricing
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Company
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  About
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Contact
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Legal
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Privacy
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Terms
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Box
            sx={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              pt: 3,
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © {new Date().getFullYear()} TimeWise HRMS. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
