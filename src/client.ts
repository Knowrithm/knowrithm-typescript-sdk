// src/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { KnowrithmConfig } from './config';
import { KnowrithmAPIError } from './errors';
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
export class KnowrithmClient {
  private apiKey: string;
  private apiSecret: string;
  public config: KnowrithmConfig;
  private axiosInstance: AxiosInstance;

  // Service modules
  public auth: AuthService;
  public apiKeys: ApiKeyService;
  public users: UserService;
  public companies: CompanyService;
  public agents: AgentService;
  public leads: LeadService;
  public documents: DocumentService;
  public databases: DatabaseService;
  public conversations: ConversationService;
  public messages: MessageService;
  public analytics: AnalyticsService;
  public addresses: AddressService;
  public admin: AdminService;
  public settings: SettingsService;
  public providers: ProviderService;

  constructor(options: {
    apiKey: string;
    apiSecret: string;
    config?: Partial<KnowrithmConfig>;
  }) {
    this.apiKey = options.apiKey;
    this.apiSecret = options.apiSecret;
    this.config = new KnowrithmConfig(options.config);

    // Create axios instance
    this.axiosInstance = axios.create({
      timeout: this.config.timeout,
      headers: {
        'X-API-Key': this.apiKey,
        'X-API-Secret': this.apiSecret,
      },
    });

    // Initialize service modules
    this.auth = new AuthService(this);
    this.apiKeys = new ApiKeyService(this);
    this.users = new UserService(this);
    this.companies = new CompanyService(this);
    this.agents = new AgentService(this);
    this.leads = new LeadService(this);
    this.documents = new DocumentService(this);
    this.databases = new DatabaseService(this);
    this.conversations = new ConversationService(this);
    this.messages = new MessageService(this);
    this.analytics = new AnalyticsService(this);
    this.addresses = new AddressService(this);
    this.admin = new AdminService(this);
    this.settings = new SettingsService(this);
    this.providers = new ProviderService(this);
  }

  get baseUrl(): string {
    return `${this.config.baseUrl}/${this.config.apiVersion}`;
  }

  /**
   * Make HTTP request with error handling and retries
   */
  async makeRequest<T = any>(
    method: string,
    endpoint: string,
    options?: {
      data?: any;
      params?: Record<string, any>;
      headers?: Record<string, string>;
      files?: Array<{ name: string; file: File | Buffer; filename: string }>;
    }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders: Record<string, string> = {
      ...options?.headers,
    };

    let requestData: any = options?.data;
    let isFormData = false;

    // Handle file uploads
    if (options?.files && options.files.length > 0) {
      const formData = new FormData();
      
      // Add files
      options.files.forEach(({ name, file, filename }) => {
        formData.append(name, file as any, filename);
      });

      // Add other data fields
      if (options.data) {
        Object.entries(options.data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
          }
        });
      }

      requestData = formData;
      isFormData = true;
    } else if (options?.data && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const axiosConfig: AxiosRequestConfig = {
          method: method.toUpperCase(),
          url,
          headers: requestHeaders,
          params: options?.params,
          timeout: this.config.timeout,
          validateStatus: () => true, // Handle all status codes manually
        };

        if (requestData) {
          if (isFormData) {
            axiosConfig.data = requestData;
          } else if (method.toUpperCase() === 'GET') {
            // For GET requests, data should be in params
            axiosConfig.params = { ...axiosConfig.params, ...requestData };
          } else {
            axiosConfig.data = requestData;
          }
        }

        const response: AxiosResponse = await this.axiosInstance.request(axiosConfig);

        // Handle errors
        if (response.status >= 400) {
          let errorData: any = {};
          try {
            errorData = response.data;
          } catch {
            errorData = { detail: response.statusText };
          }

          throw new KnowrithmAPIError(
            errorData.detail || errorData.message || `HTTP ${response.status}`,
            response.status,
            errorData,
            errorData.error_code
          );
        }

        // Return empty success object for no content
        if (!response.data || Object.keys(response.data).length === 0) {
          return { success: true } as T;
        }

        return response.data as T;
      } catch (error) {
        if (error instanceof KnowrithmAPIError) {
          throw error;
        }

        if (attempt === this.config.maxRetries - 1) {
          throw new KnowrithmAPIError(
            `Request failed after ${this.config.maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`
          );
        }

        // Wait before retry with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(this.config.retryBackoffFactor, attempt) * 1000)
        );
      }
    }

    throw new KnowrithmAPIError('Max retries exceeded');
  }
}