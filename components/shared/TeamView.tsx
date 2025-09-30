// Team Members Component - View colleagues in the same department
'use client'

import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Divider,
  useTheme
} from '@mui/material'
import {
  Group,
  Email,
  Phone,
  Work,
  MoreVert,
  EventAvailable,
  Schedule,
  Close
} from '@mui/icons-material'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  role: string
  vacationDays: number
  sickDays: number
  usedVacation?: number
  usedSick?: number
  isOnLeave?: boolean
  leaveEndDate?: string
  phone?: string
  avatar?: string
}

interface TeamViewProps {
  currentUserId: string
  userDepartment?: string
}

export function TeamView({ currentUserId, userDepartment = 'Engineering' }: TeamViewProps) {
  const theme = useTheme()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchTeamMembers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, userDepartment])

  const fetchTeamMembers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/team/department?dept=${encodeURIComponent(userDepartment)}`)
      if (response.ok) {
        const data = await response.json()
        // Filter out current user from team list
        const otherMembers = data.members?.filter((member: TeamMember) => member.id !== currentUserId) || []
        setTeamMembers(otherMembers)
      } else {
        // Fallback demo data based on the seed file
        const demoMembers: TeamMember[] = [
          {
            id: 'demo-1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@timewise.com',
            department: userDepartment,
            role: 'user',
            vacationDays: 20,
            sickDays: 10,
            usedVacation: 5,
            usedSick: 1,
            isOnLeave: false,
            phone: '+1 (555) 123-4567'
          },
          {
            id: 'demo-2',
            firstName: 'Mike',
            lastName: 'Wilson',
            email: 'mike.wilson@timewise.com',
            department: userDepartment,
            role: 'user',
            vacationDays: 20,
            sickDays: 10,
            usedVacation: 8,
            usedSick: 0,
            isOnLeave: true,
            leaveEndDate: '2025-10-02',
            phone: '+1 (555) 987-6543'
          },
          {
            id: 'demo-3',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'hr.manager@timewise.com',
            department: 'Human Resources',
            role: 'admin',
            vacationDays: 25,
            sickDays: 15,
            usedVacation: 3,
            usedSick: 0,
            isOnLeave: false,
            phone: '+1 (555) 456-7890'
          }
        ].filter(member => member.department === userDepartment && member.id !== currentUserId)
        
        setTeamMembers(demoMembers)
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error)
      setTeamMembers([])
    } finally {
      setLoading(false)
    }
  }

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member)
    setDetailsOpen(true)
  }

  const getAvailabilityStatus = (member: TeamMember) => {
    if (member.isOnLeave) {
      return {
        status: 'On Leave',
        color: 'warning' as const,
        endDate: member.leaveEndDate
      }
    }
    return {
      status: 'Available',
      color: 'success' as const
    }
  }

  const getRemainingDays = (total: number, used?: number) => {
    return Math.max(0, total - (used || 0))
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Group color="primary" />
        <Typography variant="h6" fontWeight="bold">
          Team Members - {userDepartment}
        </Typography>
        <Chip 
          label={`${teamMembers.length} colleagues`} 
          size="small" 
          color="primary" 
        />
      </Box>

      {teamMembers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Group sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Team Members Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You&apos;re the only one in the {userDepartment} department
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {teamMembers.map((member) => {
            const availability = getAvailabilityStatus(member)
            
            return (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                  onClick={() => handleMemberClick(member)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          bgcolor: member.isOnLeave ? 'warning.main' : 'primary.main'
                        }}
                      >
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {member.firstName} {member.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {member.email}
                        </Typography>
                        <Chip
                          label={availability.status}
                          size="small"
                          color={availability.color}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {member.isOnLeave && availability.endDate && (
                      <Box sx={{ mb: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                        <Typography variant="caption" color="warning.dark">
                          Returns: {new Date(availability.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {getRemainingDays(member.vacationDays, member.usedVacation)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Annual Days
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="success.main">
                            {getRemainingDays(member.sickDays, member.usedSick)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sick Days
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Member Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedMember && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: selectedMember.isOnLeave ? 'warning.main' : 'primary.main'
                  }}
                >
                  {selectedMember.firstName.charAt(0)}{selectedMember.lastName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMember.department}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setDetailsOpen(false)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Contact Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Contact Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemAvatar>
                        <Email color="primary" />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={selectedMember.email}
                        secondary="Email"
                      />
                    </ListItem>
                    {selectedMember.phone && (
                      <ListItem>
                        <ListItemAvatar>
                          <Phone color="primary" />
                        </ListItemAvatar>
                        <ListItemText 
                          primary={selectedMember.phone}
                          secondary="Phone"
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemAvatar>
                        <Work color="primary" />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={selectedMember.department}
                        secondary="Department"
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Divider />

                {/* Leave Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Leave Balance
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <EventAvailable color="primary" sx={{ mb: 1 }} />
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            {getRemainingDays(selectedMember.vacationDays, selectedMember.usedVacation)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Annual Days Left
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            of {selectedMember.vacationDays} total
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Schedule color="success" sx={{ mb: 1 }} />
                          <Typography variant="h5" fontWeight="bold" color="success.main">
                            {getRemainingDays(selectedMember.sickDays, selectedMember.usedSick)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Sick Days Left
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            of {selectedMember.sickDays} total
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Current Status */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Current Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={getAvailabilityStatus(selectedMember).status}
                      color={getAvailabilityStatus(selectedMember).color}
                      size="medium"
                    />
                    {selectedMember.isOnLeave && getAvailabilityStatus(selectedMember).endDate && (
                      <Typography variant="body2" color="text.secondary">
                        Returns: {new Date(getAvailabilityStatus(selectedMember).endDate || '').toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Paper>
  )
}