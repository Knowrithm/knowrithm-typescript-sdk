"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowrithmConversation = void 0;
class KnowrithmConversation {
    constructor(client, conversationId) {
        this.client = client;
        this.conversationId = conversationId;
        this.details = null;
    }
    /**
     * Send a message in this conversation
     */
    async sendMessage(content, role = 'user', stream = false) {
        return this.client.messages.sendMessage(this.conversationId, content, { stream });
    }
    /**
     * Get conversation messages
     */
    async getMessages(limit = 50, offset = 0) {
        const page = Math.ceil(offset / limit) + 1;
        const response = await this.client.conversations.listConversationMessages(this.conversationId, page, limit);
        return response.items || response;
    }
    /**
     * Get conversation details with caching
     */
    async getDetails(forceRefresh = false) {
        if (!this.details || forceRefresh) {
            // Note: This would need a getConversation endpoint in the API
            this.details = { id: this.conversationId };
        }
        return this.details;
    }
    /**
     * Delete the conversation
     */
    async delete() {
        return this.client.conversations.deleteConversation(this.conversationId);
    }
    /**
     * Restore the conversation
     */
    async restore() {
        return this.client.conversations.restoreConversation(this.conversationId);
    }
    /**
     * Archive the conversation (soft delete)
     */
    async archive() {
        return this.delete();
    }
    /**
     * Get conversation analytics
     */
    async getAnalytics() {
        return this.client.analytics.getConversationAnalytics(this.conversationId);
    }
    /**
     * Stream messages from this conversation
     */
    async streamMessages(eventTypes) {
        return this.client.messages.streamConversationMessages(this.conversationId, {
            eventTypes,
        });
    }
}
exports.KnowrithmConversation = KnowrithmConversation;
//# sourceMappingURL=conversation.js.map