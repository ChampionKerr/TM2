import { GET, POST } from '../app/api/employees/route';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock NextRequest
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation(function(this: any, url: string, options: { body: string }) {
    this.json = async () => JSON.parse(options.body);
  }),
  NextResponse: {
    json: jest.fn((data: any, options?: { status?: number }) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

// Mock next-auth
jest.mock('next-auth/next');
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

describe('Employee API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/employees', () => {
    it('returns 403 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const mockRequest = {} as NextRequest;
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 403 when user is not admin', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'user' },
        expires: new Date().toISOString(),
      });

      const mockRequest = {} as NextRequest;
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

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

      const mockRequest = {} as NextRequest;
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockEmployees);
    });

    it('returns 500 on database error', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'admin' },
        expires: new Date().toISOString(),
      });

      (prisma.user.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const mockRequest = {} as NextRequest;
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch employees' });
    });
  });

  describe('POST /api/employees', () => {
    const validEmployeeData = {
      email: 'newuser@example.com',
      firstName: 'New',
      lastName: 'User',
      department: 'IT',
      role: 'user',
      password: 'password123',
    };

    function createMockRequest(body: any): NextRequest {
      return new NextRequest('http://localhost/api/employees', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }

    it('returns 403 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const response = await POST(createMockRequest(validEmployeeData));
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 403 when user is not admin', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'user' },
        expires: new Date().toISOString(),
      });

      const response = await POST(createMockRequest(validEmployeeData));
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 400 for invalid data', async () => {
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

      const response = await POST(createMockRequest(invalidData));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('returns 400 when email already exists', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'admin' },
        expires: new Date().toISOString(),
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: validEmployeeData.email,
      });

      const response = await POST(createMockRequest(validEmployeeData));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Email already exists' });
    });

    it('returns 201 with employee data when successfully created', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'admin' },
        expires: new Date().toISOString(),
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const { password, ...employeeWithoutPassword } = validEmployeeData;
      const createdEmployee = {
        id: '1',
        ...employeeWithoutPassword,
        createdAt: new Date(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValueOnce(createdEmployee);

      const response = await POST(createMockRequest(validEmployeeData));
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdEmployee);
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

    it('returns 500 on database error during creation', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { role: 'admin' },
        expires: new Date().toISOString(),
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const response = await POST(createMockRequest(validEmployeeData));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create employee' });
    });
  });
});
