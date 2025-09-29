'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  Grid,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

enum LeaveType {
  Annual = 'Annual',
  Sick = 'Sick',
  Unpaid = 'Unpaid',
  Other = 'Other'
}

interface LeaveRequestFormProps {
  onSubmit: (data: LeaveRequestData) => Promise<void>;
  initialData?: LeaveRequestData;
}

// Internal form state with Date objects
interface FormState {
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

// API data interface with string dates
interface LeaveRequestData {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  onSubmit,
  initialData
}) => {
  // Initialize form state with Date objects
  const [formState, setFormState] = useState<FormState>({
    type: initialData?.type || LeaveType.Annual,
    startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
    endDate: initialData?.endDate ? new Date(initialData.endDate) : new Date(),
    reason: initialData?.reason || ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setIsSubmitting(true);

    // Client-side validation
    if (!formState.type) {
      setError('Please select a leave type');
      setLoading(false);
      return;
    }

    if (!formState.startDate || !formState.endDate) {
      setError('Please select both start and end dates');
      setLoading(false);
      return;
    }

    if (formState.startDate > formState.endDate) {
      setError('Start date must be before or equal to end date');
      setLoading(false);
      return;
    }

    // For non-sick leave, validate past dates
    if (formState.type !== LeaveType.Sick) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(formState.startDate);
      startDate.setHours(0, 0, 0, 0);

      if (startDate < today) {
        setError('Start date cannot be in the past for non-sick leave requests');
        setLoading(false);
        return;
      }
    } else {
      // For sick leave, don't allow dates more than 30 days in the past
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      const startDate = new Date(formState.startDate);
      startDate.setHours(0, 0, 0, 0);

      if (startDate < thirtyDaysAgo) {
        setError('Sick leave cannot be requested for dates more than 30 days in the past');
        setLoading(false);
        return;
      }
    }

    // Format data for API
    const submitData: LeaveRequestData = {
      type: formState.type,
      startDate: formatDate(formState.startDate),
      endDate: formatDate(formState.endDate),
      ...(formState.reason && { reason: formState.reason.trim() })
    };

    try {
      await onSubmit(submitData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else if (err && typeof err === 'object' && 'error' in err) {
        setError((err as { error: string }).error);
      } else {
        setError('An error occurred while submitting your request');
      }
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Leave Request Form
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                required
                label="Leave Type"
                value={formState.type}
                onChange={(e) => setFormState({ ...formState, type: e.target.value as LeaveType })}
                helperText={
                  formState.type === LeaveType.Sick
                    ? "Sick leave can be requested for past dates within the last 30 days"
                    : "Select the type of leave you're requesting"
                }
              >
                {Object.values(LeaveType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={formState.startDate}
                onChange={(date) => date && setFormState({ ...formState, startDate: date })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: formState.type === LeaveType.Sick 
                      ? "You can request sick leave for up to 30 days in the past"
                      : "When does your leave start?"
                  }
                }}
                minDate={
                  formState.type === LeaveType.Sick
                    ? (() => {
                        const date = new Date();
                        date.setDate(date.getDate() - 30);
                        return date;
                      })()
                    : new Date()
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={formState.endDate}
                onChange={(date) => date && setFormState({ ...formState, endDate: date })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: "When does your leave end?"
                  }
                }}
                minDate={formState.startDate}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason (optional)"
                value={formState.reason || ''}
                onChange={(e) => setFormState({ ...formState, reason: e.target.value || undefined })}
                helperText="You may provide a reason for your leave request"
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setFormState({
                    type: LeaveType.Annual,
                    startDate: new Date(),
                    endDate: new Date(),
                    reason: ''
                  })}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || isSubmitting}
                  sx={{
                    position: 'relative',
                    '& .MuiCircularProgress-root': {
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }
                  }}
                >
                  {isSubmitting ? 'Submitting...' : loading ? 'Processing...' : 'Submit Request'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default LeaveRequestForm;