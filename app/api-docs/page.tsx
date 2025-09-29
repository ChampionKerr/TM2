'use client';

import { Box, Typography, Paper } from '@mui/material';

export default function ApiDocs() {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          API Documentation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive documentation for the Timewise HRMS API endpoints.
        </Typography>
      </Paper>
      <Box sx={{ height: 'calc(100vh - 200px)', border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <iframe
          src="/api-docs.html"
          width="100%"
          height="100%"
          style={{ border: 'none', borderRadius: '4px' }}
          title="API Documentation"
        />
      </Box>
    </Box>
  );
}
