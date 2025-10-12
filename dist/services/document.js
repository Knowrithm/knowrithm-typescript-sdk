"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
class DocumentService {
    constructor(client) {
        this.client = client;
    }
    async uploadDocuments(agentId, options, headers) {
        const { filePaths, urls, url, metadata } = options || {};
        if (filePaths && filePaths.length > 0) {
            const data = { agent_id: agentId, ...metadata };
            if (urls)
                data.urls = urls;
            if (url)
                data.url = url;
            const files = filePaths.map(({ file, filename }) => ({
                name: 'files',
                file,
                filename,
            }));
            return this.client.makeRequest('POST', '/document/upload', { data, files, headers });
        }
        else {
            const data = { agent_id: agentId, ...metadata };
            if (urls)
                data.urls = urls;
            if (url)
                data.url = url;
            return this.client.makeRequest('POST', '/document/upload', { data, headers });
        }
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