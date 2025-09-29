import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { 
  listLeaveRequests, 
  createLeaveRequest, 
  updateLeaveRequestStatus 
} from '@/lib/services/leave-request';

// Mock next-auth
jest.mock('next-auth/next');
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    leaveRequest: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Leave Request Service', () => {
  const regularUser = {
    id: 'user1',
    role: 'user',
  };

  const adminUser = {
    id: 'admin1',
    role: 'admin',
  };

  const mockLeaveRequest = {
    id: '1',
    userId: 'user1',
    type: 'Annual',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2025-10-05'),
    reason: 'Vacation',
    status: 'Pending',
    requestedAt: new Date(),
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listLeaveRequests', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const result = await listLeaveRequests();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.leaveRequest.findMany).not.toHaveBeenCalled();
    });

    it('returns only user\'s requests for regular users', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: regularUser,
        expires: new Date().toISOString(),
      });

      (prisma.leaveRequest.findMany as jest.Mock).mockResolvedValueOnce([mockLeaveRequest]);

      const result = await listLeaveRequests();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockLeaveRequest]);
      expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith({
        where: { userId: regularUser.id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('returns all requests for admin users', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: adminUser,
        expires: new Date().toISOString(),
      });

      (prisma.leaveRequest.findMany as jest.Mock).mockResolvedValueOnce([mockLeaveRequest]);

      const result = await listLeaveRequests();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockLeaveRequest]);
      expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('returns error when database query fails', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: regularUser,
        expires: new Date().toISOString(),
      });

      (prisma.leaveRequest.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const result = await listLeaveRequests();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch leave requests');
    });
  });

  describe('createLeaveRequest', () => {
    const validRequestData = {
      startDate: '2025-10-01',
      endDate: '2025-10-05',
      type: 'Annual' as const,
      reason: 'Taking a vacation',
    };

    it('returns error when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const result = await createLeaveRequest(validRequestData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.leaveRequest.create).not.toHaveBeenCalled();
    });

    it('creates request when data is valid', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: regularUser,
        expires: new Date().toISOString(),
      });

      (prisma.leaveRequest.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (prisma.leaveRequest.create as jest.Mock).mockResolvedValueOnce(mockLeaveRequest);

      const result = await createLeaveRequest(validRequestData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLeaveRequest);
      expect(prisma.leaveRequest.create).toHaveBeenCalled();
    });

    it('returns error when dates are invalid', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: regularUser,
        expires: new Date().toISOString(),
      });

      const invalidData = {
        ...validRequestData,
        startDate: '2025-10-05',
        endDate: '2025-10-01',
      };

      const result = await createLeaveRequest(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Start date must be before end date');
      expect(prisma.leaveRequest.create).not.toHaveBeenCalled();
    });

    it('returns error when dates are in the past', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: regularUser,
        expires: new Date().toISOString(),
      });

      const pastData = {
        ...validRequestData,
        startDate: '2020-01-01',
        endDate: '2020-01-05',
      };

      const result = await createLeaveRequest(pastData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Start date cannot be in the past');
      expect(prisma.leaveRequest.create).not.toHaveBeenCalled();
    });

    it('returns error when there are overlapping requests', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: regularUser,
        expires: new Date().toISOString(),
      });

      (prisma.leaveRequest.findFirst as jest.Mock).mockResolvedValueOnce(mockLeaveRequest);

      const result = await createLeaveRequest(validRequestData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You have overlapping leave requests for these dates');
      expect(prisma.leaveRequest.create).not.toHaveBeenCalled();
    });
  });

  describe('updateLeaveRequestStatus', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const result = await updateLeaveRequestStatus('1', 'Approved');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.leaveRequest.update).not.toHaveBeenCalled();
    });

    it('returns error when user is not admin', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: regularUser,
        expires: new Date().toISOString(),
      });

      const result = await updateLeaveRequestStatus('1', 'Approved');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.leaveRequest.update).not.toHaveBeenCalled();
    });

    it('updates request status when admin approves', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: adminUser,
        expires: new Date().toISOString(),
      });

      const updatedRequest = { ...mockLeaveRequest, status: 'Approved' };
      (prisma.leaveRequest.update as jest.Mock).mockResolvedValueOnce(updatedRequest);

      const result = await updateLeaveRequestStatus('1', 'Approved', 'Approved by admin');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedRequest);
      expect(prisma.leaveRequest.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: 'Approved',
          adminComment: 'Approved by admin',
          reviewedAt: expect.any(Date),
          reviewedBy: adminUser.id,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    });

    it('updates request status when admin rejects', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: adminUser,
        expires: new Date().toISOString(),
      });

      const updatedRequest = { ...mockLeaveRequest, status: 'Rejected' };
      (prisma.leaveRequest.update as jest.Mock).mockResolvedValueOnce(updatedRequest);

      const result = await updateLeaveRequestStatus('1', 'Rejected', 'Not enough resources');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedRequest);
      expect(prisma.leaveRequest.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: 'Rejected',
          adminComment: 'Not enough resources',
          reviewedAt: expect.any(Date),
          reviewedBy: adminUser.id,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    });

    it('returns error when update fails', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: adminUser,
        expires: new Date().toISOString(),
      });

      (prisma.leaveRequest.update as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const result = await updateLeaveRequestStatus('1', 'Approved');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update leave request');
    });
  });
});
