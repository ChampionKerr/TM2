'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Grid,
  Button,
  ButtonGroup,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import LeaveRequestsList from '@/components/LeaveRequestsList';
import { StatsCard } from '@/components/shared/StatsCard';
import { ActivityFeed } from '@/components/shared/ActivityFeed';
import { ROLE_THEMES, DASHBOARD_LAYOUT } from '@/lib/theme-tokens';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface AdminDashboardData {
  overview: RequestStats & {
    totalUsers: number;
  };
  trends: {
    requests: {
      value: number;
      direction: 'up' | 'down' | 'neutral';
    };
  };
  recentActivity: any[];
  departmentStats: Array<{
    department: string;
    count: number;
  }>;
  monthlyStats: any[];
}

interface AdminFilters {
  department: string;
  dateRange: {
    start: string;
    end: string;
  };
  status: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<AdminFilters>({
    department: 'all',
    dateRange: { start: '', end: '' },
    status: 'all'
  });

  const theme = ROLE_THEMES.admin;
  const layout = DASHBOARD_LAYOUT.admin;

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user || (session.user as any)?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch('/api/analytics/dashboard');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (session?.user && (session.user as any)?.role === 'admin') {
      fetchDashboardData();
    }
  }, [session, refreshKey]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRequestUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!session?.user || (session.user as any)?.role !== 'admin') {
    return (
      <Alert severity="error">
        Access denied. This page is for administrators only.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Admin Header */}
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
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <AnalyticsIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Admin Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage leave requests and system overview
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Navigation Links */}
      <Box sx={{ mb: 3 }}>
        <ButtonGroup variant="outlined" size="small">
          <Button
            startIcon={<DashboardIcon />}
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </Button>
          <Button
            startIcon={<PeopleIcon />}
            onClick={() => router.push('/employees')}
          >
            Employees
          </Button>
          <Button
            startIcon={<AssignmentIcon />}
            onClick={() => router.push('/requests')}
          >
            Requests
          </Button>
        </ButtonGroup>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Total Users"
            value={dashboardData?.overview.totalUsers || 0}
            loading={statsLoading}
            color="primary"
            compact={true}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Total Requests"
            value={dashboardData?.overview.total || 0}
            loading={statsLoading}
            color="default"
            compact={true}
            trend={dashboardData?.trends.requests}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Pending Review"
            value={dashboardData?.overview.pending || 0}
            loading={statsLoading}
            color="warning"
            compact={true}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Approved"
            value={dashboardData?.overview.approved || 0}
            loading={statsLoading}
            color="success"
            compact={true}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Rejected"
            value={dashboardData?.overview.rejected || 0}
            loading={statsLoading}
            color="error"
            compact={true}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Advanced Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterIcon color="primary" />
              <Typography variant="h6">
                Advanced Filters
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department}
                    label="Department"
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    {dashboardData?.departmentStats?.map((dept) => (
                      <MenuItem key={dept.department} value={dept.department}>
                        {dept.department} ({dept.count})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Date"
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Date"
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                size="small"
              >
                Export Data
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setFilters({ department: 'all', dateRange: { start: '', end: '' }, status: 'all' })}
              >
                Clear Filters
              </Button>
            </Box>
          </Paper>

          {/* Requests Table */}
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="leave requests tabs">
                <Tab label={`Pending Review (${dashboardData?.overview.pending || 0})`} />
                <Tab label="All Requests" />
                <Tab label="Approved" />
                <Tab label="Rejected" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <LeaveRequestsList
                showActions={true}
                onRequestUpdate={handleRequestUpdate}
                statusFilter="Pending"
                enablePagination={true}
                defaultPageSize={10}
                key={`pending-${refreshKey}`}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <LeaveRequestsList
                showActions={true}
                onRequestUpdate={handleRequestUpdate}
                statusFilter="all"
                enablePagination={true}
                defaultPageSize={10}
                key={`all-${refreshKey}`}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <LeaveRequestsList
                showActions={true}
                onRequestUpdate={handleRequestUpdate}
                statusFilter="Approved"
                enablePagination={true}
                defaultPageSize={10}
                key={`approved-${refreshKey}`}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <LeaveRequestsList
                showActions={true}
                onRequestUpdate={handleRequestUpdate}
                statusFilter="Rejected"
                enablePagination={true}
                defaultPageSize={10}
                key={`rejected-${refreshKey}`}
              />
            </TabPanel>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Department Statistics */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Department Overview
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dashboardData?.departmentStats?.map((dept) => (
                    <Box key={dept.department} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {dept.department}
                      </Typography>
                      <Chip 
                        label={dept.count} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <ActivityFeed 
                activities={dashboardData?.recentActivity || []}
                maxItems={8}
                compact={false}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}