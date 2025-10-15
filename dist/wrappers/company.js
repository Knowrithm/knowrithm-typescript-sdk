"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowrithmCompany = void 0;
const agent_1 = require("./agent");
class KnowrithmCompany {
    constructor(client, companyId) {
        this.client = client;
        this.companyId = companyId;
        this.details = null;
    }
    /**
     * Create a new agent for this company
     */
    async createAgent(agentData) {
        const payload = {
            ...agentData,
            company_id: agentData.company_id ?? this.companyId,
        };
        const response = await this.client.agents.createAgent(payload);
        return new agent_1.KnowrithmAgent(this.client, response.agent.id);
    }
    /**
     * List all agents for this company
     */
    async listAgents() {
        const response = await this.client.agents.listAgents({ company_id: this.companyId });
        return response.items || response;
    }
    /**
     * Get company details with caching
     */
    async getDetails(forceRefresh = false) {
        if (!this.details || forceRefresh) {
            this.details = await this.client.companies.getCompany();
        }
        return this.details;
    }
    /**
     * Get company statistics
     */
    async getStatistics(days) {
        return this.client.companies.getCompanyStatistics(this.companyId, days);
    }
    /**
     * Create a lead for this company
     */
    async createLead(firstName, lastName, email, additionalData) {
        const leadData = {
            company_id: this.companyId,
            first_name: firstName,
            last_name: lastName,
            email,
            ...additionalData,
        };
        return this.client.leads.createLead(leadData);
    }
    /**
     * List company leads
     */
    async listLeads(status) {
        const response = await this.client.leads.listCompanyLeads({ status });
        return response.items || response;
    }
    /**
     * Get company analytics dashboard
     */
    async getAnalytics() {
        return this.client.analytics.getDashboardOverview(this.companyId);
    }
    /**
     * Update company details
     */
    async update(companyData, logoFile) {
        const result = await this.client.companies.updateCompany(this.companyId, companyData, logoFile);
        this.details = null; // Clear cache
        return result;
    }
    /**
     * Delete this company
     */
    async delete() {
        return this.client.companies.deleteCompany(this.companyId);
    }
    /**
     * Restore this company
     */
    async restore() {
        return this.client.companies.restoreCompany(this.companyId);
    }
}
exports.KnowrithmCompany = KnowrithmCompany;
//# sourceMappingURL=company.js.map