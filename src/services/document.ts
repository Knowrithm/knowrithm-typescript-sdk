// src/services/document.ts
import { KnowrithmClient } from '../client';

export class DocumentService {
  constructor(private client: KnowrithmClient) {}

  async uploadDocuments(
    agentId: string,
    options?: {
      filePaths?: Array<{ file: File | Buffer; filename: string }>;
      urls?: string[];
      url?: string;
      metadata?: Record<string, any>;
    },
    headers?: Record<string, string>
  ): Promise<any> {
    const { filePaths, urls, url, metadata } = options || {};

    if (filePaths && filePaths.length > 0) {
      const data: any = { agent_id: agentId, ...metadata };
      if (urls) data.urls = urls;
      if (url) data.url = url;

      const files = filePaths.map(({ file, filename }) => ({
        name: 'files',
        file,
        filename,
      }));

      return this.client.makeRequest('POST', '/document/upload', { data, files, headers });
    } else {
      const data: any = { agent_id: agentId, ...metadata };
      if (urls) data.urls = urls;
      if (url) data.url = url;

      return this.client.makeRequest('POST', '/document/upload', { data, headers });
    }
  }

  async listDocuments(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/document', { params, headers });
  }

  async listDeletedDocuments(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/document/deleted', { headers });
  }

  async listDeletedChunks(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/document/chunk/deleted', { headers });
  }

  async deleteDocument(documentId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/document/${documentId}`, { headers });
  }

  async restoreDocument(documentId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('PATCH', `/document/${documentId}/restore`, { headers });
  }

  async deleteDocumentChunk(chunkId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/document/chunk/${chunkId}`, { headers });
  }

  async restoreDocumentChunk(chunkId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('PATCH', `/document/chunk/${chunkId}/restore`, { headers });
  }

  async deleteDocumentChunks(documentId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/document/${documentId}/chunk`, { headers });
  }

  async restoreAllDocumentChunks(documentId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('PATCH', `/document/${documentId}/chunk/restore-all`, { headers });
  }

  async bulkDeleteDocuments(documentIds: string[], headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', '/document/bulk-delete', {
      data: { document_ids: documentIds },
      headers,
    });
  }
}
