'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    weeklyDigest: true,
  });

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/profile');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/signin');
            return;
          }
          throw new Error('Failed to load settings');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, [router]);

  const handleSettingChange = (setting: string) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof settings],
    }));
    setSuccess('Setting updated!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleChangePassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/signin');
    } catch (err) {
      setError('Failed to logout');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setError('');
      const response = await fetch('/api/auth/account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      setSuccess('Account deleted successfully');
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, pb: 3, borderBottom: '1px solid #eee' }}>
          <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Settings
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage your account preferences and security
            </Typography>
          </Box>
        </Box>

        {/* Status Messages */}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Notification Settings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Notification Preferences
          </Typography>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={() => handleSettingChange('emailNotifications')}
                />
              }
              label="Email Notifications"
            />
            <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
              Receive notifications about important activities and updates via email
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.slackNotifications}
                  onChange={() => handleSettingChange('slackNotifications')}
                />
              }
              label="Slack Notifications"
            />
            <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
              Receive notifications in Slack (requires integration setup)
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.weeklyDigest}
                  onChange={() => handleSettingChange('weeklyDigest')}
                />
              }
              label="Weekly Digest"
            />
            <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
              Receive a weekly summary of your organization's HR activities
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Security Settings */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SecurityIcon sx={{ fontSize: 24, mr: 2, color: 'warning.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Security
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Password
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Change your password regularly to keep your account secure.
              </Typography>
              <Button
                variant="outlined"
                onClick={handleChangePassword}
              >
                Change Password
              </Button>
            </Box>

            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Two-Factor Authentication
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Add an extra layer of security to your account.
              </Typography>
              <Button
                variant="outlined"
                disabled
              >
                Enable 2FA (Coming Soon)
              </Button>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Danger Zone */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>
            Danger Zone
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1, borderLeft: '4px solid #d32f2f' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Logout
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Sign out of your account from this device.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={() => setOpenLogoutDialog(true)}
              >
                Logout
              </Button>
            </Box>

            <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1, borderLeft: '4px solid #d32f2f' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
                Delete Account
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpenDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Logout Confirmation Dialog */}
      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>Logout Confirmation</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout from your account?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)}>Cancel</Button>
          <Button
            onClick={handleLogout}
            color="error"
            variant="contained"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to permanently delete your account? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
            All your data, including leave requests, employee records, and settings will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
