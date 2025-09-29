'use client';

import { Box, Container, AppBar } from '@mui/material';
import ResponsiveAppBar from '@/components/ResponsiveAppBar';

export default function EmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ResponsiveAppBar />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
