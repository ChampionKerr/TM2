import { createRequest } from '../__mocks__/next-request'
import { GET, POST } from '../app/api/requests/route'
import * as leaveRequestService from '../lib/services/leave-request'

jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), init);
    }
  }
}));

jest.mock('../lib/services/leave-request')

describe('Leave Request API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/requests', () => {
    it('should return list of leave requests', async () => {
      const mockDate = '2024-04-01T00:00:00.000Z';
      const mockLeaveRequests = [
        { 
          id: '1', 
          employeeId: '1', 
          startDate: mockDate,
          endDate: mockDate,
          status: 'Pending'
        }
      ]

      jest.spyOn(leaveRequestService, 'listLeaveRequests').mockResolvedValue({
        success: true,
        data: mockLeaveRequests
      })

      const req = createRequest({
        method: 'GET',
        url: '/api/requests'
      })

      const res = await GET(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual(mockLeaveRequests)
      expect(leaveRequestService.listLeaveRequests).toHaveBeenCalled()
    })
  })

  describe('POST /api/requests', () => {
    it('should create a new leave request', async () => {
      const mockRequest = {
        type: 'Annual',
        startDate: '2024-04-01',
        endDate: '2024-04-05',
        reason: 'Vacation'
      }

      const mockCreatedRequest = {
        id: '1',
        ...mockRequest,
        status: 'Pending',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId: expect.any(String)
      }

      jest.spyOn(leaveRequestService, 'createLeaveRequest').mockResolvedValue({
        success: true,
        data: mockCreatedRequest
      })

      const req = createRequest({
        method: 'POST',
        url: '/api/requests',
        body: mockRequest
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data).toEqual(mockCreatedRequest)
      expect(leaveRequestService.createLeaveRequest).toHaveBeenCalledWith(mockRequest)
    })

    it('should return 400 for invalid request', async () => {
      const mockRequest = {
        type: 'Invalid',
        startDate: 'invalid-date',
        endDate: '2024-04-05',
        reason: ''
      }

      jest.spyOn(leaveRequestService, 'createLeaveRequest').mockResolvedValue({
        success: false,
        error: 'Invalid request data'
      })

      const req = createRequest({
        method: 'POST',
        url: '/api/requests',
        body: mockRequest
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('should return 403 for unauthorized request', async () => {
      const mockRequest = {
        type: 'Annual',
        startDate: '2024-04-01',
        endDate: '2024-04-05',
        reason: 'Vacation'
      }

      jest.spyOn(leaveRequestService, 'createLeaveRequest').mockResolvedValue({
        success: false,
        error: 'Unauthorized'
      })

      const req = createRequest({
        method: 'POST',
        url: '/api/requests',
        body: mockRequest
      })

      const res = await POST(req)
      expect(res.status).toBe(403)
    })
  })
})
