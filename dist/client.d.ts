import { KnowrithmConfig } from './config';
import { AddressService } from './services/address';
import { AdminService } from './services/admin';
import { AgentService } from './services/agent';
import { AuthService, ApiKeyService, UserService } from './services/auth';
import { CompanyService } from './services/company';
import { ConversationService, MessageService } from './services/conversation';
import { AnalyticsService } from './services/analytics';
import { DatabaseService } from './services/database';
import { DocumentService } from './services/document';
import { LeadService } from './services/lead';
import { SettingsService, ProviderService } from './services/settings';
import { WebsiteService } from './services/website';
interface RequestRetryOptions {
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
    retryableStatusCodes?: number[];
}
interface MakeRequestFileDescriptor {
    name: string;
    file: File | Blob | Buffer | ArrayBuffer | ArrayBufferView | NodeJS.ReadableStream | SharedArrayBuffer;
    filename?: string;
}
interface MakeRequestOptions extends RequestRetryOptions {
    data?: any;
    params?: Record<string, any>;
    headers?: Record<string, string>;
    files?: MakeRequestFileDescriptor[];
    timeout?: number;
    operationName?: string;
}
interface KnowrithmClientOptions {
    apiKey?: string;
    apiSecret?: string;
    bearerToken?: string;
    baseUrl?: string;
    apiVersion?: string;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
    retryableStatusCodes?: number[];
    config?: Partial<KnowrithmConfig>;
}
/**
 * Main client for interacting with the Knowrithm API using API Key authentication
 *
 * @example
 * ```typescript
 * // Initialize with API credentials
 * const client = new KnowrithmClient({
 *   apiKey: "your_api_key_here",
 *   apiSecret: "your_api_secret_here",
 *   baseUrl: "https://app.knowrithm.org"
 * });
 *
 * // Create a company
 * const company = await client.companies.createCompany({
 *   name: "Acme Corp",
 *   email: "contact@acme.com"
 * });
 *
 * // Create an agent
 * const agent = await client.agents.createAgent({
 *   name: "Customer Support Bot",
 *   company_id: company.id
 * });
 * ```
 */
export declare class KnowrithmClient {
    private apiKey?;
    private apiSecret?;
    private bearerToken?;
    config: KnowrithmConfig;
    private axiosInstance;
    auth: AuthService;
    apiKeys: ApiKeyService;
    users: UserService;
    companies: CompanyService;
    agents: AgentService;
    leads: LeadService;
    documents: DocumentService;
    databases: DatabaseService;
    conversations: ConversationService;
    messages: MessageService;
    analytics: AnalyticsService;
    addresses: AddressService;
    admin: AdminService;
    settings: SettingsService;
    providers: ProviderService;
    websites: WebsiteService;
    constructor(options: KnowrithmClientOptions);
    get baseUrl(): string;
    /**
     * Headers required for authenticating requests directly with fetch/SSE.
     */
    getAuthHeaders(): Record<string, string>;
    private shouldResolveAsyncTask;
    private extractStatusUrl;
    private toAbsoluteUrl;
    private normalizeTaskStatus;
    private isSuccessfulTaskPayload;
    private isFailedTaskPayload;
    private extractTaskResult;
    private resolveAsyncTask;
    private waitForTaskResult;
    /**
     * Make HTTP request with error handling and retries
     */
    makeRequest<T = any>(method: string, endpoint: string, options?: MakeRequestOptions): Promise<T>;
}
export {};
//# sourceMappingURL=client.d.ts.map