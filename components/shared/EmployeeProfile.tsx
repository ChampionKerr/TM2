// Enhanced Employee Profile Component
'use client'

import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import {
  Edit as EditIcon,
  CalendarToday,
  TrendingUp,
  AccessTime,
  Email,
  Phone,
  LocationOn,
  Work,
  School,
  Badge
} from '@mui/icons-material'

interface EmployeeProfileProps {
  employee: {
    firstName: string
    lastName: string
    email: string
    department: string
    role: string
    phone?: string
    address?: string
    startDate?: string
    vacationDays: number
    sickDays: number
    usedVacation: number
    usedSick: number
  }
}

export function EmployeeProfile({ employee }: EmployeeProfileProps) {
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({
    phone: employee.phone || '',
    address: employee.address || ''
  })

  const handleEditSave = () => {
    // TODO: API call to update profile
    setEditMode(false)
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mr: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontSize: '2rem'
          }}
        >
          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            {employee.firstName} {employee.lastName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Work fontSize="small" color="primary" />
            <Typography variant="h6" color="primary">
              {employee.department}
            </Typography>
            <Chip 
              label={employee.role} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          </Box>
        </Box>
        <IconButton 
          onClick={() => setEditMode(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          <EditIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge color="primary" />
                Contact Information
              </Typography>
              <Box sx={{ mt: 2, space: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography>{employee.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography color={employee.phone ? 'text.primary' : 'text.secondary'}>
                    {employee.phone || 'Not provided'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography color={employee.address ? 'text.primary' : 'text.secondary'}>
                    {employee.address || 'Not provided'}
                  </Typography>
                </Box>
                {employee.startDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
                    <Typography>
                      Started {new Date(employee.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Balance Overview */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                Leave Balance
              </Typography>
              
              {/* Annual Leave */}
              <Box sx={{ mt: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="medium">Annual Leave</Typography>
                  <Typography variant="body2">
                    {employee.vacationDays - employee.usedVacation} / {employee.vacationDays} days
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(employee.usedVacation / employee.vacationDays) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#1976d2'
                    }
                  }}
                />
              </Box>

              {/* Sick Leave */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="medium">Sick Leave</Typography>
                  <Typography variant="body2">
                    {employee.sickDays - employee.usedSick} / {employee.sickDays} days
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(employee.usedSick / employee.sickDays) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#2e7d32'
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editMode} onClose={() => setEditMode(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Phone Number"
            value={editData.phone}
            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={3}
            value={editData.address}
            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMode(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}