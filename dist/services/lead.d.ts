import { KnowrithmClient } from '../client';
export declare class LeadService {
    private client;
    constructor(client: KnowrithmClient);
    registerLead(payload: any, headers?: Record<string, string>): Promise<any>;
    createLead(payload: any, headers?: Record<string, string>): Promise<any>;
    getLead(leadId: string, headers?: Record<string, string>): Promise<any>;
    listCompanyLeads(params?: {
        page?: number;
        per_page?: number;
        status?: string;
        search?: string;
    }, headers?: Record<string, string>): Promise<any>;
    updateLead(leadId: string, payload: any, headers?: Record<string, string>): Promise<any>;
    deleteLead(leadId: string, headers?: Record<string, string>): Promise<any>;
}
//# sourceMappingURL=lead.d.ts.map