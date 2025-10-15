"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
/**
 * Thin wrapper around agent endpoints. Provides a typed interface
 * for creating and managing Knowrithm agents.
 */
class AgentService {
    constructor(client) {
        this.client = client;
    }
    /**
     * Create a new agent bound to the authenticated company
     *
     * Automatically provisions LLM + embedding settings when provider/model IDs are supplied.
     * Endpoint: `POST /v1/agent`
     */
    async createAgent(payload, headers) {
        return this.client.makeRequest('POST', '/agent', { data: payload, headers });
    }
    /**
     * Retrieve agent details by identifier (public endpoint)
     *
     * Endpoint: `GET /v1/agent/<agent_id>`
     */
    async getAgent(agentId, headers) {
        return this.client.makeRequest('GET', `/agent/${agentId}`, { headers });
    }
    /**
     * List agents that belong to the current company or to a specific company for super admins
     *
     * Endpoint: `GET /v1/agent`
     */
    async listAgents(params, headers) {
        return this.client.makeRequest('GET', '/agent', { params, headers });
    }
    /**
     * Replace an agent's metadata and associated LLM settings
     *
     * Endpoint: `PUT /v1/agent/<agent_id>`
     */
    async updateAgent(agentId, payload, headers) {
        return this.client.makeRequest('PUT', `/agent/${agentId}`, { data: payload, headers });
    }
    /**
     * Soft-delete an agent (must have no active conversations)
     *
     * Endpoint: `DELETE /v1/agent/<agent_id>`
     */
    async deleteAgent(agentId, headers) {
        return this.client.makeRequest('DELETE', `/agent/${agentId}`, { headers });
    }
    /**
     * Restore a soft-deleted agent
     *
     * Endpoint: `PATCH /v1/agent/<agent_id>/restore`
     */
    async restoreAgent(agentId, headers) {
        return this.client.makeRequest('PATCH', `/agent/${agentId}/restore`, { headers });
    }
    /**
     * Retrieve the embed code that powers the public chat widget for this agent
     *
     * Endpoint: `GET /v1/agent/<agent_id>/embed-code`
     */
    async getEmbedCode(agentId, headers) {
        return this.client.makeRequest('GET', `/agent/${agentId}/embed-code`, { headers });
    }
    /**
     * Run a test prompt against the agent
     *
     * Endpoint: `POST /v1/agent/<agent_id>/test`
     */
    async testAgent(agentId, query, headers) {
        const data = query ? { query } : undefined;
        return this.client.makeRequest('POST', `/agent/${agentId}/test`, { data, headers });
    }
    /**
     * Retrieve aggregate statistics for an agent
     *
     * Endpoint: `GET /v1/agent/<agent_id>/stats`
     */
    async getAgentStats(agentId, headers) {
        return this.client.makeRequest('GET', `/agent/${agentId}/stats`, { headers });
    }
    /**
     * Duplicate an agent configuration
     *
     * Endpoint: `POST /v1/agent/<agent_id>/clone`
     */
    async cloneAgent(agentId, payload, headers) {
        return this.client.makeRequest('POST', `/agent/${agentId}/clone`, {
            data: payload,
            headers
        });
    }
    /**
     * Download the public widget JavaScript bundle
     *
     * Endpoint: `GET /widget.js`
     */
    async fetchWidgetScript(headers) {
        const response = await this.client.makeRequest('GET', '/widget.js', { headers });
        return typeof response === 'string' ? response : JSON.stringify(response);
    }
    /**
     * Request the internal widget test page
     *
     * Endpoint: `POST /test`
     */
    async renderTestPage(bodyHtml, headers) {
        return this.client.makeRequest('POST', '/test', {
            data: { body: bodyHtml },
            headers
        });
    }
}
exports.AgentService = AgentService;
//# sourceMappingURL=agent.js.map