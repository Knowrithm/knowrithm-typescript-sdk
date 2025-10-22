"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
// src/services/document.ts
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const isHeadersRecord = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    return Object.values(value).every((entry) => typeof entry === 'string');
};
const normalizeRequestOptions = (overrides) => {
    if (!overrides) {
        return {};
    }
    if (isHeadersRecord(overrides)) {
        return { headers: overrides };
    }
    return overrides;
};
class DocumentService {
    constructor(client) {
        this.client = client;
    }
    async uploadDocuments(agentId, options = {}, requestOptions) {
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
                if (typeof filePath === 'string') {
                    const resolvedPath = path_1.default.isAbsolute(filePath) ? filePath : path_1.default.resolve(filePath);
                    const fileBuffer = await fs_1.promises.readFile(resolvedPath);
                    descriptors.push({
                        data: fileBuffer,
                        filename: path_1.default.basename(resolvedPath),
                    });
                }
                else if (filePath && typeof filePath === 'object' && 'file' in filePath) {
                    // Backwards compatibility for legacy SDK shape
                    descriptors.push({
                        data: filePath.file,
                        filename: filePath.filename,
                        fieldName: filePath.fieldName ?? 'files',
                    });
                }
                else {
                    throw new Error('Unsupported file descriptor in filePaths array.');
                }
            }
            catch (error) {
                const reason = error instanceof Error ? error.message : String(error);
                const inputDescription = typeof filePath === 'string'
                    ? filePath
                    : filePath?.filename ?? '[inline file]';
                throw new Error(`Failed to read document at path "${inputDescription}": ${reason}`);
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
        const resolvedRequestOptions = normalizeRequestOptions(requestOptions);
        const { headers, ...requestOverrides } = resolvedRequestOptions;
        return this.client.makeRequest('POST', '/document/upload', {
            data: payload,
            files: normalizedFiles,
            headers,
            ...requestOverrides,
        });
    }
    async listDocuments(params, requestOptions) {
        const resolvedRequestOptions = normalizeRequestOptions(requestOptions);
        const { headers, ...requestOverrides } = resolvedRequestOptions;
        return this.client.makeRequest('GET', '/document', {
            params,
            headers,
            ...requestOverrides,
        });
    }
    async listDeletedDocuments(requestOptions) {
        const resolvedRequestOptions = normalizeRequestOptions(requestOptions);
        const { headers, ...requestOverrides } = resolvedRequestOptions;
        return this.client.makeRequest('GET', '/document/deleted', {
            headers,
            ...requestOverrides,
        });
    }
    async listDeletedChunks(requestOptions) {
        const resolvedRequestOptions = normalizeRequestOptions(requestOptions);
        const { headers, ...requestOverrides } = resolvedRequestOptions;
        return this.client.makeRequest('GET', '/document/chunk/deleted', {
            headers,
            ...requestOverrides,
        });
    }
    async deleteDocument(documentId, requestOptions) {
        const resolvedRequestOptions = normalizeRequestOptions(requestOptions);
        const { headers, ...requestOverrides } = resolvedRequestOptions;
        return this.client.makeRequest('DELETE', `/document/${documentId}`, {
            headers,
            ...requestOverrides,
        });
    }
    async restoreDocument(documentId, requestOptions) {
        const resolvedRequestOptions = normalizeRequestOptions(requestOptions);
        const { headers, ...requestOverrides } = resolvedRequestOptions;
        return this.client.makeRequest('PATCH', `/document/${documentId}/restore`, {
            headers,
            ...requestOverrides,
        });
    }
    async deleteDocumentChunk(chunkId, requestOptions) {
        const resolvedRequestOptions = normalizeRequestOptions(requestOptions);
        const { headers, ...requestOverrides } = resolvedRequestOptions;
        return this.client.makeRequest('DELETE', `/document/chunk/${chunkId}`, {
            headers,
            ...requestOverrides,
        });
    }
    async restoreDocumentChunk(chunkId, requestOptions) {
        const resolvedRequestOptions = normalizeRequestOptions(requestOptions);
        const { headers, ...requestOverrides } = resolvedRequestOptions;
        return this.client.makeRequest('PATCH', `/document/chunk/${chunkId}/restore`, {
            headers,
            ...requestOverrides,
        });
    }
    async deleteDocumentChunks(documentId, requestOptions) {
        const resolvedRequestOptions = normalizeRequestOptions(requestOptions);
        const { headers, ...requestOverrides } = resolvedRequestOptions;
        return this.client.makeRequest('DELETE', `/document/${documentId}/chunk`, {
            headers,
            ...requestOverrides,
        });
    }
    async restoreAllDocumentChunks(documentId, requestOptions) {
        const resolvedRequestOptions = normalizeRequestOptions(requestOptions);
        const { headers, ...requestOverrides } = resolvedRequestOptions;
        return this.client.makeRequest('PATCH', `/document/${documentId}/chunk/restore-all`, {
            headers,
            ...requestOverrides,
        });
    }
    async bulkDeleteDocuments(documentIds, requestOptions) {
        const resolvedRequestOptions = normalizeRequestOptions(requestOptions);
        const { headers, ...requestOverrides } = resolvedRequestOptions;
        return this.client.makeRequest('DELETE', '/document/bulk-delete', {
            data: { document_ids: documentIds },
            headers,
            ...requestOverrides,
        });
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.js.map