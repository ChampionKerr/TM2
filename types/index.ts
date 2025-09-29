export enum LeaveType {
  Annual = 'Annual',
  Sick = 'Sick',
  Unpaid = 'Unpaid',
  Other = 'Other'
}

export enum LeaveStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export interface LeaveRequest {
  id?: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  status?: LeaveStatus;
  requestedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  role: 'admin' | 'user';
  emailVerified?: Date;
}
