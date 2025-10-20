import { KnowrithmClient } from '../client';
import { UploadDocumentsOptions, UploadDocumentsResponse } from '../types/document';
export declare class DocumentService {
    private client;
    constructor(client: KnowrithmClient);
    uploadDocuments(agentId: string, options?: UploadDocumentsOptions, headers?: Record<string, string>): Promise<UploadDocumentsResponse>;
    listDocuments(params?: {
        page?: number;
        per_page?: number;
        status?: string;
    }, headers?: Record<string, string>): Promise<any>;
    listDeletedDocuments(headers?: Record<string, string>): Promise<any>;
    listDeletedChunks(headers?: Record<string, string>): Promise<any>;
    deleteDocument(documentId: string, headers?: Record<string, string>): Promise<any>;
    restoreDocument(documentId: string, headers?: Record<string, string>): Promise<any>;
    deleteDocumentChunk(chunkId: string, headers?: Record<string, string>): Promise<any>;
    restoreDocumentChunk(chunkId: string, headers?: Record<string, string>): Promise<any>;
    deleteDocumentChunks(documentId: string, headers?: Record<string, string>): Promise<any>;
    restoreAllDocumentChunks(documentId: string, headers?: Record<string, string>): Promise<any>;
    bulkDeleteDocuments(documentIds: string[], headers?: Record<string, string>): Promise<any>;
}
//# sourceMappingURL=document.d.ts.map