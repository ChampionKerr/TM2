import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { listEmployees, createEmployee } from '@/lib/services/employee';

// Mock next-auth
jest.mock('next-auth/next');
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Employee Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listEmployees', () => {
    it('returns employee list when admin is authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'admin' },
        expires: new Date().toISOString(),
      });

      const mockEmployees = [
        {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          department: 'IT',
          role: 'user',
          createdAt: new Date(),
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValueOnce(mockEmployees);

      const result = await listEmployees();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEmployees);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          department: true,
          role: true,
          createdAt: true,
        },
      });
    });

    it('returns error when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const result = await listEmployees();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('returns error when user is not admin', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'user' },
        expires: new Date().toISOString(),
      });

      const result = await listEmployees();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('returns error when database query fails', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'admin' },
        expires: new Date().toISOString(),
      });

      (prisma.user.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const result = await listEmployees();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch employees');
    });
  });

  describe('createEmployee', () => {
    const validEmployeeData = {
      email: 'newuser@example.com',
      firstName: 'New',
      lastName: 'User',
      department: 'IT',
      role: 'user' as const,
      password: 'password123',
    };

    it('creates employee when admin is authenticated and data is valid', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'admin' },
        expires: new Date().toISOString(),
      });

      const createdEmployee = {
        id: '1',
        ...validEmployeeData,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockResolvedValueOnce(createdEmployee);

      const result = await createEmployee(validEmployeeData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdEmployee);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: validEmployeeData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          department: true,
          role: true,
          createdAt: true,
        },
      });
    });

    it('returns error when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const result = await createEmployee(validEmployeeData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('returns error when user is not admin', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'user' },
        expires: new Date().toISOString(),
      });

      const result = await createEmployee(validEmployeeData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('returns error when email already exists', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'admin' },
        expires: new Date().toISOString(),
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: validEmployeeData.email,
      });

      const result = await createEmployee(validEmployeeData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('returns error when database creation fails', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'admin' },
        expires: new Date().toISOString(),
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const result = await createEmployee(validEmployeeData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create employee');
    });

    it('returns validation error for invalid data', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'admin' },
        expires: new Date().toISOString(),
      });

      const invalidData = {
        email: 'invalid-email',
        firstName: '',
        lastName: '',
        role: 'invalid-role',
      };

      const result = await createEmployee(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });
});
