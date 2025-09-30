import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Grid,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { useSession } from 'next-auth/react';

interface CalendarEvent {
  id: string;
  employeeName: string;
  type: 'Annual' | 'Sick' | 'Unpaid' | 'Other';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  isCurrentUser?: boolean;
}

interface MiniCalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  compact?: boolean;
  showTeamLeave?: boolean;
}

export function MiniCalendar({ 
  events: propEvents, 
  onDateClick, 
  compact = false,
  showTeamLeave = false 
}: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(propEvents || []);
  const [_loading, setLoading] = useState(false);
  const theme = useTheme();
  const { data: session } = useSession();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const fetchCalendarEvents = useCallback(async () => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: (currentDate.getMonth() + 1).toString(),
        year: currentDate.getFullYear().toString(),
        ...(showTeamLeave && { includeTeam: 'true' })
      });

      const response = await fetch(`/api/calendar/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, session?.user, showTeamLeave]);

  useEffect(() => {
    if (!propEvents && session?.user) {
      fetchCalendarEvents();
    }
  }, [fetchCalendarEvents, propEvents, session?.user]);

  useEffect(() => {
    if (propEvents) {
      setEvents(propEvents);
    }
  }, [propEvents]);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.isCurrentUser) {
      switch (event.status) {
        case 'Approved': return theme.palette.success.main;
        case 'Pending': return theme.palette.warning.main;
        case 'Rejected': return theme.palette.error.main;
        default: return theme.palette.grey[400];
      }
    } else {
      // Team member events (more subtle colors)
      switch (event.status) {
        case 'Approved': return theme.palette.success.light;
        case 'Pending': return theme.palette.warning.light;
        case 'Rejected': return theme.palette.error.light;
        default: return theme.palette.grey[300];
      }
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    let date = startDate;

    while (date <= endDate) {
      const dayEvents = getEventsForDate(date);
      const isCurrentMonth = isSameMonth(date, monthStart);
      const isToday = isSameDay(date, new Date());
      
      days.push(
        <Grid item key={date.toString()} xs>
          <Box
            sx={{
              aspectRatio: '1',
              minHeight: compact ? 32 : 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: onDateClick ? 'pointer' : 'default',
              borderRadius: 1.5,
              m: 0.25,
              backgroundColor: isToday 
                ? theme.palette.primary.main 
                : dayEvents.length > 0
                  ? theme.palette.action.hover
                  : 'transparent',
              color: isToday 
                ? theme.palette.primary.contrastText 
                : isCurrentMonth 
                  ? theme.palette.text.primary 
                  : theme.palette.text.disabled,
              border: isToday ? `2px solid ${theme.palette.primary.dark}` : 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': onDateClick ? {
                backgroundColor: isToday 
                  ? theme.palette.primary.dark 
                  : theme.palette.action.selected,
                transform: 'scale(1.05)',
                boxShadow: theme.shadows[2]
              } : {}
            }}
            onClick={() => onDateClick?.(date)}
          >
            <Typography 
              variant={compact ? "caption" : "body2"} 
              fontWeight={isToday ? "bold" : "normal"}
            >
              {format(date, 'd')}
            </Typography>
            
            {dayEvents.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 3,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 0.5,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  maxWidth: '90%'
                }}
              >
                {dayEvents.slice(0, 2).map((event, index) => (
                  <Tooltip 
                    key={`${event.id}-${index}`} 
                    title={`${event.employeeName}: ${event.type} Leave (${event.status})`}
                    arrow
                    placement="top"
                  >
                    <Box
                      sx={{
                        width: compact ? 5 : 6,
                        height: compact ? 5 : 6,
                        borderRadius: '50%',
                        backgroundColor: getEventColor(event),
                        border: event.isCurrentUser ? `1px solid ${theme.palette.common.white}` : 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.3)'
                        }
                      }}
                    />
                  </Tooltip>
                ))}
                {dayEvents.length > 2 && (
                  <Tooltip title={`+${dayEvents.length - 2} more events`} arrow>
                    <Box
                      sx={{
                        width: compact ? 5 : 6,
                        height: compact ? 5 : 6,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.grey[500],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.5rem',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      +
                    </Box>
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      );
      
      date = addDays(date, 1);
    }

    return days;
  };

  return (
    <Paper 
      sx={{ 
        p: compact ? 2 : 3,
        borderRadius: 2,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Calendar Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CalendarIcon 
          sx={{ 
            color: theme.palette.primary.main,
            fontSize: compact ? '1.2rem' : '1.5rem'
          }} 
        />
        <Typography 
          variant={compact ? "subtitle2" : "h6"} 
          fontWeight="bold"
          color="text.primary"
        >
          Calendar
        </Typography>
      </Box>

      {/* Month Navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        p: 1,
        borderRadius: 1,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)'
      }}>
        <IconButton 
          size="small" 
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          sx={{
            backgroundColor: theme.palette.background.paper,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <ChevronLeft fontSize="small" />
        </IconButton>
        
        <Typography 
          variant={compact ? "subtitle2" : "subtitle1"} 
          fontWeight="bold"
          color="text.primary"
          sx={{ textAlign: 'center', minWidth: compact ? 120 : 140 }}
        >
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        
        <IconButton 
          size="small" 
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          sx={{
            backgroundColor: theme.palette.background.paper,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <ChevronRight fontSize="small" />
        </IconButton>
      </Box>

      {/* Weekday headers */}
      <Grid container spacing={0} sx={{ mb: 1.5 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Grid item key={index} xs>
            <Box
              sx={{
                height: compact ? 24 : 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.03)',
                borderRadius: 1,
                mx: 0.25
              }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight="bold"
                sx={{ fontSize: compact ? '0.7rem' : '0.75rem' }}
              >
                {day}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Calendar days */}
      <Grid container spacing={0}>
        {renderCalendarDays()}
      </Grid>

      {/* Enhanced Legend & Summary */}
      {events.length > 0 && (
        <Box sx={{ 
          mt: 2, 
          pt: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(0,0,0,0.02)',
          borderRadius: 1,
          p: 1.5
        }}>
          {/* Summary Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              This Month: {events.length} events
            </Typography>
            <Typography variant="caption" color="primary.main" fontWeight="bold">
              {events.filter(e => e.isCurrentUser).length} yours
            </Typography>
          </Box>
          
          {/* Legend */}
          <Box sx={{ 
            display: 'flex', 
            gap: compact ? 1 : 1.5, 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: theme.palette.success.main,
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
              <Typography variant="caption" fontWeight="medium">Approved</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: theme.palette.warning.main,
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
              <Typography variant="caption" fontWeight="medium">Pending</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: theme.palette.error.main,
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
              <Typography variant="caption" fontWeight="medium">Rejected</Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Empty State */}
      {events.length === 0 && (
        <Box sx={{ 
          mt: 2, 
          pt: 2, 
          textAlign: 'center',
          color: 'text.secondary'
        }}>
          <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
            No events this month
          </Typography>
        </Box>
      )}
    </Paper>
  );
}