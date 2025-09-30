// Enhanced Leave Request Form with Edit Support
'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

interface LeaveRequest {
  id: string
  type: string
  startDate: string
  endDate: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
  days_requested: number
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

interface EnhancedLeaveRequestFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  request?: LeaveRequest
  isEdit?: boolean
  userRole?: string
}

const leaveTypes = [
  { value: 'Annual', label: 'Annual Leave' },
  { value: 'Sick', label: 'Sick Leave' },
  { value: 'Personal', label: 'Personal Leave' },
  { value: 'Emergency', label: 'Emergency Leave' },
  { value: 'Maternity', label: 'Maternity Leave' },
  { value: 'Paternity', label: 'Paternity Leave' }
]

const statusOptions = [
  { value: 'Pending', label: 'Pending', color: 'warning' },
  { value: 'Approved', label: 'Approved', color: 'success' },
  { value: 'Rejected', label: 'Rejected', color: 'error' }
]

export function EnhancedLeaveRequestForm({ 
  open, 
  onClose, 
  onSubmit, 
  request, 
  isEdit = false,
  userRole 
}: EnhancedLeaveRequestFormProps) {
  const { data: session } = useSession() as { data: Session | null }
  const [formData, setFormData] = useState({
    type: request?.type || 'Annual',
    startDate: request ? new Date(request.startDate) : new Date(),
    endDate: request ? new Date(request.endDate) : new Date(),
    reason: request?.reason || '',
    status: request?.status || 'Pending'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isAdmin = session?.user?.role === 'admin'
  const canEditStatus = isAdmin && isEdit
  const canEdit = isEdit && (
    (!isAdmin && request?.status === 'Pending') || // Users can edit pending requests
    isAdmin // Admins can edit any request
  )

  useEffect(() => {
    if (request) {
      setFormData({
        type: request.type,
        startDate: new Date(request.startDate),
        endDate: new Date(request.endDate),
        reason: request.reason,
        status: request.status
      })
    }
  }, [request])

  const calculateDays = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const requestData = {
        ...formData,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
        days_requested: calculateDays(formData.startDate, formData.endDate)
      }

      if (isEdit && request) {
        // Update existing request
        const endpoint = isAdmin 
          ? `/api/requests/${request.id}/admin-update`
          : `/api/requests/${request.id}/update`
        
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update request')
        }

        setSuccess(isAdmin ? 'Request updated successfully' : 'Request updated and submitted for review')
      } else {
        // Create new request
        await onSubmit(requestData)
        setSuccess('Leave request submitted successfully')
      }

      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isFormValid = () => {
    return formData.type && 
           formData.startDate && 
           formData.endDate && 
           formData.reason.trim() &&
           formData.startDate <= formData.endDate
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption?.color || 'default'
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEdit ? <EditIcon /> : <SaveIcon />}
          <Typography variant="h6">
            {isEdit ? 'Edit Leave Request' : 'New Leave Request'}
          </Typography>
          {isEdit && request && (
            <Chip 
              label={request.status} 
              color={getStatusColor(request.status) as any}
              size="small"
            />
          )}
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              {/* Current Status for Edit Mode */}
              {isEdit && request && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Request Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          <strong>Submitted:</strong><br />
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          <strong>Days:</strong><br />
                          {request.days_requested}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          <strong>Status:</strong><br />
                          <Chip 
                            label={request.status} 
                            color={getStatusColor(request.status) as any}
                            size="small"
                          />
                        </Typography>
                      </Grid>
                      {request.reviewedAt && (
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2">
                            <strong>Reviewed:</strong><br />
                            {new Date(request.reviewedAt).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              )}

              {/* Leave Type */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Leave Type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  disabled={!canEdit}
                  required
                >
                  {leaveTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Status (Admin Only) */}
              {canEditStatus && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={option.label} 
                              color={option.color as any}
                              size="small"
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Start Date */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleInputChange('startDate', date)}
                  disabled={!canEdit}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleInputChange('endDate', date)}
                  disabled={!canEdit}
                  minDate={formData.startDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>

              {/* Duration Display */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary">
                    Duration: {calculateDays(formData.startDate, formData.endDate)} day(s)
                  </Typography>
                </Box>
              </Grid>

              {/* Reason */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  disabled={!canEdit}
                  placeholder="Please provide a detailed reason for your leave request..."
                  required
                />
              </Grid>

              {/* Messages */}
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {success && (
                <Grid item xs={12}>
                  <Alert severity="success">{success}</Alert>
                </Grid>
              )}

              {/* Edit Restrictions Info */}
              {isEdit && !canEdit && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    This request cannot be edited because it has been {request?.status.toLowerCase()}.
                    {!isAdmin && ' Contact your administrator if changes are needed.'}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={onClose}
            startIcon={<CancelIcon />}
            disabled={loading}
          >
            Cancel
          </Button>
          
          {canEdit && (
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? null : (isEdit ? <CheckIcon /> : <SaveIcon />)}
              disabled={loading || !isFormValid()}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Request' : 'Submit Request')}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  )
}