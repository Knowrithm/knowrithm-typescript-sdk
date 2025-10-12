
// src/wrappers/company.ts
/**
 * High-level interface for company operations
 */
import { KnowrithmClient } from '../client';
import { KnowrithmAgent } from './agent';

export class KnowrithmCompany {
  private details: any = null;

  constructor(
    private client: KnowrithmClient,
    public companyId: string
  ) {}

  /**
   * Create a new agent for this company
   */
  async createAgent(
    name: string,
    description?: string,
    additionalData?: Record<string, any>
  ): Promise<KnowrithmAgent> {
    const agentData = {
      name,
      company_id: this.companyId,
      description,
      ...additionalData,
    };

    const agent = await this.client.agents.createAgent(agentData);
    return new KnowrithmAgent(this.client, agent.id);
  }

  /**
   * List all agents for this company
   */
  async listAgents(): Promise<any[]> {
    const response = await this.client.agents.listAgents({ company_id: this.companyId });
    return response.items || response;
  }

  /**
   * Get company details with caching
   */
  async getDetails(forceRefresh: boolean = false): Promise<any> {
    if (!this.details || forceRefresh) {
      this.details = await this.client.companies.getCompany();
    }
    return this.details;
  }

  /**
   * Get company statistics
   */
  async getStatistics(days?: number): Promise<any> {
    return this.client.companies.getCompanyStatistics(this.companyId, days);
  }

  /**
   * Create a lead for this company
   */
  async createLead(
    firstName: string,
    lastName: string,
    email: string,
    additionalData?: Record<string, any>
  ): Promise<any> {
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
  async listLeads(status?: string): Promise<any[]> {
    const response = await this.client.leads.listCompanyLeads({ status });
    return response.items || response;
  }

  /**
   * Get company analytics dashboard
   */
  async getAnalytics(): Promise<any> {
    return this.client.analytics.getDashboardOverview(this.companyId);
  }

  /**
   * Update company details
   */
  async update(companyData: any, logoFile?: { file: File | Buffer; filename: string }): Promise<any> {
    const result = await this.client.companies.updateCompany(this.companyId, companyData, logoFile);
    this.details = null; // Clear cache
    return result;
  }

  /**
   * Delete this company
   */
  async delete(): Promise<any> {
    return this.client.companies.deleteCompany(this.companyId);
  }

  /**
   * Restore this company
   */
  async restore(): Promise<any> {
    return this.client.companies.restoreCompany(this.companyId);
  }
}
