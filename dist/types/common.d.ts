export interface PaginationParams {
    page?: number;
    per_page?: number;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}
export interface DateRangeParams {
    start_date?: string;
    end_date?: string;
}
export interface RequestOptionsOverride {
    headers?: Record<string, string>;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
    retryableStatusCodes?: number[];
    operationName?: string;
}
//# sourceMappingURL=common.d.ts.map