"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
class AdminService {
    constructor(client) {
        this.client = client;
    }
    async listUsers(params, headers) {
        const endpoint = params?.company_id
            ? `/super-admin/company/${params.company_id}/user`
            : '/admin/user';
        const queryParams = { ...params };
        delete queryParams.company_id;
        return this.client.makeRequest('GET', endpoint, { params: queryParams, headers });
    }
    async getUser(userId, headers) {
        return this.client.makeRequest('GET', `/admin/user/${userId}`, { headers });
    }
    async getCompanySystemMetrics(companyId, headers) {
        const endpoint = companyId
            ? `/super-admin/company/${companyId}/system-metric`
            : '/admin/system-metric';
        return this.client.makeRequest('GET', endpoint, { headers });
    }
    async getAuditLogs(params, headers) {
        return this.client.makeRequest('GET', '/audit-log', { params, headers });
    }
    async getSystemConfiguration(headers) {
        return this.client.makeRequest('GET', '/config', { headers });
    }
    async upsertSystemConfiguration(configKey, configValue, options, headers) {
        const data = { config_key: configKey, config_value: configValue, ...options };
        return this.client.makeRequest('PATCH', '/config', { data, headers });
    }
    async forcePasswordReset(userId, headers) {
        return this.client.makeRequest('POST', `/user/${userId}/force-password-reset`, { headers });
    }
    async impersonateUser(userId, headers) {
        return this.client.makeRequest('POST', `/user/${userId}/impersonate`, { headers });
    }
    async updateUserStatus(userId, status, reason, headers) {
        const data = { status };
        if (reason)
            data.reason = reason;
        return this.client.makeRequest('PATCH', `/user/${userId}/status`, { data, headers });
    }
    async updateUserRole(userId, role, headers) {
        return this.client.makeRequest('PATCH', `/user/${userId}/role`, { data: { role }, headers });
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.js.map