"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
class LeadService {
    constructor(client) {
        this.client = client;
    }
    async registerLead(payload, headers) {
        return this.client.makeRequest('POST', '/lead/register', { data: payload, headers });
    }
    async createLead(payload, headers) {
        return this.client.makeRequest('POST', '/sdk/lead', { data: payload, headers });
    }
    async getLead(leadId, headers) {
        return this.client.makeRequest('GET', `/lead/${leadId}`, { headers });
    }
    async listCompanyLeads(params, headers) {
        return this.client.makeRequest('GET', '/lead/company', { params, headers });
    }
    async updateLead(leadId, payload, headers) {
        return this.client.makeRequest('PUT', `/sdk/lead/${leadId}`, { data: payload, headers });
    }
    async deleteLead(leadId, headers) {
        return this.client.makeRequest('DELETE', `/sdk/lead/${leadId}`, { headers });
    }
}
exports.LeadService = LeadService;
//# sourceMappingURL=lead.js.map