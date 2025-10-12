/**
 * High-level interface for company operations
 */
import { KnowrithmClient } from '../client';
import { KnowrithmAgent } from './agent';
export declare class KnowrithmCompany {
    private client;
    companyId: string;
    private details;
    constructor(client: KnowrithmClient, companyId: string);
    /**
     * Create a new agent for this company
     */
    createAgent(name: string, description?: string, additionalData?: Record<string, any>): Promise<KnowrithmAgent>;
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