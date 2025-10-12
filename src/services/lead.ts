
// src/services/lead.ts
import { KnowrithmClient } from '../client';

export class LeadService {
  constructor(private client: KnowrithmClient) {}

  async registerLead(payload: any, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/lead/register', { data: payload, headers });
  }

  async createLead(payload: any, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/lead', { data: payload, headers });
  }

  async getLead(leadId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/lead/${leadId}`, { headers });
  }

  async listCompanyLeads(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
  }, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/lead/company', { params, headers });
  }

  async updateLead(
    leadId: string,
    payload: any,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('PUT', `/lead/${leadId}`, { data: payload, headers });
  }

  async deleteLead(leadId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/lead/${leadId}`, { headers });
  }
}