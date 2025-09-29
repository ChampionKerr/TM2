import { LeaveRequest } from '@prisma/client';

// Define Employee type if not present in @prisma/client
export type Employee = {
  id: number;
  name: string;
  // Add other fields as per your schema
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  details?: unknown;
};

export type EmployeeResponse = ApiResponse<Employee>;
export type EmployeesResponse = ApiResponse<Employee[]>;
export type LeaveRequestResponse = ApiResponse<LeaveRequest>;
export type LeaveRequestsResponse = ApiResponse<LeaveRequest[]>;

export type ValidationError = {
  code: 'VALIDATION_ERROR';
  message: string;
  errors: Array<{
    path: string[];
    message: string;
  }>;
};
