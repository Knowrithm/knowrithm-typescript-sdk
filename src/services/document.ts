// src/services/document.ts
import path from 'path';
import { promises as fs } from 'fs';
import { KnowrithmClient } from '../client';
import {
  UploadDocumentsOptions,
  UploadDocumentsResponse,
  UploadDocumentsFileDescriptor,
} from '../types/document';

export class DocumentService {
  constructor(private client: KnowrithmClient) {}

  async uploadDocuments(
    agentId: string,
    options: UploadDocumentsOptions = {},
    headers?: Record<string, string>
  ): Promise<UploadDocumentsResponse> {
    const { filePaths = [], files = [], urls, url, metadata } = options;

    const payload: Record<string, unknown> = { agent_id: agentId };

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined) {
          payload[key] = value;
        }
      });
    }

    if (urls && urls.length > 0) {
      payload.urls = urls;
    }

    if (url) {
      payload.url = url;
    }

    const descriptors: UploadDocumentsFileDescriptor[] = [...files];

    for (const filePath of filePaths) {
      try {
        if (typeof filePath === 'string') {
          const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
          const fileBuffer = await fs.readFile(resolvedPath);
          descriptors.push({
            data: fileBuffer,
            filename: path.basename(resolvedPath),
          });
        } else if (filePath && typeof filePath === 'object' && 'file' in filePath) {
          // Backwards compatibility for legacy SDK shape
          descriptors.push({
            data: filePath.file,
            filename: filePath.filename,
            fieldName: filePath.fieldName ?? 'files',
          });
        } else {
          throw new Error('Unsupported file descriptor in filePaths array.');
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        const inputDescription =
          typeof filePath === 'string'
            ? filePath
            : filePath?.filename ?? '[inline file]';
        throw new Error(`Failed to read document at path "${inputDescription}": ${reason}`);
      }
    }

    const normalizedFiles =
      descriptors.length > 0
        ? descriptors.map(({ data, filename, fieldName }) => ({
            name: fieldName ?? 'files',
            file: data,
            filename:
              filename ??
              (typeof File !== 'undefined' && data instanceof File ? data.name : undefined),
          }))
        : undefined;

    return this.client.makeRequest<UploadDocumentsResponse>('POST', '/document/upload', {
      data: payload,
      files: normalizedFiles,
      headers,
    });
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
