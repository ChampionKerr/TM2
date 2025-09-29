'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  SelectChangeEvent,
  Card,
  CardContent,
  Grid,
  TablePagination,
} from '@mui/material';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useRouter } from 'next/navigation';

interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface EmployeeFormData {
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  role: 'admin' | 'user';
  password: string;
}

const initialFormData: EmployeeFormData = {
  email: '',
  firstName: '',
  lastName: '',
  department: '',
  role: 'user',
  password: '',
};

export default function EmployeesPage() {
  const { data: session } = useSession() as { data: Session | null, status: 'authenticated' | 'loading' | 'unauthenticated' };
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]); // For statistics
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Define fetchEmployees before useEffect to avoid hoisting issues
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters for pagination
      const queryParams = new URLSearchParams();
      queryParams.append('page', (page + 1).toString()); // Convert to 1-based
      queryParams.append('limit', rowsPerPage.toString());
      
      const response = await fetch(`/api/employees?${queryParams.toString()}`);
      if (response.ok) {
        const responseData = await response.json();
        
        if (responseData.employees) {
          // Paginated response
          setEmployees(responseData.employees);
          setTotalEmployees(responseData.pagination?.total || 0);
        } else {
          // Non-paginated response (fallback)
          const employeesData = responseData.data || responseData;
          setEmployees(Array.isArray(employeesData) ? employeesData : []);
          setTotalEmployees(Array.isArray(employeesData) ? employeesData.length : 0);
        }
      } else {
        console.error('Failed to fetch employees:', response.statusText);
        setEmployees([]);
        setTotalEmployees(0);
        setSnackbar({
          open: true,
          message: 'Failed to fetch employees',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
      setTotalEmployees(0);
      setSnackbar({
        open: true,
        message: 'Failed to fetch employees',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    if (!session || !session.user || session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchEmployees();
    fetchAllEmployeesForStats();
  }, [session, router, page, rowsPerPage, fetchEmployees]);

  const fetchAllEmployeesForStats = async () => {
    try {
      // Fetch all employees without pagination for statistics
      const response = await fetch('/api/employees');
      if (response.ok) {
        const responseData = await response.json();
        const employeesData = responseData.employees || responseData.data || responseData;
        setAllEmployees(Array.isArray(employeesData) ? employeesData : []);
      }
    } catch (error) {
      console.error('Failed to fetch all employees for stats:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing page size
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        ...employee,
        password: '', // Don't populate password for editing
      });
    } else {
      setSelectedEmployee(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setFormData(initialFormData);
  };

  const handleOpenDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedEmployee(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    const value = e.target.value as 'admin' | 'user';
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = selectedEmployee
      ? `/api/employees/${selectedEmployee.id}`
      : '/api/employees';
    const method = selectedEmployee ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: `Employee successfully ${
            selectedEmployee ? 'updated' : 'created'
          }`,
          severity: 'success',
        });
        handleCloseDialog();
        fetchEmployees();
        fetchAllEmployeesForStats(); // Refresh stats after create/update
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (_error) {
      setSnackbar({
        open: true,
        message: `Failed to ${selectedEmployee ? 'update' : 'create'} employee`,
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Employee successfully deleted',
          severity: 'success',
        });
        handleCloseDeleteDialog();
        fetchEmployees();
        fetchAllEmployeesForStats(); // Refresh stats after delete
      } else {
        throw new Error('Failed to delete employee');
      }
    } catch (_error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete employee',
        severity: 'error',
      });
    }
  };

  return (
          <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Employee Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add Employee
        </Button>
      </Box>

      {/* Employee Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Employees
              </Typography>
              <Typography variant="h4" component="div">
                {isLoading ? '...' : allEmployees.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Admin Users
              </Typography>
              <Typography variant="h4" component="div" color="primary.main">
                {isLoading ? '...' : allEmployees.filter(emp => emp.role === 'admin').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Regular Users
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {isLoading ? '...' : allEmployees.filter(emp => emp.role === 'user').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Departments
              </Typography>
              <Typography variant="h4" component="div" color="info.main">
                {isLoading ? '...' : new Set(allEmployees.map(emp => emp.department).filter(Boolean)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography>Loading employees...</Typography>
        </Box>
      ) : employees.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No employees found
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Click &quot;Add Employee&quot; to create the first employee record
          </Typography>
        </Box>
      ) : (
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>
                    {employee.firstName} {employee.lastName}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.department || '-'}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: employee.role === 'admin' ? 'primary.light' : 'grey.200',
                        color: employee.role === 'admin' ? 'primary.contrastText' : 'text.primary',
                        display: 'inline-block',
                        fontSize: '0.875rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {employee.role}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(employee)}
                      title="Edit employee"
                    >
                      <span>✎</span>
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteDialog(employee)}
                      title="Delete employee"
                    >
                      <span>✕</span>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalEmployees}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      )}

      {/* Add/Edit Employee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleInputChange}
              disabled={!!selectedEmployee}
              sx={{ mb: 2 }}
            />
            <TextField
              name="firstName"
              label="First Name"
              fullWidth
              required
              value={formData.firstName}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              name="lastName"
              label="Last Name"
              fullWidth
              required
              value={formData.lastName}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              name="department"
              label="Department"
              fullWidth
              value={formData.department}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleRoleChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="password"
              label={selectedEmployee ? 'New Password' : 'Password'}
              type="password"
              fullWidth
              required={!selectedEmployee}
              value={formData.password}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedEmployee ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedEmployee?.firstName}{' '}
            {selectedEmployee?.lastName}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
