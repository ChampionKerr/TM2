import React, { useState } from 'react';
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
  ChevronRight
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

interface CalendarEvent {
  id: string;
  date: string; // ISO date string
  type: 'leave' | 'holiday' | 'event';
  title: string;
  status?: 'approved' | 'pending' | 'rejected';
}

interface MiniCalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  compact?: boolean;
}

export function MiniCalendar({ events = [], onDateClick, compact = false }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const theme = useTheme();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateStr);
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.type === 'holiday') return theme.palette.error.light;
    if (event.type === 'event') return theme.palette.info.light;
    
    switch (event.status) {
      case 'approved': return theme.palette.success.light;
      case 'pending': return theme.palette.warning.light;
      case 'rejected': return theme.palette.error.light;
      default: return theme.palette.grey[300];
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
        <Grid item key={date.toString()}>
          <Box
            sx={{
              width: compact ? 28 : 36,
              height: compact ? 28 : 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: onDateClick ? 'pointer' : 'default',
              borderRadius: 1,
              backgroundColor: isToday ? theme.palette.primary.main : 'transparent',
              color: isToday 
                ? theme.palette.primary.contrastText 
                : isCurrentMonth 
                  ? theme.palette.text.primary 
                  : theme.palette.text.disabled,
              '&:hover': onDateClick ? {
                backgroundColor: isToday 
                  ? theme.palette.primary.dark 
                  : theme.palette.action.hover
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
                  bottom: 2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 0.25
                }}
              >
                {dayEvents.slice(0, 3).map((event, index) => (
                  <Tooltip key={`${event.id}-${index}`} title={event.title}>
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: getEventColor(event)
                      }}
                    />
                  </Tooltip>
                ))}
                {dayEvents.length > 3 && (
                  <Tooltip title={`+${dayEvents.length - 3} more`}>
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.grey[400]
                      }}
                    />
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
    <Paper sx={{ p: compact ? 2 : 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton 
          size="small" 
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
        >
          <ChevronLeft />
        </IconButton>
        
        <Typography variant={compact ? "subtitle2" : "h6"} fontWeight="medium">
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        
        <IconButton 
          size="small" 
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Weekday headers */}
      <Grid container spacing={0} sx={{ mb: 1 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Grid item key={index}>
            <Box
              sx={{
                width: compact ? 28 : 36,
                height: compact ? 20 : 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight="medium"
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

      {/* Legend */}
      {events.length > 0 && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.success.light }} />
              <Typography variant="caption">Approved</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.warning.light }} />
              <Typography variant="caption">Pending</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.error.light }} />
              <Typography variant="caption">Holiday</Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}