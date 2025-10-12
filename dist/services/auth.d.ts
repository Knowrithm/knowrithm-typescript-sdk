import { KnowrithmClient } from '../client';
export declare class AuthService {
    private client;
    constructor(client: KnowrithmClient);
    registerAdmin(payload: any, headers?: Record<string, string>): Promise<any>;
    login(email: string, password: string, headers?: Record<string, string>): Promise<any>;
    refreshAccessToken(refreshToken: string, headers?: Record<string, string>): Promise<any>;
    logout(headers: Record<string, string>): Promise<any>;
    sendVerificationEmail(email: string, headers?: Record<string, string>): Promise<any>;
    verifyEmail(token: string, headers?: Record<string, string>): Promise<any>;
    getCurrentUser(headers: Record<string, string>): Promise<any>;
    createUser(payload: any, headers?: Record<string, string>): Promise<any>;
}
export declare class ApiKeyService {
    private client;
    constructor(client: KnowrithmClient);
    createApiKey(payload: any, headers?: Record<string, string>): Promise<any>;
    listApiKeys(headers: Record<string, string>): Promise<any>;
    deleteApiKey(apiKeyId: string, headers: Record<string, string>): Promise<any>;
    validateCredentials(headers: Record<string, string>): Promise<any>;
    getApiKeyOverview(days?: number, headers?: Record<string, string>): Promise<any>;
    getUsageTrends(days?: number, granularity?: string, headers?: Record<string, string>): Promise<any>;
    getTopEndpoints(days?: number, headers?: Record<string, string>): Promise<any>;
    getApiKeyPerformance(days?: number, headers?: Record<string, string>): Promise<any>;
    getErrorAnalysis(days?: number, headers?: Record<string, string>): Promise<any>;
    getRateLimitAnalysis(days?: number, headers?: Record<string, string>): Promise<any>;
    getDetailedUsage(apiKeyId: string, days?: number, headers?: Record<string, string>): Promise<any>;
}
export declare class UserService {
    private client;
    constructor(client: KnowrithmClient);
    getProfile(headers: Record<string, string>): Promise<any>;
    updateProfile(payload: any, headers: Record<string, string>): Promise<any>;
    getUser(userId: string, headers: Record<string, string>): Promise<any>;
}
//# sourceMappingURL=auth.d.ts.map