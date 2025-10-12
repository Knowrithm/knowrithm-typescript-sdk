"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = exports.ApiKeyService = exports.AuthService = void 0;
class AuthService {
    constructor(client) {
        this.client = client;
    }
    async registerAdmin(payload, headers) {
        return this.client.makeRequest('POST', '/auth/register', { data: payload, headers });
    }
    async login(email, password, headers) {
        return this.client.makeRequest('POST', '/auth/login', {
            data: { email, password },
            headers
        });
    }
    async refreshAccessToken(refreshToken, headers) {
        const refreshHeaders = { ...headers, Authorization: `Bearer ${refreshToken}` };
        return this.client.makeRequest('POST', '/auth/refresh', { headers: refreshHeaders });
    }
    async logout(headers) {
        return this.client.makeRequest('POST', '/auth/logout', { headers });
    }
    async sendVerificationEmail(email, headers) {
        return this.client.makeRequest('POST', '/send', { data: { email }, headers });
    }
    async verifyEmail(token, headers) {
        return this.client.makeRequest('POST', '/verify', { data: { token }, headers });
    }
    async getCurrentUser(headers) {
        return this.client.makeRequest('GET', '/auth/user/me', { headers });
    }
    async createUser(payload, headers) {
        return this.client.makeRequest('POST', '/auth/user', { data: payload, headers });
    }
}
exports.AuthService = AuthService;
class ApiKeyService {
    constructor(client) {
        this.client = client;
    }
    async createApiKey(payload, headers) {
        return this.client.makeRequest('POST', '/auth/api-keys', { data: payload, headers });
    }
    async listApiKeys(headers) {
        return this.client.makeRequest('GET', '/auth/api-keys', { headers });
    }
    async deleteApiKey(apiKeyId, headers) {
        return this.client.makeRequest('DELETE', `/auth/api-keys/${apiKeyId}`, { headers });
    }
    async validateCredentials(headers) {
        return this.client.makeRequest('GET', '/auth/validate', { headers });
    }
    async getApiKeyOverview(days, headers) {
        return this.client.makeRequest('GET', '/overview', { params: { days }, headers });
    }
    async getUsageTrends(days, granularity, headers) {
        return this.client.makeRequest('GET', '/usage-trends', {
            params: { days, granularity },
            headers
        });
    }
    async getTopEndpoints(days, headers) {
        return this.client.makeRequest('GET', '/top-endpoints', { params: { days }, headers });
    }
    async getApiKeyPerformance(days, headers) {
        return this.client.makeRequest('GET', '/api-key-performance', { params: { days }, headers });
    }
    async getErrorAnalysis(days, headers) {
        return this.client.makeRequest('GET', '/error-analysis', { params: { days }, headers });
    }
    async getRateLimitAnalysis(days, headers) {
        return this.client.makeRequest('GET', '/rate-limit-analysis', { params: { days }, headers });
    }
    async getDetailedUsage(apiKeyId, days, headers) {
        return this.client.makeRequest('GET', `/detailed-usage/${apiKeyId}`, {
            params: { days },
            headers
        });
    }
}
exports.ApiKeyService = ApiKeyService;
class UserService {
    constructor(client) {
        this.client = client;
    }
    async getProfile(headers) {
        return this.client.makeRequest('GET', '/user/profile', { headers });
    }
    async updateProfile(payload, headers) {
        return this.client.makeRequest('PUT', '/user/profile', { data: payload, headers });
    }
    async getUser(userId, headers) {
        return this.client.makeRequest('GET', `/user/${userId}`, { headers });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=auth.js.map