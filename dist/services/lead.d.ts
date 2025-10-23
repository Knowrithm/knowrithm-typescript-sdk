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
export declare class LeadService {
    private client;
    constructor(client: KnowrithmClient);
    registerLead(payload: any, headers?: Record<string, string>): Promise<any>;
    createLead(payload: CreateLeadPayload, headers?: Record<string, string>): Promise<CreateLeadResponse>;
    getLead(leadId: string, headers?: Record<string, string>): Promise<any>;
    listCompanyLeads(params?: {
        page?: number;
        per_page?: number;
        status?: string;
        search?: string;
    }, headers?: Record<string, string>): Promise<any>;
    updateLead(leadId: string, payload: any, headers?: Record<string, string>): Promise<UpdateLeadResponse>;
    deleteLead(leadId: string, headers?: Record<string, string>): Promise<DeleteLeadResponse>;
}
//# sourceMappingURL=lead.d.ts.map