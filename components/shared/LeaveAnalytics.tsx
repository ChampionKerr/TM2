// Enhanced Leave Analytics Dashboard with Admin Support
'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Tab,
  Tabs,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  TrendingUp,
  CalendarToday,
  Event,
  BarChart,
  CheckCircle,
  Schedule,
  Warning,
  Info,
  CalendarMonth,
  Analytics,
  Business,
  Group,
  Assessment
} from '@mui/icons-material'

interface LeaveStats {
  totalDaysUsed: number
  totalDaysAvailable: number
  annualUsed: number
  annualAvailable: number
  sickUsed: number
  sickAvailable: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
}

interface AdminAnalytics {
  overview: {
    totalEmployees: number
    totalRequests: number
    yearRequests: number
    pendingRequests: number
    approvedRequests: number
    rejectedRequests: number
    approvalRate: number
    avgProcessingTime: string
    upcomingLeaves: number
  }
  trends: {
    monthlyRequests: Array<{ month: string; requests: number }>
    departmentUsage: Array<{ department: string; requests: number; totalDays: number }>
    leaveTypeDistribution: Array<{ type: string; requests: number; totalDays: number }>
  }
  insights: {
    peakMonth: string
    mostActiveDepartment: string
    averageDaysPerRequest: number
  }
}

interface LeaveHistory {
  id: string
  type: string
  startDate: string
  endDate: string
  days: number
  status: 'Approved' | 'Pending' | 'Rejected'
  reason?: string
}

interface LeaveAnalyticsProps {
  userId?: string
  employeeName?: string
}

export function LeaveAnalytics({ userId, employeeName = 'Employee' }: LeaveAnalyticsProps) {
  const { data: session } = useSession() as { data: Session | null }
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [stats, setStats] = useState<LeaveStats>({
    totalDaysUsed: 0,
    totalDaysAvailable: 30,
    annualUsed: 0,
    annualAvailable: 20,
    sickUsed: 0,
    sickAvailable: 10,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  })
  const [adminData, setAdminData] = useState<AdminAnalytics | null>(null)
  const [recentHistory, setRecentHistory] = useState<LeaveHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = session?.user?.role === 'admin'

  useEffect(() => {
    fetchLeaveData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAdmin])

  const fetchLeaveData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isAdmin) {
        // Fetch admin analytics
        const adminResponse = await fetch('/api/analytics/admin')
        if (adminResponse.ok) {
          const adminAnalytics = await adminResponse.json()
          setAdminData(adminAnalytics)
        } else if (adminResponse.status === 403) {
          setError('Admin access required for analytics')
        } else {
          throw new Error('Failed to fetch admin analytics')
        }
      } else {
        // Fetch user analytics (existing logic)
        const response = await fetch(`/api/analytics/leave${userId ? `?userId=${userId}` : ''}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats || stats)
          setRecentHistory(data.history || [])
        }
      }
    } catch (err) {
      console.error('Failed to fetch leave analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    )
  }

  if (isAdmin && adminData) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Assessment color="primary" />
          <Typography variant="h5" fontWeight="bold">
            System Analytics
          </Typography>
        </Box>

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<Analytics />} label="Overview" />
          <Tab icon={<TrendingUp />} label="Trends" />
          <Tab icon={<Business />} label="Departments" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Employees
                    </Typography>
                    <Typography variant="h4">
                      {adminData.overview.totalEmployees}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Requests
                    </Typography>
                    <Typography variant="h4">
                      {adminData.overview.totalRequests}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Approval Rate
                    </Typography>
                    <Typography variant="h4">
                      {adminData.overview.approvalRate}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Pending Requests
                    </Typography>
                    <Typography variant="h4">
                      {adminData.overview.pendingRequests}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Request Trends
            </Typography>
            <Grid container spacing={2}>
              {adminData.trends.monthlyRequests.slice(-6).map((month, index) => (
                <Grid item xs={6} sm={4} md={2} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="textSecondary">
                        {month.month}
                      </Typography>
                      <Typography variant="h6">
                        {month.requests}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Department Usage
            </Typography>
            <Grid container spacing={2}>
              {adminData.trends.departmentUsage.map((dept, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        {dept.department}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {dept.requests} requests • {dept.totalDays} days
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    )
  }

  const utilizationPercentage = (stats.totalDaysUsed / stats.totalDaysAvailable) * 100
  const annualUtilization = (stats.annualUsed / stats.annualAvailable) * 100
  const sickUtilization = (stats.sickUsed / stats.sickAvailable) * 100

  const getUtilizationColor = (percentage: number) => {
    if (percentage < 50) return 'success'
    if (percentage < 80) return 'warning'
    return 'error'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle color="success" />
      case 'Pending': return <Schedule color="warning" />
      case 'Rejected': return <Warning color="error" />
      default: return <Info color="info" />
    }
  }

  const monthlyData = [
    { month: 'Jan', days: 2 },
    { month: 'Feb', days: 1 },
    { month: 'Mar', days: 3 },
    { month: 'Apr', days: 0 },
    { month: 'May', days: 5 },
    { month: 'Jun', days: 2 },
    { month: 'Jul', days: 4 },
    { month: 'Aug', days: 1 },
    { month: 'Sep', days: 0 },
    { month: 'Oct', days: 2 },
    { month: 'Nov', days: 1 },
    { month: 'Dec', days: 0 }
  ]

  const TabPanel = ({ children, value, index }: { children: React.ReactNode, value: number, index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Analytics color="primary" />
        <Typography variant="h6" fontWeight="bold">
          Leave Analytics - {employeeName}
        </Typography>
      </Box>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<TrendingUp />} label="Overview" />
        <Tab icon={<BarChart />} label="Trends" />
        <Tab icon={<Event />} label="History" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {/* Overview Tab */}
        <Grid container spacing={3}>
          {/* Total Utilization */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Leave Utilization
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color={`${getUtilizationColor(utilizationPercentage)}.main`}>
                    {Math.round(utilizationPercentage)}%
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={utilizationPercentage}
                      color={getUtilizationColor(utilizationPercentage)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stats.totalDaysUsed} of {stats.totalDaysAvailable} days used
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Leave Type Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Leave Type Breakdown
                </Typography>
                <Box sx={{ space: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Annual Leave</Typography>
                      <Typography variant="body2">{stats.annualUsed}/{stats.annualAvailable}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={annualUtilization}
                      color="primary"
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Sick Leave</Typography>
                      <Typography variant="body2">{stats.sickUsed}/{stats.sickAvailable}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={sickUtilization}
                      color="success"
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Request Status Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Request Status Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {stats.approvedRequests}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Approved
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Schedule color="warning" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {stats.pendingRequests}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Warning color="error" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {stats.rejectedRequests}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rejected
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Trends Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Leave Usage Trend
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: 200, px: 2 }}>
                  {monthlyData.map((data, _index) => {
                    const maxDays = Math.max(...monthlyData.map(d => d.days))
                    const height = maxDays > 0 ? (data.days / maxDays) * 160 : 0
                    
                    return (
                      <Box key={data.month} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <Box
                          sx={{
                            width: '100%',
                            maxWidth: 40,
                            height: `${height}px`,
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: '4px 4px 0 0',
                            mb: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: theme.palette.primary.dark,
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {data.month}
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {data.days}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Peak Usage Months
                </Typography>
                <List>
                  {monthlyData
                    .sort((a, b) => b.days - a.days)
                    .slice(0, 3)
                    .map((data, index) => (
                      <ListItem key={data.month}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: index === 0 ? 'warning.main' : 'primary.main' }}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={data.month}
                          secondary={`${data.days} days used`}
                        />
                        <Chip
                          label={`${data.days} days`}
                          color={index === 0 ? 'warning' : 'primary'}
                          size="small"
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Usage Recommendations
                </Typography>
                <List>
                  {utilizationPercentage < 50 && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <Info />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Consider Taking More Leave"
                        secondary="You have plenty of leave available. Work-life balance is important!"
                      />
                    </ListItem>
                  )}
                  {utilizationPercentage > 80 && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <Warning />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Plan Remaining Leave Carefully"
                        secondary="You've used most of your allocation. Plan carefully for the rest of the year."
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <CheckCircle />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Plan Ahead"
                      secondary="Submit requests early to ensure approval and better planning."
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* History Tab */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Leave History
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CalendarMonth />}
                onClick={() => window.open('/requests', '_blank')}
              >
                View All
              </Button>
            </Box>
            
            {recentHistory.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Event sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No leave history found
                </Typography>
              </Box>
            ) : (
              <List>
                {recentHistory.map((leave, index) => (
                  <React.Fragment key={leave.id}>
                    <ListItem>
                      <ListItemAvatar>
                        {getStatusIcon(leave.status)}
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {leave.type} Leave
                            </Typography>
                            <Chip
                              label={leave.status}
                              size="small"
                              color={
                                leave.status === 'Approved' ? 'success' :
                                leave.status === 'Pending' ? 'warning' : 'error'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(leave.startDate).toLocaleDateString()} - {' '}
                              {new Date(leave.endDate).toLocaleDateString()} ({leave.days} days)
                            </Typography>
                            {leave.reason && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {leave.reason}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentHistory.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Paper>
  )
}