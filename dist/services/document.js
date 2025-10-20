"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
// src/services/document.ts
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
class DocumentService {
    constructor(client) {
        this.client = client;
    }
    async uploadDocuments(agentId, options = {}, headers) {
        const { filePaths = [], files = [], urls, url, metadata } = options;
        const payload = { agent_id: agentId };
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
        const descriptors = [...files];
        for (const filePath of filePaths) {
            try {
                const fileBuffer = await fs_1.promises.readFile(filePath);
                descriptors.push({
                    data: fileBuffer,
                    filename: path_1.default.basename(filePath),
                });
            }
            catch (error) {
                const reason = error instanceof Error ? error.message : String(error);
                throw new Error(`Failed to read document at path "${filePath}": ${reason}`);
            }
        }
        const normalizedFiles = descriptors.length > 0
            ? descriptors.map(({ data, filename, fieldName }) => ({
                name: fieldName ?? 'files',
                file: data,
                filename: filename ??
                    (typeof File !== 'undefined' && data instanceof File ? data.name : undefined),
            }))
            : undefined;
        return this.client.makeRequest('POST', '/document/upload', {
            data: payload,
            files: normalizedFiles,
            headers,
        });
    }
    async listDocuments(params, headers) {
        return this.client.makeRequest('GET', '/document', { params, headers });
    }
    async listDeletedDocuments(headers) {
        return this.client.makeRequest('GET', '/document/deleted', { headers });
    }
    async listDeletedChunks(headers) {
        return this.client.makeRequest('GET', '/document/chunk/deleted', { headers });
    }
    async deleteDocument(documentId, headers) {
        return this.client.makeRequest('DELETE', `/document/${documentId}`, { headers });
    }
    async restoreDocument(documentId, headers) {
        return this.client.makeRequest('PATCH', `/document/${documentId}/restore`, { headers });
    }
    async deleteDocumentChunk(chunkId, headers) {
        return this.client.makeRequest('DELETE', `/document/chunk/${chunkId}`, { headers });
    }
    async restoreDocumentChunk(chunkId, headers) {
        return this.client.makeRequest('PATCH', `/document/chunk/${chunkId}/restore`, { headers });
    }
    async deleteDocumentChunks(documentId, headers) {
        return this.client.makeRequest('DELETE', `/document/${documentId}/chunk`, { headers });
    }
    async restoreAllDocumentChunks(documentId, headers) {
        return this.client.makeRequest('PATCH', `/document/${documentId}/chunk/restore-all`, { headers });
    }
    async bulkDeleteDocuments(documentIds, headers) {
        return this.client.makeRequest('DELETE', '/document/bulk-delete', {
            data: { document_ids: documentIds },
            headers,
        });
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.js.map