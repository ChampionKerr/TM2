// Dedicated Analytics Page for Admin Users
'use client'

import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container
} from '@mui/material'
import {
  Analytics as AnalyticsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'
import { LeaveAnalytics } from '@/components/shared/LeaveAnalytics'
import Link from 'next/link'

export default function AnalyticsPage() {
  const { data: session, status } = useSession() as { data: Session | null, status: 'authenticated' | 'loading' | 'unauthenticated' }
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    )
  }

  if (!session) {
    return null // Will redirect to signin
  }

  if (session.user?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Analytics are only available to administrators.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
              <ArrowBackIcon />
              <Typography variant="body2">Back to Dashboard</Typography>
            </Box>
          </Link>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AnalyticsIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              System Analytics
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Comprehensive insights and metrics for {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Analytics Component */}
      <LeaveAnalytics 
        userId={session.user.id}
        employeeName={`${session.user.firstName} ${session.user.lastName}`}
      />

      {/* Footer Info */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="body2" color="textSecondary" align="center">
          Analytics data is updated in real-time. Last accessed: {new Date().toLocaleString()}
        </Typography>
      </Paper>
    </Container>
  )
}