import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeesPage from '../app/employees/page';
import { useSession } from 'next-auth/react';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockEmployees = [
  {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    department: 'IT',
    role: 'user',
    createdAt: '2025-09-12T00:00:00.000Z',
  },
];

describe('EmployeesPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
    
    // Mock fetch for API calls
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/employees') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockEmployees, total: 1 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    // Mock session as admin
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'admin' } },
      status: 'authenticated',
    });
  });

  it('renders employees table and add button', async () => {
    render(<EmployeesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/employees/i)).toBeInTheDocument();
      expect(screen.getByText(/add employee/i)).toBeInTheDocument();
    });
  });

  it('loads and displays employees', async () => {
    render(<EmployeesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/it/i)).toBeInTheDocument();
    });
  });

  it('opens add employee dialog', async () => {
    render(<EmployeesPage />);
    
    // Wait for loading to finish and add button to be rendered
    await screen.findByRole('button', { name: /add employee/i });

    // Click add button
    fireEvent.click(screen.getByRole('button', { name: /add employee/i }));

    // Wait for dialog fields
    const dialogTitle = await screen.findByRole('heading', { name: /add employee/i });
    const emailInput = await screen.findByLabelText(/email/i);
    const firstNameInput = await screen.findByLabelText(/first name/i);
    const lastNameInput = await screen.findByLabelText(/last name/i);

    expect(dialogTitle).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();
  });

  it('redirects non-admin users to dashboard', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'user' } },
      status: 'authenticated',
    });

    render(<EmployeesPage />);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles employee creation', async () => {
    const mockFetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/employees') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockEmployees, total: 1 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '2', email: 'jane@example.com' }),
      });
    });

    global.fetch = mockFetch;

    render(<EmployeesPage />);
    
    // Wait for the page to load
    await screen.findByRole('heading', { name: /employees/i });

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Click add button
    const addButton = await screen.findByRole('button', { name: /add employee/i });
    fireEvent.click(addButton);

    // Wait for dialog
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Fill form
    const emailInput = await screen.findByLabelText(/email/i);
    const firstNameInput = await screen.findByLabelText(/first name/i);
    const lastNameInput = await screen.findByLabelText(/last name/i);
    const passwordInput = await screen.findByLabelText(/(password|new password)/i);

    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    const submitButton = await screen.findByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/employee successfully created/i)).toBeInTheDocument();
    });

    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith('/api/employees', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String),
    }));
  });

  it('handles employee deletion', async () => {
    const mockFetch = jest.fn().mockImplementation((url, options) => {
      if (url.includes('/api/employees/1') && options?.method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockEmployees, total: 1 }),
      });
    });

    global.fetch = mockFetch;

    render(<EmployeesPage />);
    
    // Wait for employees to load
    await screen.findByText(/john doe/i);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Find and click delete button
    const deleteButton = screen.getByRole('button', { name: /✕/i });
    fireEvent.click(deleteButton);

    // Wait for and click confirm button
    const confirmButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/employee successfully deleted/i)).toBeInTheDocument();
    });

    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith('/api/employees/1', {
      method: 'DELETE'
    });
  });
});
