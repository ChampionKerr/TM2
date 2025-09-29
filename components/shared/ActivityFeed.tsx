import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Send as SubmittedIcon,
  MoreVert as MoreIcon,
  CheckCircle
} from '@mui/icons-material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { StatusChip } from './StatsCard';

interface Activity {
  id: string;
  type: 'request_submitted' | 'request_approved' | 'request_rejected' | 'leave_started' | 'leave_ended';
  title: string;
  description: string;
  timestamp: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  actor?: {
    name: string;
    avatar?: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  compact?: boolean;
}

export function ActivityFeed({ activities, maxItems = 5, compact = false }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity['type'], status?: string) => {
    switch (type) {
      case 'request_submitted':
        return <SubmittedIcon color="info" />;
      case 'request_approved':
        return <ApprovedIcon color="success" />;
      case 'request_rejected':
        return <RejectedIcon color="error" />;
      case 'leave_started':
        return <PendingIcon color="warning" />;
      case 'leave_ended':
        return <CheckCircle color="success" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  if (compact) {
    return (
      <Box>
        {displayedActivities.map((activity, index) => (
          <Box key={activity.id} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getActivityIcon(activity.type, activity.status)}
              <Typography variant="body2" sx={{ flex: 1 }}>
                {activity.title}
              </Typography>
              {activity.status && <StatusChip status={activity.status} size="small" />}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
              {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}
            </Typography>
            {index < displayedActivities.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 0 }}>
      <Box sx={{ p: 3, pb: 1 }}>
        <Typography variant="h6">
          Recent Activity
        </Typography>
      </Box>
      
      <List sx={{ pt: 0 }}>
        {displayedActivities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <ListItem
              sx={{
                alignItems: 'flex-start',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
              secondaryAction={
                <IconButton edge="end" size="small">
                  <MoreIcon />
                </IconButton>
              }
            >
              <ListItemIcon sx={{ mt: 1 }}>
                {activity.actor?.avatar ? (
                  <Avatar src={activity.actor.avatar} sx={{ width: 32, height: 32 }}>
                    {activity.actor.name.charAt(0)}
                  </Avatar>
                ) : (
                  getActivityIcon(activity.type, activity.status)
                )}
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {activity.title}
                    </Typography>
                    {activity.status && <StatusChip status={activity.status} />}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}
                      {activity.actor && ` • by ${activity.actor.name}`}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            {index < displayedActivities.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}