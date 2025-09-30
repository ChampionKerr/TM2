// Enhanced Calendar Widget for Dashboard
'use client'

import React from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  useTheme,
  alpha
} from '@mui/material'
import {
  CalendarMonth as CalendarIcon,
  TrendingUp,
  Schedule,
  CheckCircle
} from '@mui/icons-material'
import { MiniCalendar } from './MiniCalendar'

interface CalendarEvent {
  id: string
  employeeName: string
  type: 'Annual' | 'Sick' | 'Unpaid' | 'Other'
  startDate: string
  endDate: string
  status: 'Pending' | 'Approved' | 'Rejected'
  isCurrentUser?: boolean
}

interface CalendarWidgetProps {
  onDateClick?: (date: Date) => void
  onViewFullCalendar?: () => void
  showTeamLeave?: boolean
  compact?: boolean
  events?: CalendarEvent[]
}

export function CalendarWidget({ 
  onDateClick, 
  onViewFullCalendar,
  showTeamLeave = false,
  compact = false,
  events = []
}: CalendarWidgetProps) {
  const theme = useTheme()

  // Calculate quick stats
  const userEvents = events.filter(e => e.isCurrentUser)
  const pendingCount = userEvents.filter(e => e.status === 'Pending').length
  const approvedCount = userEvents.filter(e => e.status === 'Approved').length
  const teamEventsCount = events.filter(e => !e.isCurrentUser).length

  return (
    <Paper 
      sx={{ 
        overflow: 'hidden',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${theme.palette.background.paper} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        position: 'relative'
      }}
    >
      {/* Header with quick stats */}
      <Box sx={{ 
        p: 2, 
        pb: 1,
        background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon 
              sx={{ 
                color: theme.palette.primary.main,
                fontSize: '1.5rem'
              }} 
            />
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Calendar Overview
            </Typography>
          </Box>
          
          {events.length > 0 && (
            <Chip
              icon={<TrendingUp />}
              label={`${userEvents.length} events`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {/* Quick Stats Grid */}
        {userEvents.length > 0 && (
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <Box sx={{ 
                textAlign: 'center',
                p: 1,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.success.main, 0.1)
              }}>
                <CheckCircle sx={{ fontSize: '1rem', color: 'success.main', mb: 0.5 }} />
                <Typography variant="caption" display="block" fontWeight="bold">
                  {approvedCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Approved
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ 
                textAlign: 'center',
                p: 1,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.warning.main, 0.1)
              }}>
                <Schedule sx={{ fontSize: '1rem', color: 'warning.main', mb: 0.5 }} />
                <Typography variant="caption" display="block" fontWeight="bold">
                  {pendingCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ 
                textAlign: 'center',
                p: 1,
                borderRadius: 1,
                backgroundColor: showTeamLeave && teamEventsCount > 0 
                  ? alpha(theme.palette.info.main, 0.1)
                  : alpha(theme.palette.grey[500], 0.1)
              }}>
                <CalendarIcon sx={{ 
                  fontSize: '1rem', 
                  color: showTeamLeave && teamEventsCount > 0 ? 'info.main' : 'grey.500', 
                  mb: 0.5 
                }} />
                <Typography variant="caption" display="block" fontWeight="bold">
                  {showTeamLeave ? teamEventsCount : events.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {showTeamLeave ? 'Team' : 'Total'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Calendar Component */}
      <Box sx={{ p: 2, pt: 0 }}>
        <MiniCalendar
          onDateClick={onDateClick}
          showTeamLeave={showTeamLeave}
          compact={compact}
          events={events}
        />
      </Box>

      {/* Action Overlay */}
      {onViewFullCalendar && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10
          }}
        >
          <Chip
            label="View Full"
            size="small"
            onClick={onViewFullCalendar}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.9),
              color: theme.palette.primary.contrastText,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          />
        </Box>
      )}
    </Paper>
  )
}