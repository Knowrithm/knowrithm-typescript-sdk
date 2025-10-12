import { KnowrithmClient } from '../client';
export declare class CompanyService {
    private client;
    constructor(client: KnowrithmClient);
    createCompany(payload: any, logoFile?: {
        file: File | Buffer;
        filename: string;
    }, headers?: Record<string, string>): Promise<any>;
    listCompanies(page?: number, perPage?: number, headers?: Record<string, string>): Promise<any>;
    getCompany(headers?: Record<string, string>): Promise<any>;
    getCompanyStatistics(companyId?: string, days?: number, headers?: Record<string, string>): Promise<any>;
    listDeletedCompanies(headers?: Record<string, string>): Promise<any>;
    updateCompany(companyId: string, payload: any, logoFile?: {
        file: File | Buffer;
        filename: string;
    }, headers?: Record<string, string>): Promise<any>;
    patchCompany(companyId: string, payload: any, headers?: Record<string, string>): Promise<any>;
    deleteCompany(companyId: string, headers?: Record<string, string>): Promise<any>;
    restoreCompany(companyId: string, headers?: Record<string, string>): Promise<any>;
    cascadeDeleteCompany(companyId: string, deleteRelated?: boolean, headers?: Record<string, string>): Promise<any>;
    getRelatedDataSummary(companyId: string, headers?: Record<string, string>): Promise<any>;
    bulkDeleteCompanies(companyIds: string[], headers?: Record<string, string>): Promise<any>;
    bulkRestoreCompanies(companyIds: string[], headers?: Record<string, string>): Promise<any>;
}
export * from './agent';
export * from './conversation';
export * from './document';
export * from './database';
export * from './analytics';
export * from './address';
export * from './admin';
export * from './settings';
//# sourceMappingURL=company.d.ts.map