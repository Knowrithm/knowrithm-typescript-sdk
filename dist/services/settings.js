"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderService = exports.SettingsService = void 0;
class SettingsService {
    constructor(client) {
        this.client = client;
    }
    async createSettings(payload, headers) {
        return this.client.makeRequest('POST', '/settings', { data: payload, headers });
    }
    async updateSettings(settingsId, payload, headers) {
        return this.client.makeRequest('PUT', `/settings/${settingsId}`, { data: payload, headers });
    }
    async getSettings(settingsId, headers) {
        return this.client.makeRequest('GET', `/settings/${settingsId}`, { headers });
    }
    async listCompanySettings(companyId, headers) {
        return this.client.makeRequest('GET', `/settings/company/${companyId}`, { headers });
    }
    async listAgentSettings(agentId, headers) {
        return this.client.makeRequest('GET', `/settings/agent/${agentId}`, { headers });
    }
    async deleteSettings(settingsId, headers) {
        return this.client.makeRequest('DELETE', `/settings/${settingsId}`, { headers });
    }
    async testSettings(settingsId, overrides, headers) {
        return this.client.makeRequest('POST', `/settings/test/${settingsId}`, { data: overrides, headers });
    }
    async listSettingsProviders(headers) {
        return this.client.makeRequest('GET', '/settings/providers', { headers });
    }
    async seedSettingsProviders(overrides, headers) {
        return this.client.makeRequest('POST', '/settings/providers/seed', { data: overrides, headers });
    }
}
exports.SettingsService = SettingsService;
class ProviderService {
    constructor(client) {
        this.client = client;
    }
    async createProvider(payload, headers) {
        return this.client.makeRequest('POST', '/providers', { data: payload, headers });
    }
    async updateProvider(providerId, payload, headers) {
        return this.client.makeRequest('PUT', `/providers/${providerId}`, { data: payload, headers });
    }
    async deleteProvider(providerId, headers) {
        return this.client.makeRequest('DELETE', `/providers/${providerId}`, { headers });
    }
    async listProviders(params, headers) {
        return this.client.makeRequest('GET', '/providers', { params, headers });
    }
    async getProvider(providerId, headers) {
        return this.client.makeRequest('GET', `/providers/${providerId}`, { headers });
    }
    async bulkImportProviders(payload, headers) {
        return this.client.makeRequest('POST', '/providers/bulk-import', { data: payload, headers });
    }
    async createModel(providerId, payload, headers) {
        return this.client.makeRequest('POST', `/providers/${providerId}/models`, { data: payload, headers });
    }
    async updateModel(providerId, modelId, payload, headers) {
        return this.client.makeRequest('PUT', `/providers/${providerId}/models/${modelId}`, {
            data: payload,
            headers
        });
    }
    async deleteModel(providerId, modelId, headers) {
        return this.client.makeRequest('DELETE', `/providers/${providerId}/models/${modelId}`, { headers });
    }
    async listModels(providerId, headers) {
        return this.client.makeRequest('GET', `/providers/${providerId}/models`, { headers });
    }
    async getModel(providerId, modelId, headers) {
        return this.client.makeRequest('GET', `/providers/${providerId}/models/${modelId}`, { headers });
    }
}
exports.ProviderService = ProviderService;
//# sourceMappingURL=settings.js.map