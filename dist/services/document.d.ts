import { KnowrithmClient } from '../client';
import { UploadDocumentsOptions, UploadDocumentsResponse, UploadDocumentsRequestOptions } from '../types/document';
type RequestOptionsInput = UploadDocumentsRequestOptions | Record<string, string> | undefined;
export declare class DocumentService {
    private client;
    constructor(client: KnowrithmClient);
    uploadDocuments(agentId: string, options?: UploadDocumentsOptions, requestOptions?: RequestOptionsInput): Promise<UploadDocumentsResponse>;
    listDocuments(params?: {
        page?: number;
        per_page?: number;
        status?: string;
    }, requestOptions?: RequestOptionsInput): Promise<any>;
    listDeletedDocuments(requestOptions?: RequestOptionsInput): Promise<any>;
    listDeletedChunks(requestOptions?: RequestOptionsInput): Promise<any>;
    deleteDocument(documentId: string, requestOptions?: RequestOptionsInput): Promise<any>;
    restoreDocument(documentId: string, requestOptions?: RequestOptionsInput): Promise<any>;
    deleteDocumentChunk(chunkId: string, requestOptions?: RequestOptionsInput): Promise<any>;
    restoreDocumentChunk(chunkId: string, requestOptions?: RequestOptionsInput): Promise<any>;
    deleteDocumentChunks(documentId: string, requestOptions?: RequestOptionsInput): Promise<any>;
    restoreAllDocumentChunks(documentId: string, requestOptions?: RequestOptionsInput): Promise<any>;
    bulkDeleteDocuments(documentIds: string[], requestOptions?: RequestOptionsInput): Promise<any>;
}
export {};
//# sourceMappingURL=document.d.ts.map