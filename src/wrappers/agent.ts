// src/wrappers/agent.ts
import { KnowrithmClient } from '../client';
import { EntityType } from '../types/enums';

/**
 * High-level interface for agent operations
 */
export class KnowrithmAgent {
  private details: any = null;

  constructor(
    private client: KnowrithmClient,
    public agentId: string
  ) {}

  /**
   * Send a message to this agent
   */
  async chat(
    message: string,
    options?: {
      conversationId?: string;
      entityType?: EntityType;
      entityId?: string;
      stream?: boolean;
    }
  ): Promise<any> {
    let conversationId = options?.conversationId;

    if (!conversationId) {
      const conv = await this.client.conversations.createConversation(
        this.agentId,
        {
          metadata: {
            entity_type: options?.entityType || EntityType.USER,
            entity_id: options?.entityId,
          },
        }
      );
      conversationId = conv.id;
    }

    return this.client.messages.sendMessage(conversationId, message, {
      stream: options?.stream,
    });
  }

  /**
   * Get agent details with caching
   */
  async getDetails(forceRefresh: boolean = false): Promise<any> {
    if (!this.details || forceRefresh) {
      this.details = await this.client.agents.getAgent(this.agentId);
    }
    return this.details;
  }

  /**
   * Update agent configuration
   */
  async update(agentData: any): Promise<any> {
    const result = await this.client.agents.updateAgent(this.agentId, agentData);
    this.details = null; // Clear cache
    return result;
  }

  /**
   * Get agent conversations
   */
  async getConversations(limit: number = 50, offset: number = 0): Promise<any[]> {
    const response = await this.client.conversations.listConversations(
      Math.ceil(offset / limit) + 1,
      limit
    );
    return response.items || response;
  }

  /**
   * Get agent performance metrics
   */
  async getMetrics(startDate?: string, endDate?: string): Promise<any> {
    return this.client.analytics.getAgentAnalytics(this.agentId, startDate, endDate);
  }

  /**
   * Clone this agent
   */
  async clone(name?: string, llmSettingsId?: string): Promise<KnowrithmAgent> {
    const result = await this.client.agents.cloneAgent(this.agentId, { name, llm_settings_id: llmSettingsId });
    return new KnowrithmAgent(this.client, result.id);
  }

  /**
   * Delete this agent
   */
  async delete(): Promise<any> {
    return this.client.agents.deleteAgent(this.agentId);
  }

  /**
   * Restore this agent
   */
  async restore(): Promise<any> {
    return this.client.agents.restoreAgent(this.agentId);
  }

  /**
   * Get embed code for this agent
   */
  async getEmbedCode(): Promise<any> {
    return this.client.agents.getEmbedCode(this.agentId);
  }

  /**
   * Test this agent
   */
  async test(query?: string): Promise<any> {
    return this.client.agents.testAgent(this.agentId, query);
  }

  /**
   * Get statistics for this agent
   */
  async getStats(): Promise<any> {
    return this.client.agents.getAgentStats(this.agentId);
  }
}
