export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      error: error.message,
      details: error.details,
      status: error.statusCode,
    };
  }

  console.error('Unhandled error:', error);
  return {
    error: 'Internal server error',
    status: 500,
  };
}
