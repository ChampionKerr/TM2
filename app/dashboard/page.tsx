'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  Button, 
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import LeaveRequestsList from '@/components/LeaveRequestsList';
import { StatsCard } from '@/components/shared/StatsCard';
import { QuickActions } from '@/components/shared/QuickActions';
import { ActivityFeed } from '@/components/shared/ActivityFeed';
import { MiniCalendar } from '@/components/shared/MiniCalendar';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ROLE_THEMES, DASHBOARD_LAYOUT } from '@/lib/theme-tokens';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

interface DashboardData {
  overview: {
    totalRequests: number;
    thisYearRequests: number;
    pendingRequests: number;
    approvedRequests: number;
  };
  leaveBalance: {
    annual: number;
    sick: number;
    used: { annual: number; sick: number };
  };
  recentActivity: Array<{
    id: string;
    type: 'request_submitted' | 'request_approved' | 'request_rejected' | 'leave_started' | 'leave_ended';
    title: string;
    description: string;
    timestamp: string;
    status?: 'Pending' | 'Approved' | 'Rejected';
    actor?: {
      name: string;
      avatar?: string;
    };
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession() as { data: Session | null, status: 'authenticated' | 'loading' | 'unauthenticated' };
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user) return;
      
      try {
        const response = await fetch('/api/analytics/dashboard');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    router.push('/signin');
    return null;
  }

  const userRole = session.user?.role || 'user';
  const theme = ROLE_THEMES[userRole as keyof typeof ROLE_THEMES];
  const layout = DASHBOARD_LAYOUT[userRole as keyof typeof DASHBOARD_LAYOUT];

  return (
    <Box>
      {/* Welcome Header */}
      <Paper 
        sx={{ 
          background: theme.gradient,
          color: 'white',
          p: layout.header.padding,
          borderRadius: layout.header.borderRadius,
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
            {session.user?.firstName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome back, {session.user?.firstName || 'User'}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={layout.spacing}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Requests"
                value={dashboardData?.overview.totalRequests || 0}
                subtitle="All time"
                loading={loading}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="This Year"
                value={dashboardData?.overview.thisYearRequests || 0}
                subtitle="Current year requests"
                loading={loading}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Pending"
                value={dashboardData?.overview.pendingRequests || 0}
                subtitle="Awaiting approval"
                loading={loading}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Approved"
                value={dashboardData?.overview.approvedRequests || 0}
                subtitle="This year"
                loading={loading}
                color="success"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={layout.spacing}>
            {/* Recent Requests */}
            <Grid item xs={12}>
              <Paper sx={{ p: layout.cards.padding, borderRadius: layout.cards.borderRadius }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon color="primary" />
                    <Typography variant="h6">
                      Recent Leave Requests
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CalendarIcon />}
                    onClick={() => router.push('/requests')}
                  >
                    New Request
                  </Button>
                </Box>
                <ErrorBoundary>
                  <LeaveRequestsList 
                    userId={session.user.id} 
                    enablePagination={true}
                    defaultPageSize={5}
                  />
                </ErrorBoundary>
              </Paper>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <QuickActions role={userRole} />
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={layout.spacing}>
            {/* Leave Balance */}
            <Grid item xs={12}>
              <Paper sx={{ p: layout.cards.padding, borderRadius: layout.cards.borderRadius }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h6">
                    Leave Balance
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Annual Leave
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {(dashboardData?.leaveBalance.annual || 20) - (dashboardData?.leaveBalance.used.annual || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / {dashboardData?.leaveBalance.annual || 20} days
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 8, 
                      bgcolor: 'grey.200', 
                      borderRadius: 1, 
                      mt: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: `${((dashboardData?.leaveBalance.used.annual || 0) / (dashboardData?.leaveBalance.annual || 20)) * 100}%`, 
                        height: '100%', 
                        bgcolor: 'primary.main',
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Sick Leave
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {(dashboardData?.leaveBalance.sick || 14) - (dashboardData?.leaveBalance.used.sick || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / {dashboardData?.leaveBalance.sick || 14} days
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 8, 
                      bgcolor: 'grey.200', 
                      borderRadius: 1, 
                      mt: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: `${((dashboardData?.leaveBalance.used.sick || 0) / (dashboardData?.leaveBalance.sick || 14)) * 100}%`, 
                        height: '100%', 
                        bgcolor: 'success.main',
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Mini Calendar */}
            <Grid item xs={12}>
              <MiniCalendar 
                events={[]} // TODO: Add actual events
                onDateClick={(date) => console.log('Date clicked:', date)}
              />
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <ActivityFeed 
                activities={dashboardData?.recentActivity || []}
                maxItems={5}
                compact={false}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
