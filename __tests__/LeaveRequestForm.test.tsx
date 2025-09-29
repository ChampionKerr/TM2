import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LeaveRequestForm from '../components/LeaveRequestForm';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Wrap component with LocalizationProvider for date picker
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {ui}
    </LocalizationProvider>
  );
};

describe('LeaveRequestForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    renderWithProviders(<LeaveRequestForm onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('combobox', { name: /leave type/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /start date/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /end date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /reason/i })).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    mockOnSubmit.mockImplementation(() => Promise.resolve());
    
    renderWithProviders(<LeaveRequestForm onSubmit={mockOnSubmit} />);

    // Fill form
    fireEvent.change(screen.getByRole('textbox', { name: /reason/i }), {
      target: { value: 'Vacation' },
    });

    // Submit form
    await fireEvent.click(screen.getByRole('button', { name: /submit request/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      type: 'Annual',
      reason: 'Vacation',
    }));
  });

  it('shows reset functionality', () => {
    renderWithProviders(<LeaveRequestForm onSubmit={mockOnSubmit} />);

    // Fill in reason field
    const reasonField = screen.getByRole('textbox', { name: /reason/i });
    fireEvent.change(reasonField, {
      target: { value: 'Test reason' },
    });

    // Click reset button
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    // Check reason field is empty
    expect(reasonField).toHaveValue('');
  });
});
