# Timewise HRMS API Documentation

This document provides detailed information about the Timewise HRMS API endpoints.

## Authentication

All API routes require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Rate Limiting

API requests are limited to 100 requests per IP address per 15-minute window.

## Endpoints

### Employees

#### GET /api/employees

Get all employees.

**Response**

```json
[
  {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "department": "IT",
    "role": "user"
  }
]
```

#### POST /api/employees

Create a new employee.

**Request Body**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "department": "IT",
  "role": "user"
}
```

### Leave Requests

#### GET /api/requests

Get all leave requests.

**Query Parameters**

- status: Filter by status (Pending/Approved/Rejected)
- employeeId: Filter by employee

**Response**

```json
[
  {
    "id": "uuid",
    "employeeId": "uuid",
    "type": "Annual",
    "startDate": "2025-09-15T00:00:00.000Z",
    "endDate": "2025-09-16T00:00:00.000Z",
    "reason": "Vacation",
    "status": "Pending"
  }
]
```

#### POST /api/requests

Create a new leave request.

**Request Body**

```json
{
  "employeeId": "uuid",
  "type": "Annual",
  "startDate": "2025-09-15T00:00:00.000Z",
  "endDate": "2025-09-16T00:00:00.000Z",
  "reason": "Vacation"
}
```

## Error Responses

All endpoints may return these error responses:

- 400 Bad Request: Invalid input data
- 401 Unauthorized: Missing or invalid authentication
- 403 Forbidden: Insufficient permissions
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server-side error

## Data Models

### Employee

```typescript
interface Employee {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}
```

### LeaveRequest

```typescript
interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "Annual" | "Sick" | "Unpaid" | "Other";
  startDate: string;
  endDate: string;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
```
