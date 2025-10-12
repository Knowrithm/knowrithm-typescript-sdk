import { KnowrithmClient } from '../client';
export declare class AdminService {
    private client;
    constructor(client: KnowrithmClient);
    listUsers(params?: {
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
    }, headers?: Record<string, string>): Promise<any>;
    getUser(userId: string, headers?: Record<string, string>): Promise<any>;
    getCompanySystemMetrics(companyId?: string, headers?: Record<string, string>): Promise<any>;
    getAuditLogs(params?: {
        entity_type?: string;
        event_type?: string;
        risk_level?: string;
        limit?: number;
        offset?: number;
    }, headers?: Record<string, string>): Promise<any>;
    getSystemConfiguration(headers?: Record<string, string>): Promise<any>;
    upsertSystemConfiguration(configKey: string, configValue: any, options?: {
        config_type?: string;
        description?: string;
        is_sensitive?: boolean;
    }, headers?: Record<string, string>): Promise<any>;
    forcePasswordReset(userId: string, headers?: Record<string, string>): Promise<any>;
    impersonateUser(userId: string, headers?: Record<string, string>): Promise<any>;
    updateUserStatus(userId: string, status: string, reason?: string, headers?: Record<string, string>): Promise<any>;
    updateUserRole(userId: string, role: string, headers?: Record<string, string>): Promise<any>;
}
//# sourceMappingURL=admin.d.ts.map