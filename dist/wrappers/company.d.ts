/**
 * High-level interface for company operations
 */
import { KnowrithmClient } from '../client';
import { CreateAgentPayload, CreateSdkAgentPayload, SdkAgentSettingsPayload } from '../services/agent';
import { KnowrithmAgent } from './agent';
export declare class KnowrithmCompany {
    private client;
    companyId: string;
    private details;
    constructor(client: KnowrithmClient, companyId: string);
    /**
     * Create a new agent for this company
     */
    createAgent(agentData: CreateAgentPayload, headers?: Record<string, string>): Promise<KnowrithmAgent>;
    /**
     * Create a new agent using provider/model names with automatic settings provisioning
     */
    createAgentWithSettings(agentData: Omit<CreateSdkAgentPayload, 'settings'>, settings: SdkAgentSettingsPayload, headers?: Record<string, string>): Promise<KnowrithmAgent>;
    /**
     * List all agents for this company
     */
    listAgents(): Promise<any[]>;
    /**
     * Get company details with caching
     */
    getDetails(forceRefresh?: boolean): Promise<any>;
    /**
     * Get company statistics
     */
    getStatistics(days?: number): Promise<any>;
    /**
     * Create a lead for this company
     */
    createLead(firstName: string, lastName: string, email: string, additionalData?: Record<string, any>): Promise<any>;
    /**
     * List company leads
     */
    listLeads(status?: string): Promise<any[]>;
    /**
     * Get company analytics dashboard
     */
    getAnalytics(): Promise<any>;
    /**
     * Update company details
     */
    update(companyData: any, logoFile?: {
        file: File | Buffer;
        filename: string;
    }): Promise<any>;
    /**
     * Delete this company
     */
    delete(): Promise<any>;
    /**
     * Restore this company
     */
    restore(): Promise<any>;
}
//# sourceMappingURL=company.d.ts.map