
// src/wrappers/conversation.ts
/**
 * High-level interface for conversation operations
 */
import { KnowrithmClient } from '../client';

export class KnowrithmConversation {
  private details: any = null;

  constructor(
    private client: KnowrithmClient,
    public conversationId: string
  ) {}

  /**
   * Send a message in this conversation
   */
  async sendMessage(content: string, role: string = 'user', stream: boolean = false): Promise<any> {
    return this.client.messages.sendMessage(this.conversationId, content, { stream });
  }

  /**
   * Get conversation messages
   */
  async getMessages(limit: number = 50, offset: number = 0): Promise<any[]> {
    const page = Math.ceil(offset / limit) + 1;
    const response = await this.client.conversations.listConversationMessages(
      this.conversationId,
      page,
      limit
    );
    return response.items || response;
  }

  /**
   * Get conversation details with caching
   */
  async getDetails(forceRefresh: boolean = false): Promise<any> {
    if (!this.details || forceRefresh) {
      // Note: This would need a getConversation endpoint in the API
      this.details = { id: this.conversationId };
    }
    return this.details;
  }

  /**
   * Delete the conversation
   */
  async delete(): Promise<any> {
    return this.client.conversations.deleteConversation(this.conversationId);
  }

  /**
   * Restore the conversation
   */
  async restore(): Promise<any> {
    return this.client.conversations.restoreConversation(this.conversationId);
  }

  /**
   * Archive the conversation (soft delete)
   */
  async archive(): Promise<any> {
    return this.delete();
  }

  /**
   * Get conversation analytics
   */
  async getAnalytics(): Promise<any> {
    return this.client.analytics.getConversationAnalytics(this.conversationId);
  }

  /**
   * Stream messages from this conversation
   */
  async streamMessages(eventTypes?: string[]): Promise<any> {
    return this.client.messages.streamConversationMessages(this.conversationId, {
      eventTypes,
    });
  }
}