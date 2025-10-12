export declare class KnowrithmAPIError extends Error {
    statusCode?: number;
    responseData?: Record<string, any>;
    errorCode?: string;
    constructor(message: string, statusCode?: number, responseData?: Record<string, any>, errorCode?: string);
    toString(): string;
}
//# sourceMappingURL=errors.d.ts.map