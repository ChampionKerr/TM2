import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export type PaginatedResponse<T> = {
  data: T[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export async function paginate<T>(
  items: T[],
  params: PaginationParams
): Promise<PaginatedResponse<T>> {
  const { page, limit } = params;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedItems = items.slice(startIndex, endIndex);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: paginatedItems,
    metadata: {
      currentPage: page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
