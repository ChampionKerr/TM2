import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our logging service
    logger.error('React Error Boundary caught an error', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      }
    });

    this.setState({ errorInfo });
    
    // Call the error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  }

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container maxWidth="sm">
          <Paper 
            elevation={3}
            sx={{ 
              p: 4, 
              mt: 4,
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>
              Something went wrong
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {process.env.NODE_ENV === 'development' 
                ? this.state.error?.message || 'An unexpected error occurred'
                : 'We apologize for the inconvenience. Please try again later.'}
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box 
                component="pre" 
                sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'grey.100', 
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: '200px',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <Box component="code">
                  {this.state.errorInfo.componentStack}
                </Box>
              </Box>
            )}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={this.handleReset}
              >
                Try again
              </Button>
              <Button 
                variant="outlined"
                onClick={() => window.location.href = '/'}
              >
                Go to homepage
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}
