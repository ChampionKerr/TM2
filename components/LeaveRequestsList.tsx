'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Box,
  Typography,
  Alert,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  TablePagination
} from '@mui/material';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
  createdAt: string;
  daysRequested?: number;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewedAt?: string;
  reviewedBy?: string;
}

interface LeaveRequestsListProps {
  limit?: number;
  userId?: string;
  showActions?: boolean;
  onRequestUpdate?: () => void;
  statusFilter?: 'Pending' | 'Approved' | 'Rejected' | 'all';
  enablePagination?: boolean;
  defaultPageSize?: number;
}

const statusColors = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error'
} as const;

const LeaveRequestsList: React.FC<LeaveRequestsListProps> = ({ 
  limit, 
  userId, 
  showActions = false,
  onRequestUpdate,
  statusFilter = 'all',
  enablePagination = false,
  defaultPageSize = 10
}) => {
  const { data: session } = useSession();
  
  // Ensure defaultPageSize is a valid option for MUI TablePagination
  const validPageSizes = [5, 10, 25, 50];
  const safeDefaultPageSize = validPageSizes.includes(defaultPageSize) ? defaultPageSize : 10;
  
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(safeDefaultPageSize);
  const [totalRequests, setTotalRequests] = useState(0);
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    request: LeaveRequest | null;
    action: 'approve' | 'reject' | null;
  }>({ open: false, request: null, action: null });
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        console.log('LeaveRequestsList: Starting fetch, userId:', userId);
        setLoading(true);
        setError(null);

        if (!userId && !showActions) {
          console.log('LeaveRequestsList: No userId provided for user view');
          setError('User ID is required');
          setLoading(false);
          return;
        }

        const queryParams = new URLSearchParams();
        if (userId) queryParams.append('userId', userId);
        if (limit && !enablePagination) queryParams.append('limit', limit.toString());
        if (statusFilter && statusFilter !== 'all') queryParams.append('status', statusFilter);
        
        // Add pagination parameters if enabled
        if (enablePagination) {
          queryParams.append('page', (page + 1).toString());
          queryParams.append('limit', rowsPerPage.toString());
        }

        console.log('LeaveRequestsList: Fetching from:', `/api/requests?${queryParams.toString()}`);

        const response = await fetch(`/api/requests?${queryParams.toString()}`);
        console.log('LeaveRequestsList: Response status:', response.status);

        const data = await response.json();
        console.log('LeaveRequestsList: Response data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch leave requests');
        }

        if (enablePagination && data.pagination) {
          setRequests(data.requests || []);
          setTotalRequests(data.pagination.total || 0);
        } else {
          setRequests(Array.isArray(data) ? data : data.requests || []);
          setTotalRequests(Array.isArray(data) ? data.length : data.requests?.length || 0);
        }
      } catch (err) {
        console.error('LeaveRequestsList: Error fetching requests:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching leave requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId, limit, statusFilter, page, rowsPerPage, enablePagination, showActions]);

  const handleReviewRequest = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setReviewDialog({ open: true, request, action });
    setReviewNote('');
  };

  const handleCloseDialog = () => {
    setReviewDialog({ open: false, request: null, action: null });
    setReviewNote('');
  };

  const handleSubmitReview = async () => {
    if (!reviewDialog.request || !reviewDialog.action) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/requests/${reviewDialog.request.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: reviewDialog.action === 'approve' ? 'Approved' : 'Rejected',
          reviewNote: reviewNote.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to review request');
      }

      // Refresh the requests list
      const queryParams = new URLSearchParams();
      if (userId) queryParams.append('userId', userId);
      if (limit) queryParams.append('limit', limit.toString());

      const refreshResponse = await fetch(`/api/requests?${queryParams.toString()}`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setRequests(refreshData);
      }

      handleCloseDialog();
      onRequestUpdate?.();
    } catch (err) {
      console.error('Error reviewing request:', err);
      setError(err instanceof Error ? err.message : 'Failed to review request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isAdmin = (session?.user as Session['user'])?.role === 'admin';
  const canShowActions = showActions && isAdmin;
  
  // For display, use either paginated data or all data
  const displayRequests = enablePagination ? requests : requests;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (requests.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
        <Typography variant="body2" color="text.secondary">
          No leave requests found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} elevation={0}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            {canShowActions && <TableCell>Employee</TableCell>}
            <TableCell>Dates</TableCell>
            <TableCell>Days</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Reason</TableCell>
            {canShowActions && <TableCell align="center">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {displayRequests.map((request) => (
            <TableRow key={request.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {request.type}
                </Typography>
              </TableCell>
              {canShowActions && (
                <TableCell>
                  <Typography variant="body2">
                    {request.user ? `${request.user.firstName} ${request.user.lastName}` : 'Unknown'}
                  </Typography>
                  {request.user?.email && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {request.user.email}
                    </Typography>
                  )}
                </TableCell>
              )}
              <TableCell>
                <Typography variant="body2">
                  {format(new Date(`${request.startDate.split('T')[0]}T00:00:00`), 'MMM d, yyyy')}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  to {format(new Date(`${request.endDate.split('T')[0]}T00:00:00`), 'MMM d, yyyy')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {request.daysRequested || 'N/A'} days
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={request.status}
                  color={statusColors[request.status]}
                  size="small"
                />
                {request.reviewedAt && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Reviewed {format(new Date(request.reviewedAt), 'MMM d, yyyy')}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {request.reason || '-'}
                </Typography>
              </TableCell>
              {canShowActions && (
                <TableCell align="center">
                  {request.status === 'Pending' ? (
                    <ButtonGroup size="small" variant="outlined">
                      <Tooltip title="Approve Request">
                        <Button
                          color="success"
                          onClick={() => handleReviewRequest(request, 'approve')}
                        >
                          Approve
                        </Button>
                      </Tooltip>
                      <Tooltip title="Reject Request">
                        <Button
                          color="error"
                          onClick={() => handleReviewRequest(request, 'reject')}
                        >
                          Reject
                        </Button>
                      </Tooltip>
                    </ButtonGroup>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {request.status}
                    </Typography>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    {enablePagination && (
      <TablePagination
        rowsPerPageOptions={validPageSizes}
        component="div"
        count={totalRequests}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    )}

    {/* Review Dialog */}
    <Dialog
      open={reviewDialog.open}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'} Leave Request
      </DialogTitle>
      <DialogContent>
        {reviewDialog.request && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Request Details:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Employee:</strong> {reviewDialog.request.user ? 
                `${reviewDialog.request.user.firstName} ${reviewDialog.request.user.lastName}` : 'Unknown'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Type:</strong> {reviewDialog.request.type}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Dates:</strong> {format(new Date(`${reviewDialog.request.startDate.split('T')[0]}T00:00:00`), 'MMM d, yyyy')} 
              to {format(new Date(`${reviewDialog.request.endDate.split('T')[0]}T00:00:00`), 'MMM d, yyyy')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Days:</strong> {reviewDialog.request.daysRequested || 'N/A'} days
            </Typography>
            {reviewDialog.request.reason && (
              <Typography variant="body2" color="text.secondary">
                <strong>Reason:</strong> {reviewDialog.request.reason}
              </Typography>
            )}
          </Box>
        )}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Review Note (Optional)"
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          placeholder={`Add a note explaining why you ${reviewDialog.action === 'approve' ? 'approved' : 'rejected'} this request...`}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmitReview}
          variant="contained"
          color={reviewDialog.action === 'approve' ? 'success' : 'error'}
          disabled={submitting}
        >
          {submitting ? 'Processing...' : 
            (reviewDialog.action === 'approve' ? 'Approve Request' : 'Reject Request')}
        </Button>
      </DialogActions>
    </Dialog>
    </Box>
  );
};

export default LeaveRequestsList;
