// Enhanced Quick Actions Widget for Employee Dashboard
'use client'

import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Fab,
  Zoom,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  AddCircle,
  EventAvailable,
  CalendarToday,
  Update,
  History,
  PersonPin,
  Speed,
  Assignment,
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Assessment as ReportIcon,
  AccountBalance as BalanceIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

interface QuickAction {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  action: () => void
  badge?: number | string
  disabled?: boolean
}

interface QuickActionsProps {
  role?: 'admin' | 'user'
  compact?: boolean
  _onNewLeaveRequest?: () => void
  onViewRequests?: () => void
  onUpdateProfile?: () => void
  onViewTeamCalendar?: () => void
  leaveBalance?: {
    annual: number
    sick: number
    total: number
  }
  pendingRequests?: number
  upcomingLeave?: number
}

export function QuickActions({
  role = 'user',
  compact = false,
  _onNewLeaveRequest,
  onViewRequests,
  onUpdateProfile,
  onViewTeamCalendar,
  leaveBalance,
  pendingRequests = 0,
  upcomingLeave = 0
}: QuickActionsProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  const [quickLeaveOpen, setQuickLeaveOpen] = useState(false)
  const [quickLeaveData, setQuickLeaveData] = useState({
    type: 'Annual',
    startDate: '',
    endDate: '',
    reason: ''
  })

  const handleQuickLeaveSubmit = async () => {
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: quickLeaveData.type,
          startDate: quickLeaveData.startDate,
          endDate: quickLeaveData.endDate,
          reason: quickLeaveData.reason
        })
      })

      if (response.ok) {
        setQuickLeaveOpen(false)
        setQuickLeaveData({ type: 'Annual', startDate: '', endDate: '', reason: '' })
        // Refresh data or show success message
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to submit leave request:', error)
    }
  }

  // Enhanced user actions with modern UI
  const enhancedUserActions: QuickAction[] = [
    {
      id: 'new-leave',
      title: 'Request Leave',
      description: 'Submit a new leave request quickly',
      icon: <AddCircle />,
      color: 'primary',
      action: () => setQuickLeaveOpen(true),
      badge: leaveBalance ? `${leaveBalance.annual}` : undefined
    },
    {
      id: 'view-requests',
      title: 'My Requests',
      description: 'View your leave request history',
      icon: <History />,
      color: 'info',
      action: onViewRequests || (() => router.push('/requests')),
      badge: pendingRequests > 0 ? pendingRequests : undefined
    },
    {
      id: 'team-calendar',
      title: 'Team Calendar',
      description: 'Check team availability',
      icon: <CalendarToday />,
      color: 'secondary',
      action: onViewTeamCalendar || (() => router.push('/calendar')),
      badge: upcomingLeave > 0 ? upcomingLeave : undefined
    },
    {
      id: 'update-profile',
      title: 'Update Profile',
      description: 'Manage your information',
      icon: <PersonPin />,
      color: 'success',
      action: onUpdateProfile || (() => router.push('/profile'))
    }
  ]

  // Legacy simple actions for backwards compatibility
  const userActions: QuickAction[] = [
    {
      id: 'new-request',
      title: 'Submit Request',
      icon: <AddIcon />,
      action: () => router.push('/requests'),
      color: 'primary'
    },
    {
      id: 'view-calendar',
      title: 'View Calendar',
      icon: <CalendarIcon />,
      action: () => router.push('/calendar'),
      color: 'info'
    },
    {
      id: 'check-balance',
      title: 'Check Balance',
      icon: <BalanceIcon />,
      action: () => router.push('/balance'),
      color: 'success'
    },
    {
      id: 'download-report',
      title: 'Download Report',
      icon: <ReportIcon />,
      action: () => {
        console.log('Download report clicked')
      },
      color: 'secondary'
    }
  ]

  const adminActions: QuickAction[] = [
    {
      id: 'review-requests',
      title: 'Review Requests',
      icon: <NotificationIcon />,
      action: () => router.push('/admin'),
      color: 'warning'
    },
    {
      id: 'manage-employees',
      title: 'Manage Employees',
      icon: <SettingsIcon />,
      action: () => router.push('/employees'),
      color: 'primary'
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      icon: <ReportIcon />,
      action: () => router.push('/analytics'),
      color: 'info'
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      icon: <SettingsIcon />,
      action: () => router.push('/settings'),
      color: 'secondary'
    }
  ]

  const quickStats = [
    {
      label: 'Annual Leave',
      value: leaveBalance?.annual || 0,
      color: 'primary',
      icon: <EventAvailable />
    },
    {
      label: 'Sick Leave',
      value: leaveBalance?.sick || 0,
      color: 'success',
      icon: <Assignment />
    },
    {
      label: 'Pending',
      value: pendingRequests,
      color: 'warning',
      icon: <Update />
    }
  ]

  // Use enhanced actions if leave balance is provided, otherwise use legacy
  const actions = role === 'admin' ? adminActions : (leaveBalance ? enhancedUserActions : userActions)

  // Mobile floating action button
  if (isMobile && !compact && leaveBalance) {
    return (
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1300 }}>
        <Zoom in={true}>
          <Fab
            color="primary"
            onClick={() => setQuickLeaveOpen(true)}
            sx={{ mb: 1 }}
          >
            <AddCircle />
          </Fab>
        </Zoom>
        
        {/* Quick Leave Dialog */}
        <Dialog open={quickLeaveOpen} onClose={() => setQuickLeaveOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Quick Leave Request</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Leave Type"
                  value={quickLeaveData.type}
                  onChange={(e) => setQuickLeaveData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="Annual">Annual Leave</MenuItem>
                  <MenuItem value="Sick">Sick Leave</MenuItem>
                  <MenuItem value="Unpaid">Unpaid Leave</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={quickLeaveData.startDate}
                  onChange={(e) => setQuickLeaveData(prev => ({ ...prev, startDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={quickLeaveData.endDate}
                  onChange={(e) => setQuickLeaveData(prev => ({ ...prev, endDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason (Optional)"
                  value={quickLeaveData.reason}
                  onChange={(e) => setQuickLeaveData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQuickLeaveOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleQuickLeaveSubmit}
              disabled={!quickLeaveData.startDate || !quickLeaveData.endDate}
            >
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }

  // Compact mode for legacy compatibility
  if (compact) {
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {actions.slice(0, 4).map((action) => (
          <Tooltip key={action.id} title={action.title}>
            <IconButton
              onClick={action.action}
              color={action.color}
              disabled={action.disabled}
              size="small"
            >
              {action.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    )
  }

  // Enhanced mode with stats and modern cards
  if (leaveBalance && role === 'user') {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Speed color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Quick Actions
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {quickStats.map((stat) => (
            <Grid item xs={4} key={stat.label}>
              <Card sx={{ textAlign: 'center', py: 1 }}>
                <CardContent sx={{ pb: '8px !important' }}>
                  <Box sx={{ color: `${stat.color}.main`, mb: 1 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Action Cards */}
        <Grid container spacing={2}>
          {enhancedUserActions.map((action) => (
            <Grid item xs={12} sm={6} key={action.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  },
                  position: 'relative',
                  opacity: action.disabled ? 0.6 : 1
                }}
                onClick={!action.disabled ? action.action : undefined}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: `${action.color}.main` }}>
                        {action.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                    {action.badge && (
                      <Chip
                        label={action.badge}
                        size="small"
                        color={action.color}
                        sx={{ minWidth: 24 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Enhanced Leave Request Dialog */}
        <Dialog open={quickLeaveOpen} onClose={() => setQuickLeaveOpen(false)} fullWidth maxWidth="md">
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AddCircle color="primary" />
            <Box>
              <Typography variant="h6">Quick Leave Request</Typography>
              <Typography variant="body2" color="text.secondary">
                Submit your leave request in seconds
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Leave Type"
                  value={quickLeaveData.type}
                  onChange={(e) => setQuickLeaveData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="Annual">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventAvailable fontSize="small" />
                      Annual Leave ({leaveBalance?.annual || 0} days)
                    </Box>
                  </MenuItem>
                  <MenuItem value="Sick">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assignment fontSize="small" />
                      Sick Leave ({leaveBalance?.sick || 0} days)
                    </Box>
                  </MenuItem>
                  <MenuItem value="Unpaid">Unpaid Leave</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Available Balance
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`Annual: ${leaveBalance?.annual || 0}`} size="small" color="primary" />
                    <Chip label={`Sick: ${leaveBalance?.sick || 0}`} size="small" color="success" />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={quickLeaveData.startDate}
                  onChange={(e) => setQuickLeaveData(prev => ({ ...prev, startDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={quickLeaveData.endDate}
                  onChange={(e) => setQuickLeaveData(prev => ({ ...prev, endDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: quickLeaveData.startDate }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reason (Optional)"
                  value={quickLeaveData.reason}
                  onChange={(e) => setQuickLeaveData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Brief description of your leave request..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setQuickLeaveOpen(false)} size="large">
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleQuickLeaveSubmit}
              disabled={!quickLeaveData.startDate || !quickLeaveData.endDate}
              size="large"
              sx={{ minWidth: 120 }}
            >
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    )
  }

  // Legacy mode for backwards compatibility
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} key={action.id}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={action.icon}
              onClick={action.action}
              color={action.color}
              disabled={action.disabled}
              sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: 2
                }
              }}
            >
              {action.title}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}