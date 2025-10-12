/**
 * High-level interface for conversation operations
 */
import { KnowrithmClient } from '../client';
export declare class KnowrithmConversation {
    private client;
    conversationId: string;
    private details;
    constructor(client: KnowrithmClient, conversationId: string);
    /**
     * Send a message in this conversation
     */
    sendMessage(content: string, role?: string, stream?: boolean): Promise<any>;
    /**
     * Get conversation messages
     */
    getMessages(limit?: number, offset?: number): Promise<any[]>;
    /**
     * Get conversation details with caching
     */
    getDetails(forceRefresh?: boolean): Promise<any>;
    /**
     * Delete the conversation
     */
    delete(): Promise<any>;
    /**
     * Restore the conversation
     */
    restore(): Promise<any>;
    /**
     * Archive the conversation (soft delete)
     */
    archive(): Promise<any>;
    /**
     * Get conversation analytics
     */
    getAnalytics(): Promise<any>;
    /**
     * Stream messages from this conversation
     */
    streamMessages(eventTypes?: string[]): Promise<any>;
}
//# sourceMappingURL=conversation.d.ts.map