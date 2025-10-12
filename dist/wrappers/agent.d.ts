import { KnowrithmClient } from '../client';
import { EntityType } from '../types/enums';
/**
 * High-level interface for agent operations
 */
export declare class KnowrithmAgent {
    private client;
    agentId: string;
    private details;
    constructor(client: KnowrithmClient, agentId: string);
    /**
     * Send a message to this agent
     */
    chat(message: string, options?: {
        conversationId?: string;
        entityType?: EntityType;
        entityId?: string;
        stream?: boolean;
    }): Promise<any>;
    /**
     * Get agent details with caching
     */
    getDetails(forceRefresh?: boolean): Promise<any>;
    /**
     * Update agent configuration
     */
    update(agentData: any): Promise<any>;
    /**
     * Get agent conversations
     */
    getConversations(limit?: number, offset?: number): Promise<any[]>;
    /**
     * Get agent performance metrics
     */
    getMetrics(startDate?: string, endDate?: string): Promise<any>;
    /**
     * Clone this agent
     */
    clone(name?: string, llmSettingsId?: string): Promise<KnowrithmAgent>;
    /**
     * Delete this agent
     */
    delete(): Promise<any>;
    /**
     * Restore this agent
     */
    restore(): Promise<any>;
    /**
     * Get embed code for this agent
     */
    getEmbedCode(): Promise<any>;
    /**
     * Test this agent
     */
    test(query?: string): Promise<any>;
    /**
     * Get statistics for this agent
     */
    getStats(): Promise<any>;
}
//# sourceMappingURL=agent.d.ts.map