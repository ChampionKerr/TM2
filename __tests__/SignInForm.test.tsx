import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignInForm from '../app/signin/SignInForm';
import { signIn } from 'next-auth/react';

const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
};

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders sign in form', () => {
    render(<SignInForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles sign in submission', async () => {
    render(<SignInForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
        callbackUrl: '/dashboard'
      });
    });
  });

  it('displays validation errors for empty fields', async () => {
    render(<SignInForm />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument();
    });
  });

  it('displays error message on failed sign in', async () => {
    (signIn as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({ error: 'CredentialsSignin' })
    );

    render(<SignInForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('handles successful sign in with URL redirection', async () => {
    (signIn as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({ url: '/custom-redirect' })
    );

    render(<SignInForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/custom-redirect');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('handles sign in errors other than credentials', async () => {
    (signIn as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({ error: 'OtherError' })
    );

    render(<SignInForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/an error occurred during sign in/i)).toBeInTheDocument();
    });
  });

  it('handles network or other errors', async () => {
    (signIn as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    render(<SignInForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/an error occurred. please try again./i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    (signIn as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<SignInForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('renders forgot password link', () => {
    render(<SignInForm />);
    
    const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password');
  });
});
