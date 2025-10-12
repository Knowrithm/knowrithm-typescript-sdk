
// src/services/admin.ts
import { KnowrithmClient } from '../client';


export class AdminService {
  constructor(private client: KnowrithmClient) {}

  async listUsers(params?: {
    company_id?: string;
    page?: number;
    per_page?: number;
    status?: string;
    role?: string;
    email_verified?: boolean;
    two_factor_enabled?: boolean;
    search?: string;
    created_after?: string;
    created_before?: string;
    last_login_after?: string;
    last_login_before?: string;
    never_logged_in?: boolean;
    locked?: boolean;
    high_login_attempts?: boolean;
    timezone?: string;
    language?: string;
    include_deleted?: boolean;
    only_deleted?: boolean;
    sort_by?: string;
    sort_order?: string;
  }, headers?: Record<string, string>): Promise<any> {
    const endpoint = params?.company_id 
      ? `/super-admin/company/${params.company_id}/user` 
      : '/admin/user';
    
    const queryParams = { ...params };
    delete queryParams.company_id;
    
    return this.client.makeRequest('GET', endpoint, { params: queryParams, headers });
  }

  async getUser(userId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/admin/user/${userId}`, { headers });
  }

  async getCompanySystemMetrics(companyId?: string, headers?: Record<string, string>): Promise<any> {
    const endpoint = companyId 
      ? `/super-admin/company/${companyId}/system-metric` 
      : '/admin/system-metric';
    return this.client.makeRequest('GET', endpoint, { headers });
  }

  async getAuditLogs(params?: {
    entity_type?: string;
    event_type?: string;
    risk_level?: string;
    limit?: number;
    offset?: number;
  }, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/audit-log', { params, headers });
  }

  async getSystemConfiguration(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/config', { headers });
  }

  async upsertSystemConfiguration(
    configKey: string,
    configValue: any,
    options?: {
      config_type?: string;
      description?: string;
      is_sensitive?: boolean;
    },
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = { config_key: configKey, config_value: configValue, ...options };
    return this.client.makeRequest('PATCH', '/config', { data, headers });
  }

  async forcePasswordReset(userId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', `/user/${userId}/force-password-reset`, { headers });
  }

  async impersonateUser(userId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', `/user/${userId}/impersonate`, { headers });
  }

  async updateUserStatus(
    userId: string,
    status: string,
    reason?: string,
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = { status };
    if (reason) data.reason = reason;
    return this.client.makeRequest('PATCH', `/user/${userId}/status`, { data, headers });
  }

  async updateUserRole(userId: string, role: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('PATCH', `/user/${userId}/role`, { data: { role }, headers });
  }
}