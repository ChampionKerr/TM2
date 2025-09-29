import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Assessment as ReportIcon,
  AccountBalance as BalanceIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  disabled?: boolean;
}

interface QuickActionsProps {
  role: 'admin' | 'user';
  compact?: boolean;
}

export function QuickActions({ role, compact = false }: QuickActionsProps) {
  const router = useRouter();

  const userActions: QuickAction[] = [
    {
      id: 'new-request',
      label: 'Submit Request',
      icon: <AddIcon />,
      action: () => router.push('/requests'),
      color: 'primary'
    },
    {
      id: 'view-calendar',
      label: 'View Calendar',
      icon: <CalendarIcon />,
      action: () => router.push('/calendar'),
      color: 'info'
    },
    {
      id: 'check-balance',
      label: 'Check Balance',
      icon: <BalanceIcon />,
      action: () => router.push('/balance'),
      color: 'success'
    },
    {
      id: 'download-report',
      label: 'Download Report',
      icon: <ReportIcon />,
      action: () => {
        // TODO: Implement report download
        console.log('Download report clicked');
      },
      color: 'secondary'
    }
  ];

  const adminActions: QuickAction[] = [
    {
      id: 'review-requests',
      label: 'Review Requests',
      icon: <NotificationIcon />,
      action: () => router.push('/admin'),
      color: 'warning'
    },
    {
      id: 'manage-employees',
      label: 'Manage Employees',
      icon: <SettingsIcon />,
      action: () => router.push('/employees'),
      color: 'primary'
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      icon: <ReportIcon />,
      action: () => router.push('/analytics'),
      color: 'info'
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: <SettingsIcon />,
      action: () => router.push('/settings'),
      color: 'secondary'
    }
  ];

  const actions = role === 'admin' ? adminActions : userActions;

  if (compact) {
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {actions.slice(0, 4).map((action) => (
          <Tooltip key={action.id} title={action.label}>
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
    );
  }

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
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}