// src/services/auth.ts
import { KnowrithmClient } from '../client';

export class AuthService {
  constructor(private client: KnowrithmClient) {}

  async registerAdmin(payload: any, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/auth/register', { data: payload, headers });
  }

  async login(email: string, password: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/auth/login', { 
      data: { email, password }, 
      headers 
    });
  }

  async refreshAccessToken(refreshToken: string, headers?: Record<string, string>): Promise<any> {
    const refreshHeaders = { ...headers, Authorization: `Bearer ${refreshToken}` };
    return this.client.makeRequest('POST', '/auth/refresh', { headers: refreshHeaders });
  }

  async logout(headers: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/auth/logout', { headers });
  }

  async sendVerificationEmail(email: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/send', { data: { email }, headers });
  }

  async verifyEmail(token: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/verify', { data: { token }, headers });
  }

  async getCurrentUser(headers: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/auth/user/me', { headers });
  }

  async createUser(payload: any, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/auth/user', { data: payload, headers });
  }
}

export class ApiKeyService {
  constructor(private client: KnowrithmClient) {}

  async createApiKey(payload: any, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/auth/api-keys', { data: payload, headers });
  }

  async listApiKeys(headers: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/auth/api-keys', { headers });
  }

  async deleteApiKey(apiKeyId: string, headers: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/auth/api-keys/${apiKeyId}`, { headers });
  }

  async validateCredentials(headers: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/auth/validate', { headers });
  }

  async getApiKeyOverview(days?: number, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/overview', { params: { days }, headers });
  }

  async getUsageTrends(
    days?: number, 
    granularity?: string, 
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('GET', '/usage-trends', { 
      params: { days, granularity }, 
      headers 
    });
  }

  async getTopEndpoints(days?: number, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/top-endpoints', { params: { days }, headers });
  }

  async getApiKeyPerformance(days?: number, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/api-key-performance', { params: { days }, headers });
  }

  async getErrorAnalysis(days?: number, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/error-analysis', { params: { days }, headers });
  }

  async getRateLimitAnalysis(days?: number, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/rate-limit-analysis', { params: { days }, headers });
  }

  async getDetailedUsage(
    apiKeyId: string, 
    days?: number, 
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('GET', `/detailed-usage/${apiKeyId}`, { 
      params: { days }, 
      headers 
    });
  }
}

export class UserService {
  constructor(private client: KnowrithmClient) {}

  async getProfile(headers: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/user/profile', { headers });
  }

  async updateProfile(payload: any, headers: Record<string, string>): Promise<any> {
    return this.client.makeRequest('PUT', '/user/profile', { data: payload, headers });
  }

  async getUser(userId: string, headers: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/user/${userId}`, { headers });
  }
}