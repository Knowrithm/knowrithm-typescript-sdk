"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
class AnalyticsService {
    constructor(client) {
        this.client = client;
    }
    async getDashboardOverview(companyId, headers) {
        return this.client.makeRequest('GET', '/analytic/dashboard', {
            params: companyId ? { company_id: companyId } : undefined,
            headers,
        });
    }
    async getAgentAnalytics(agentId, startDate, endDate, headers) {
        return this.client.makeRequest('GET', `/analytic/agent/${agentId}`, {
            params: { start_date: startDate, end_date: endDate },
            headers,
        });
    }
    async getAgentPerformanceComparison(agentId, startDate, endDate, headers) {
        return this.client.makeRequest('GET', `/analytic/agent/${agentId}/performance-comparison`, {
            params: { start_date: startDate, end_date: endDate },
            headers,
        });
    }
    async getConversationAnalytics(conversationId, headers) {
        return this.client.makeRequest('GET', `/analytic/conversation/${conversationId}`, { headers });
    }
    async getLeadAnalytics(startDate, endDate, companyId, headers) {
        return this.client.makeRequest('GET', '/analytic/leads', {
            params: { start_date: startDate, end_date: endDate, company_id: companyId },
            headers,
        });
    }
    async getUsageMetrics(startDate, endDate, headers) {
        return this.client.makeRequest('GET', '/analytic/usage', {
            params: { start_date: startDate, end_date: endDate },
            headers,
        });
    }
    async searchDocuments(query, agentId, limit, headers) {
        const data = { query, agent_id: agentId };
        if (limit)
            data.limit = limit;
        return this.client.makeRequest('POST', '/search/document', { data, headers });
    }
    async searchDatabase(query, connectionId, headers) {
        const data = { query };
        if (connectionId)
            data.connection_id = connectionId;
        return this.client.makeRequest('POST', '/search/database', { data, headers });
    }
    async triggerSystemMetricCollection(headers) {
        return this.client.makeRequest('POST', '/system-metric', { headers });
    }
    async exportAnalytics(exportType, exportFormat, startDate, endDate, headers) {
        const data = { type: exportType, format: exportFormat };
        if (startDate)
            data.start_date = startDate;
        if (endDate)
            data.end_date = endDate;
        return this.client.makeRequest('POST', '/analytic/export', { data, headers });
    }
    async healthCheck(headers) {
        return this.client.makeRequest('GET', '/health', { headers });
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.js.map