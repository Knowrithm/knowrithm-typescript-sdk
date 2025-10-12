
// src/services/company.ts
import { KnowrithmClient } from '../client';

export class CompanyService {
  constructor(private client: KnowrithmClient) {}

  async createCompany(
    payload: any,
    logoFile?: { file: File | Buffer; filename: string },
    headers?: Record<string, string>
  ): Promise<any> {
    const files = logoFile ? [{ name: 'logo', ...logoFile }] : undefined;
    return this.client.makeRequest('POST', '/company', { data: payload, files, headers });
  }

  async listCompanies(
    page?: number, 
    perPage?: number, 
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('GET', '/super-admin/company', { 
      params: { page, per_page: perPage }, 
      headers 
    });
  }

  async getCompany(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/company', { headers });
  }

  async getCompanyStatistics(
    companyId?: string, 
    days?: number, 
    headers?: Record<string, string>
  ): Promise<any> {
    const endpoint = companyId ? `/company/${companyId}/statistics` : '/company/statistics';
    return this.client.makeRequest('GET', endpoint, { params: { days }, headers });
  }

  async listDeletedCompanies(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/company/deleted', { headers });
  }

  async updateCompany(
    companyId: string,
    payload: any,
    logoFile?: { file: File | Buffer; filename: string },
    headers?: Record<string, string>
  ): Promise<any> {
    const files = logoFile ? [{ name: 'logo', ...logoFile }] : undefined;
    return this.client.makeRequest('PUT', `/company/${companyId}`, { 
      data: payload, 
      files, 
      headers 
    });
  }

  async patchCompany(
    companyId: string,
    payload: any,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('PATCH', `/company/${companyId}`, { data: payload, headers });
  }

  async deleteCompany(companyId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/company/${companyId}`, { headers });
  }

  async restoreCompany(companyId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('PATCH', `/company/${companyId}/restore`, { headers });
  }

  async cascadeDeleteCompany(
    companyId: string,
    deleteRelated?: boolean,
    headers?: Record<string, string>
  ): Promise<any> {
    const data = deleteRelated !== undefined ? { delete_related: deleteRelated } : undefined;
    return this.client.makeRequest('DELETE', `/company/${companyId}/cascade-delete`, { 
      data, 
      headers 
    });
  }

  async getRelatedDataSummary(companyId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/company/${companyId}/related-data`, { headers });
  }

  async bulkDeleteCompanies(
    companyIds: string[],
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('DELETE', '/company/bulk-delete', { 
      data: { company_ids: companyIds }, 
      headers 
    });
  }

  async bulkRestoreCompanies(
    companyIds: string[],
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('PATCH', '/company/bulk-restore', { 
      data: { company_ids: companyIds }, 
      headers 
    });
  }
}


// Export all services
export * from './agent';
export * from './conversation';
export * from './document';
export * from './database';
export * from './analytics';
export * from './address';
export * from './admin';
export * from './settings';