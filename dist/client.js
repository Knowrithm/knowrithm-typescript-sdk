"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowrithmClient = void 0;
// src/client.ts
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const errors_1 = require("./errors");
const address_1 = require("./services/address");
const admin_1 = require("./services/admin");
const agent_1 = require("./services/agent");
const auth_1 = require("./services/auth");
const company_1 = require("./services/company");
const conversation_1 = require("./services/conversation");
const analytics_1 = require("./services/analytics");
const database_1 = require("./services/database");
const document_1 = require("./services/document");
const lead_1 = require("./services/lead");
const settings_1 = require("./services/settings");
const website_1 = require("./services/website");
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
class KnowrithmClient {
    constructor(options) {
        const { apiKey, apiSecret, bearerToken, config } = options;
        if ((!apiKey || !apiSecret) && !bearerToken) {
            throw new Error('KnowrithmClient requires either apiKey/apiSecret or bearerToken credentials.');
        }
        if ((apiKey && !apiSecret) || (!apiKey && apiSecret)) {
            throw new Error('KnowrithmClient requires both apiKey and apiSecret when using API key authentication.');
        }
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.bearerToken = bearerToken;
        this.config = new config_1.KnowrithmConfig(config);
        // Create axios instance
        this.axiosInstance = axios_1.default.create({
            timeout: this.config.timeout,
        });
        // Initialize service modules
        this.auth = new auth_1.AuthService(this);
        this.apiKeys = new auth_1.ApiKeyService(this);
        this.users = new auth_1.UserService(this);
        this.companies = new company_1.CompanyService(this);
        this.agents = new agent_1.AgentService(this);
        this.leads = new lead_1.LeadService(this);
        this.documents = new document_1.DocumentService(this);
        this.databases = new database_1.DatabaseService(this);
        this.conversations = new conversation_1.ConversationService(this);
        this.messages = new conversation_1.MessageService(this);
        this.analytics = new analytics_1.AnalyticsService(this);
        this.addresses = new address_1.AddressService(this);
        this.admin = new admin_1.AdminService(this);
        this.settings = new settings_1.SettingsService(this);
        this.providers = new settings_1.ProviderService(this);
        this.websites = new website_1.WebsiteService(this);
    }
    get baseUrl() {
        return `${this.config.baseUrl}/${this.config.apiVersion}`;
    }
    /**
     * Headers required for authenticating requests directly with fetch/SSE.
     */
    getAuthHeaders() {
        if (this.apiKey && this.apiSecret) {
            return {
                'X-API-Key': this.apiKey,
                'X-API-Secret': this.apiSecret,
            };
        }
        if (this.bearerToken) {
            return {
                Authorization: `Bearer ${this.bearerToken}`,
            };
        }
        return {};
    }
    /**
     * Make HTTP request with error handling and retries
     */
    async makeRequest(method, endpoint, options) {
        const url = `${this.baseUrl}${endpoint}`;
        const requestHeaders = {
            ...this.getAuthHeaders(),
            ...options?.headers,
        };
        let requestData = options?.data;
        let isFormData = false;
        // Handle file uploads
        if (options?.files && options.files.length > 0) {
            const formData = new FormData();
            // Add files
            options.files.forEach(({ name, file, filename }) => {
                if (filename) {
                    formData.append(name, file, filename);
                }
                else {
                    formData.append(name, file);
                }
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
            if (requestHeaders['Content-Type']) {
                delete requestHeaders['Content-Type'];
            }
        }
        else if (options?.data && !requestHeaders['Content-Type']) {
            requestHeaders['Content-Type'] = 'application/json';
        }
        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
                const axiosConfig = {
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
                    }
                    else if (method.toUpperCase() === 'GET') {
                        // For GET requests, data should be in params
                        axiosConfig.params = { ...axiosConfig.params, ...requestData };
                    }
                    else {
                        axiosConfig.data = requestData;
                    }
                }
                const response = await this.axiosInstance.request(axiosConfig);
                // Handle errors
                if (response.status >= 400) {
                    let errorData = {};
                    try {
                        errorData = response.data;
                    }
                    catch {
                        errorData = { detail: response.statusText };
                    }
                    throw new errors_1.KnowrithmAPIError(errorData.detail || errorData.message || `HTTP ${response.status}`, response.status, errorData, errorData.error_code);
                }
                // Return empty success object for no content
                if (!response.data || Object.keys(response.data).length === 0) {
                    return { success: true };
                }
                return response.data;
            }
            catch (error) {
                if (error instanceof errors_1.KnowrithmAPIError) {
                    throw error;
                }
                if (attempt === this.config.maxRetries - 1) {
                    throw new errors_1.KnowrithmAPIError(`Request failed after ${this.config.maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`);
                }
                // Wait before retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(this.config.retryBackoffFactor, attempt) * 1000));
            }
        }
        throw new errors_1.KnowrithmAPIError('Max retries exceeded');
    }
}
exports.KnowrithmClient = KnowrithmClient;
//# sourceMappingURL=client.js.map