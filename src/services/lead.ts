
// src/services/lead.ts
import { KnowrithmClient } from '../client';

export interface CreateLeadPayload {
  company_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  [key: string]: any;
}

export interface CreateLeadResponse {
  lead: Record<string, any>;
  [key: string]: any;
}

export interface UpdateLeadResponse {
  lead: Record<string, any>;
  initiated_by?: string | null;
  [key: string]: any;
}

export interface DeleteLeadResponse {
  lead_id: string;
  initiated_by?: string | null;
  [key: string]: any;
}

export class LeadService {
  constructor(private client: KnowrithmClient) {}

  async registerLead(payload: any, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/lead/register', { data: payload, headers });
  }

  async createLead(payload: CreateLeadPayload, headers?: Record<string, string>): Promise<CreateLeadResponse> {
    return this.client.makeRequest('POST', '/sdk/lead', { data: payload, headers });
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
  ): Promise<UpdateLeadResponse> {
    return this.client.makeRequest('PUT', `/sdk/lead/${leadId}`, { data: payload, headers });
  }

  async deleteLead(
    leadId: string,
    headers?: Record<string, string>
  ): Promise<DeleteLeadResponse> {
    return this.client.makeRequest('DELETE', `/sdk/lead/${leadId}`, { headers });
  }
}
