
// src/services/analytics.ts
import { KnowrithmClient } from '../client';

export class AnalyticsService {
  constructor(private client: KnowrithmClient) {}

  async getDashboardOverview(companyId?: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/analytic/dashboard', {
      params: companyId ? { company_id: companyId } : undefined,
      headers,
    });
  }

  async getAgentAnalytics(
    agentId: string,
    startDate?: string,
    endDate?: string,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('GET', `/analytic/agent/${agentId}`, {
      params: { start_date: startDate, end_date: endDate },
      headers,
    });
  }

  async getAgentPerformanceComparison(
    agentId: string,
    startDate?: string,
    endDate?: string,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('GET', `/analytic/agent/${agentId}/performance-comparison`, {
      params: { start_date: startDate, end_date: endDate },
      headers,
    });
  }

  async getConversationAnalytics(conversationId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/analytic/conversation/${conversationId}`, { headers });
  }

  async getLeadAnalytics(
    startDate?: string,
    endDate?: string,
    companyId?: string,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('GET', '/analytic/leads', {
      params: { start_date: startDate, end_date: endDate, company_id: companyId },
      headers,
    });
  }

  async getUsageMetrics(
    startDate?: string,
    endDate?: string,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('GET', '/analytic/usage', {
      params: { start_date: startDate, end_date: endDate },
      headers,
    });
  }

  async searchDocuments(
    query: string,
    agentId: string,
    limit?: number,
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = { query, agent_id: agentId };
    if (limit) data.limit = limit;
    return this.client.makeRequest('POST', '/search/document', { data, headers });
  }

  async searchDatabase(
    query: string,
    connectionId?: string,
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = { query };
    if (connectionId) data.connection_id = connectionId;
    return this.client.makeRequest('POST', '/search/database', { data, headers });
  }

  async triggerSystemMetricCollection(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/system-metric', { headers });
  }

  async exportAnalytics(
    exportType: string,
    exportFormat: string,
    startDate?: string,
    endDate?: string,
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = { type: exportType, format: exportFormat };
    if (startDate) data.start_date = startDate;
    if (endDate) data.end_date = endDate;
    return this.client.makeRequest('POST', '/analytic/export', { data, headers });
  }

  async healthCheck(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/health', { headers });
  }
}