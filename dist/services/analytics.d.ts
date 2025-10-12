import { KnowrithmClient } from '../client';
export declare class AnalyticsService {
    private client;
    constructor(client: KnowrithmClient);
    getDashboardOverview(companyId?: string, headers?: Record<string, string>): Promise<any>;
    getAgentAnalytics(agentId: string, startDate?: string, endDate?: string, headers?: Record<string, string>): Promise<any>;
    getAgentPerformanceComparison(agentId: string, startDate?: string, endDate?: string, headers?: Record<string, string>): Promise<any>;
    getConversationAnalytics(conversationId: string, headers?: Record<string, string>): Promise<any>;
    getLeadAnalytics(startDate?: string, endDate?: string, companyId?: string, headers?: Record<string, string>): Promise<any>;
    getUsageMetrics(startDate?: string, endDate?: string, headers?: Record<string, string>): Promise<any>;
    searchDocuments(query: string, agentId: string, limit?: number, headers?: Record<string, string>): Promise<any>;
    searchDatabase(query: string, connectionId?: string, headers?: Record<string, string>): Promise<any>;
    triggerSystemMetricCollection(headers?: Record<string, string>): Promise<any>;
    exportAnalytics(exportType: string, exportFormat: string, startDate?: string, endDate?: string, headers?: Record<string, string>): Promise<any>;
    healthCheck(headers?: Record<string, string>): Promise<any>;
}
//# sourceMappingURL=analytics.d.ts.map