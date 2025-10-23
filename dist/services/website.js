"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteService = void 0;
/**
 * Client for managing website awareness and crawling operations.
 */
class WebsiteService {
    constructor(client) {
        this.client = client;
    }
    /**
     * Register a website so an agent can crawl and ingest its content.
     *
     * Endpoint: `POST /v1/website/source`
     */
    async registerWebsiteSource(payload, headers) {
        return this.client.makeRequest('POST', '/website/source', { data: payload, headers });
    }
    /**
     * List website sources configured for the authenticated company.
     *
     * Endpoint: `GET /v1/website/source`
     */
    async listWebsiteSources(params, headers) {
        return this.client.makeRequest('GET', '/website/source', { params, headers });
    }
    /**
     * Retrieve a website source along with its crawled pages.
     *
     * Endpoint: `GET /v1/website/source/<source_id>/pages`
     */
    async listWebsitePages(sourceId, headers) {
        return this.client.makeRequest('GET', `/website/source/${sourceId}/pages`, { headers });
    }
    /**
     * Manually enqueue a crawl job for a registered website source.
     *
     * Endpoint: `POST /v1/sdk/website/source/<source_id>/crawl`
     */
    async triggerWebsiteCrawl(sourceId, payload, headers) {
        return this.client.makeRequest('POST', `/sdk/website/source/${sourceId}/crawl`, {
            data: payload,
            headers,
        });
    }
    /**
     * Soft delete a website source synchronously.
     *
     * Endpoint: `DELETE /v1/sdk/website/source/<source_id>`
     */
    async deleteWebsiteSource(sourceId, headers) {
        return this.client.makeRequest('DELETE', `/sdk/website/source/${sourceId}`, { headers });
    }
    /**
     * Declare an active webpage context from an embedded widget.
     *
     * Endpoint: `POST /v1/website/handshake`
     */
    async handshake(payload, headers) {
        return this.client.makeRequest('POST', '/website/handshake', { data: payload, headers });
    }
}
exports.WebsiteService = WebsiteService;
//# sourceMappingURL=website.js.map