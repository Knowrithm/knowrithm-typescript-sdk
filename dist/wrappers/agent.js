"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowrithmAgent = void 0;
const enums_1 = require("../types/enums");
/**
 * High-level interface for agent operations
 */
class KnowrithmAgent {
    constructor(client, agentId) {
        this.client = client;
        this.agentId = agentId;
        this.details = null;
    }
    /**
     * Send a message to this agent
     */
    async chat(message, options) {
        let conversationId = options?.conversationId;
        if (!conversationId) {
            const conv = await this.client.conversations.createConversation(this.agentId, {
                metadata: {
                    entity_type: options?.entityType || enums_1.EntityType.USER,
                    entity_id: options?.entityId,
                },
            });
            conversationId = conv.id;
        }
        // Type assertion since we ensure conversationId is defined above
        return this.client.messages.sendMessage(conversationId, message, {
            stream: options?.stream,
        });
    }
    /**
     * Get agent details with caching
     */
    async getDetails(forceRefresh = false) {
        if (!this.details || forceRefresh) {
            this.details = await this.client.agents.getAgent(this.agentId);
        }
        return this.details;
    }
    /**
     * Update agent configuration
     */
    async update(agentData) {
        const result = await this.client.agents.updateAgent(this.agentId, agentData);
        this.details = null; // Clear cache
        return result;
    }
    /**
     * Get agent conversations
     */
    async getConversations(limit = 50, offset = 0) {
        const response = await this.client.conversations.listConversations(Math.ceil(offset / limit) + 1, limit);
        return response.items || response;
    }
    /**
     * Get agent performance metrics
     */
    async getMetrics(startDate, endDate) {
        return this.client.analytics.getAgentAnalytics(this.agentId, startDate, endDate);
    }
    /**
     * Clone this agent
     */
    async clone(name, llmSettingsId) {
        const result = await this.client.agents.cloneAgent(this.agentId, { name, llm_settings_id: llmSettingsId });
        return new KnowrithmAgent(this.client, result.id);
    }
    /**
     * Delete this agent
     */
    async delete() {
        return this.client.agents.deleteAgent(this.agentId);
    }
    /**
     * Restore this agent
     */
    async restore() {
        return this.client.agents.restoreAgent(this.agentId);
    }
    /**
     * Get embed code for this agent
     */
    async getEmbedCode() {
        return this.client.agents.getEmbedCode(this.agentId);
    }
    /**
     * Test this agent
     */
    async test(query) {
        return this.client.agents.testAgent(this.agentId, query);
    }
    /**
     * Get statistics for this agent
     */
    async getStats() {
        return this.client.agents.getAgentStats(this.agentId);
    }
}
exports.KnowrithmAgent = KnowrithmAgent;
//# sourceMappingURL=agent.js.map