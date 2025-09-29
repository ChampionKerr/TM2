import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  useTheme
} from '@mui/material';
import { STATUS_COLORS } from '@/lib/theme-tokens';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  loading?: boolean;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  compact?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  color = 'default',
  loading = false,
  trend,
  compact = false
}: StatsCardProps) {
  const theme = useTheme();

  const getColorValue = () => {
    switch (color) {
      case 'primary': return theme.palette.primary.main;
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.text.primary;
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up': return theme.palette.success.main;
      case 'down': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  return (
    <Card elevation={compact ? 1 : 2}>
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        <Typography 
          color="text.secondary" 
          gutterBottom 
          variant={compact ? "body2" : "subtitle2"}
        >
          {title}
        </Typography>
        
        {loading ? (
          <Box display="flex" alignItems="center" py={1}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Loading...
            </Typography>
          </Box>
        ) : (
          <>
            <Typography 
              variant={compact ? "h5" : "h4"} 
              component="div" 
              color={getColorValue()}
              fontWeight="bold"
            >
              {value}
            </Typography>
            
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
            
            {trend && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={`${trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}${Math.abs(trend.value)}%`}
                  color={trend.direction === 'up' ? 'success' : trend.direction === 'down' ? 'error' : 'default'}
                  variant="outlined"
                />
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusChipProps {
  status: 'Pending' | 'Approved' | 'Rejected' | 'Draft';
  size?: 'small' | 'medium';
}

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'Pending': return STATUS_COLORS.pending;
      case 'Approved': return STATUS_COLORS.approved;
      case 'Rejected': return STATUS_COLORS.rejected;
      case 'Draft': return STATUS_COLORS.draft;
      default: return STATUS_COLORS.draft;
    }
  };

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        backgroundColor: getStatusColor(),
        color: 'white',
        fontWeight: 'medium'
      }}
    />
  );
}