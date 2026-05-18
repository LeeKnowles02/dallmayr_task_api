import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParseResult {
  success: true;
  data: PaginationQuery;
}

export interface PaginationParseError {
  success: false;
  errors: Record<string, string[] | undefined>;
}

export function parsePagination(
  query: unknown
): PaginationParseResult | PaginationParseError {
  const result = paginationSchema.safeParse(query);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
