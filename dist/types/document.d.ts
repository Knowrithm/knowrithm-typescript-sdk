import { RequestOptionsOverride } from './common';
export interface UploadedDocument {
    id: string;
    original_filename: string;
    status: string;
    file_size?: number;
    created_at?: string;
    [key: string]: unknown;
}
export interface UploadDocumentsResponse {
    success?: boolean;
    documents_processed?: number;
    documents_failed?: number;
    total_submitted?: number;
    task_ids?: string[];
    documents?: UploadedDocument[];
    errors?: string[];
    errors_count?: number;
    error_summary?: Record<string, number>;
    error?: string;
    msg?: string;
    [key: string]: unknown;
}
export interface UploadDocumentsFileDescriptor {
    /**
     * Data for a file upload. Supports File/Blob from browser contexts and Buffer/ArrayBuffer in Node.
     */
    data: File | Blob | Buffer | ArrayBuffer | ArrayBufferView | NodeJS.ReadableStream;
    /**
     * Explicit filename for the upload. Defaults to the descriptor key or a generated name when omitted.
     */
    filename?: string;
    /**
     * Field name to use when appending to FormData. Defaults to `files` to match API expectations.
     */
    fieldName?: string;
}
export interface UploadDocumentsLegacyFileDescriptor {
    file: File | Blob | Buffer | ArrayBuffer | ArrayBufferView | NodeJS.ReadableStream;
    filename?: string;
    fieldName?: string;
}
export interface UploadDocumentsOptions {
    /**
     * Local filesystem paths that should be read and uploaded.
     */
    filePaths?: Array<string | UploadDocumentsLegacyFileDescriptor>;
    /**
     * Pre-loaded file descriptors for advanced usage (e.g., buffers in memory).
     */
    files?: UploadDocumentsFileDescriptor[];
    /**
     * Single remote URL to enqueue for ingestion.
     */
    url?: string;
    /**
     * List of remote URLs to enqueue for ingestion.
     */
    urls?: string[];
    /**
     * Arbitrary metadata to forward with the upload request.
     */
    metadata?: Record<string, unknown>;
}
export type UploadDocumentsRequestOptions = RequestOptionsOverride;
//# sourceMappingURL=document.d.ts.map