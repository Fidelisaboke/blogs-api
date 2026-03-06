import { count } from "drizzle-orm";
import { db } from "@/db";

export interface PaginationResult<T> {
    data: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export abstract class BaseService {
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
        pageSize: number = 20
    ): Promise<PaginationResult<T>> {
        if (pageSize <= 0) {
            throw new Error('Page size must be greater than 0');
        }
        if (page <= 0) {
            throw new Error('Page must be greater than 0');
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