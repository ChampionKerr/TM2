// Enhanced Calendar View for Leave Requests
'use client'

import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Avatar,
  Alert,
  CircularProgress,
  Skeleton
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Event,
  CalendarMonth,
  Refresh,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material'

interface LeaveEvent {
  id: string
  employeeName: string
  type: 'Annual' | 'Sick' | 'Unpaid' | 'Other'
  startDate: string
  endDate: string
  status: 'Pending' | 'Approved' | 'Rejected'
  reason?: string
  isCurrentUser?: boolean
}

interface LeaveCalendarProps {
  userId?: string
  showTeamLeave?: boolean
  onNewRequest?: () => void
}

export function LeaveCalendar({ userId, showTeamLeave = false, onNewRequest }: LeaveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<LeaveEvent | null>(null)
  const [events, setEvents] = useState<LeaveEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const typeColors = {
    Annual: '#1976d2',
    Sick: '#2e7d32',
    Unpaid: '#ed6c02',
    Other: '#9c27b0'
  }

  const statusColors = {
    Pending: '#ff9800',
    Approved: '#4caf50',
    Rejected: '#f44336'
  }

  useEffect(() => {
    fetchLeaveEvents()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, userId])

  const fetchLeaveEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        month: (currentDate.getMonth() + 1).toString(),
        year: currentDate.getFullYear().toString(),
        ...(userId && { userId }),
        ...(showTeamLeave && { includeTeam: 'true' })
      })
      
      const response = await fetch(`/api/calendar/events?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch calendar events')
      }
    } catch (error) {
      console.error('Failed to fetch leave events:', error)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(event => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      const checkDate = new Date(dateStr)
      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ aspectRatio: 1 }} />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day)
      const isCurrentDay = isToday(day)

      days.push(
        <Box
          key={day}
          sx={{
            aspectRatio: 1,
            border: '1px solid',
            borderColor: 'divider',
            p: 1,
            cursor: dayEvents.length > 0 ? 'pointer' : 'default',
            backgroundColor: isCurrentDay ? 'primary.light' : 'background.paper',
            '&:hover': {
              backgroundColor: dayEvents.length > 0 ? 'action.hover' : (isCurrentDay ? 'primary.light' : 'action.hover')
            },
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 80,
            transition: 'background-color 0.2s ease'
          }}
          onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
        >
          <Typography
            variant="body2"
            fontWeight={isCurrentDay ? 'bold' : 'normal'}
            color={isCurrentDay ? 'primary.contrastText' : 'text.primary'}
            sx={{ mb: 0.5 }}
          >
            {day}
          </Typography>
          
          {/* Event indicators */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {dayEvents.slice(0, 2).map((event, index) => (
              <Tooltip 
                key={`${event.id}-${index}`} 
                title={`${event.employeeName}: ${event.type} Leave (${event.status})`}
                arrow
                placement="top"
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 6,
                    backgroundColor: typeColors[event.type],
                    borderRadius: 1,
                    mb: 0.5,
                    opacity: event.status === 'Approved' ? 1 : 0.7,
                    border: event.isCurrentUser ? '1px solid' : 'none',
                    borderColor: event.isCurrentUser ? 'text.primary' : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 1,
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                  }}
                />
              </Tooltip>
            ))}
            {dayEvents.length > 2 && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
              >
                +{dayEvents.length - 2} more
              </Typography>
            )}
          </Box>
        </Box>
      )
    }

    return days
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalendarMonth color="primary" />
          <Typography variant="h5" fontWeight="bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Typography>
          {showTeamLeave && (
            <Chip 
              label="Team View" 
              color="primary" 
              variant="outlined" 
              size="small" 
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onNewRequest && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onNewRequest}
              sx={{ mr: 1 }}
            >
              New Request
            </Button>
          )}
          <Tooltip title="Previous Month">
            <IconButton onClick={() => navigateMonth('prev')} disabled={loading}>
              <ChevronLeft />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Today />}
            onClick={goToToday}
            disabled={loading}
          >
            Today
          </Button>
          <Tooltip title="Next Month">
            <IconButton onClick={() => navigateMonth('next')} disabled={loading}>
              <ChevronRight />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchLeaveEvents} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchLeaveEvents}
              disabled={loading}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Summary Statistics */}
      {!loading && events.length > 0 && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {monthNames[currentDate.getMonth()]} Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Total Events</Typography>
              <Typography variant="h6" fontWeight="bold">
                {events.length}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Your Requests</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {events.filter(e => e.isCurrentUser).length}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Approved</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {events.filter(e => e.status === 'Approved').length}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {events.filter(e => e.status === 'Pending').length}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {Object.entries(typeColors).map(([type, color]) => (
          <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: color, borderRadius: 1 }} />
            <Typography variant="body2">{type} Leave</Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar Grid */}
      {loading ? (
        <Box>
          {/* Skeleton for day headers */}
          <Grid container sx={{ mb: 1 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Grid item xs key={day}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ p: 1, textAlign: 'center' }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>
          
          {/* Skeleton for calendar days */}
          <Grid container>
            {Array.from({ length: 42 }).map((_, index) => (
              <Grid item xs key={index}>
                <Skeleton 
                  variant="rectangular" 
                  sx={{ aspectRatio: 1, m: 0.5 }} 
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Grid container>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid item xs key={day}>
              <Typography
                variant="body2"
                fontWeight="bold"
                color="text.secondary"
                sx={{ p: 1, textAlign: 'center' }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
          
          {/* Calendar days */}
          {renderCalendarDays().map((day, index) => (
            <Grid item xs key={index}>
              {day}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: typeColors[selectedEvent.type] }}>
                <Event />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">Leave Request Details</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedEvent.employeeName}
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setSelectedEvent(null)}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Chip
                    label={selectedEvent.type}
                    size="small"
                    sx={{ backgroundColor: typeColors[selectedEvent.type], color: 'white' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedEvent.status}
                    size="small"
                    sx={{ backgroundColor: statusColors[selectedEvent.status], color: 'white' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Start Date</Typography>
                  <Typography>{new Date(selectedEvent.startDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">End Date</Typography>
                  <Typography>{new Date(selectedEvent.endDate).toLocaleDateString()}</Typography>
                </Grid>
                {selectedEvent.reason && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Reason</Typography>
                    <Typography>{selectedEvent.reason}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Paper>
  )
}