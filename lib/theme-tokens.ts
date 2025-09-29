// Design tokens and constants for the TimeWise HRMS application

export const STATUS_COLORS = {
  pending: '#FFA726',    // Orange
  approved: '#66BB6A',   // Green  
  rejected: '#EF5350',   // Red
  draft: '#90A4AE'       // Gray
} as const;

export const ROLE_THEMES = {
  user: {
    primary: '#1976D2',    // Blue
    accent: '#E3F2FD',     // Light blue
    gradient: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
    cardElevation: 2,
    borderRadius: '12px'
  },
  admin: {
    primary: '#7B1FA2',    // Purple
    accent: '#F3E5F5',     // Light purple
    gradient: 'linear-gradient(135deg, #7B1FA2 0%, #AB47BC 100%)',
    cardElevation: 1,
    borderRadius: '8px'
  }
} as const;

export const DASHBOARD_LAYOUT = {
  user: {
    header: {
      padding: '24px',
      borderRadius: '12px'
    },
    cards: {
      elevation: 2,
      borderRadius: '8px',
      padding: '20px'
    },
    spacing: 3
  },
  admin: {
    header: {
      padding: '16px',
      borderRadius: '4px'
    },
    cards: {
      elevation: 1,
      borderRadius: '4px',
      padding: '16px'
    },
    spacing: 2
  }
} as const;

export const TYPOGRAPHY_SCALE = {
  user: {
    primary: 'h4',
    secondary: 'h6',
    body: 'body1',
    caption: 'body2'
  },
  admin: {
    primary: 'h5',
    secondary: 'h6',
    body: 'body2',
    caption: 'caption'
  }
} as const;

export const ANIMATION_TIMING = {
  fast: '0.15s',
  medium: '0.25s',
  slow: '0.4s'
} as const;

export const BREAKPOINTS = {
  mobile: 'xs',
  tablet: 'sm',
  desktop: 'md',
  wide: 'lg',
  ultrawide: 'xl'
} as const;