import { AppError } from "@/lib/errors";

export interface PaginationResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export abstract class BaseService {
  /**
   * Get validation pagination params.
   * This validates both page and pageSize, returning limit, offset, and page number
   * @param page - The current page number (default is 1).
   * @param pageSize - The number of items per page (default is 10).
   */
  protected getPaginationParams(page: number = 1, pageSize: number = 10) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(pageSize, 100));
    const offset = (safePage - 1) * safeLimit;

    return {
      limit: safeLimit,
      offset,
      page: safePage,
    };
  }
  /**
   * Helper method to paginate results from a data query and a count query.
   * @param dataQuery - A promise that resolves to an array of data items.
   * @param countQuery - A promise that resolves to an object containing the total count of items.
   * @param page - The current page number (default is 1).
   * @param pageSize - The number of items per page (default is 20).
   * @returns A promise that resolves to a PaginationResult object containing the paginated data and metadata.
   */
  protected async paginate<T>(
    dataQuery: Promise<T[]>,
    countQuery: Promise<{ total: number }>,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginationResult<T>> {
    if (pageSize <= 0) {
      throw new AppError("Page size must be greater than 0", 400);
    }
    if (page <= 0) {
      throw new AppError("Page must be greater than 0", 400);
    }
    const [data, countResult] = await Promise.all([dataQuery, countQuery]);
    const total = countResult?.total ?? 0;
    return {
      data,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
