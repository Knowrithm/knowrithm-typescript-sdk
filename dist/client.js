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
const hasBlobSupport = typeof Blob !== 'undefined';
const hasFileSupport = typeof File !== 'undefined';
const cloneArrayBufferView = (view) => {
    const copy = new Uint8Array(view.byteLength);
    copy.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
    return copy.buffer;
};
const cloneSharedArrayBuffer = (buffer) => {
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return copy.buffer;
};
const normalizeFormDataValue = (value) => {
    if (value == null) {
        return value;
    }
    if (value && typeof value === 'object' && typeof value.pipe === 'function') {
        return value;
    }
    if (hasFileSupport && value instanceof File) {
        return value;
    }
    if (hasBlobSupport && value instanceof Blob) {
        return value;
    }
    if (ArrayBuffer.isView(value)) {
        if (!hasBlobSupport) {
            return value;
        }
        const view = value;
        return new Blob([cloneArrayBufferView(view)]);
    }
    if (value instanceof ArrayBuffer) {
        return hasBlobSupport ? new Blob([value]) : value;
    }
    if (typeof SharedArrayBuffer !== 'undefined' && value instanceof SharedArrayBuffer) {
        if (!hasBlobSupport) {
            return new Uint8Array(value);
        }
        return new Blob([cloneSharedArrayBuffer(value)]);
    }
    return value;
};
const calculateBackoffDelay = (baseDelay, multiplier, attempt) => {
    if (baseDelay <= 0) {
        return 0;
    }
    return Math.max(0, Math.round(baseDelay * Math.pow(multiplier, attempt)));
};
const sleep = (durationMs) => durationMs > 0 ? new Promise((resolve) => setTimeout(resolve, durationMs)) : Promise.resolve();
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
        const { apiKey, apiSecret, bearerToken, config, baseUrl, apiVersion, timeout, maxRetries, retryDelay, backoffMultiplier, retryableStatusCodes, } = options;
        if ((!apiKey || !apiSecret) && !bearerToken) {
            throw new Error('KnowrithmClient requires either apiKey/apiSecret or bearerToken credentials.');
        }
        if ((apiKey && !apiSecret) || (!apiKey && apiSecret)) {
            throw new Error('KnowrithmClient requires both apiKey and apiSecret when using API key authentication.');
        }
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.bearerToken = bearerToken;
        const mergedConfig = {
            ...config,
        };
        if (baseUrl !== undefined) {
            mergedConfig.baseUrl = baseUrl;
        }
        if (apiVersion !== undefined) {
            mergedConfig.apiVersion = apiVersion;
        }
        if (timeout !== undefined) {
            mergedConfig.timeout = timeout;
        }
        if (maxRetries !== undefined) {
            mergedConfig.maxRetries = maxRetries;
        }
        if (retryDelay !== undefined) {
            mergedConfig.retryInitialDelay = retryDelay;
        }
        if (backoffMultiplier !== undefined) {
            mergedConfig.retryBackoffFactor = backoffMultiplier;
        }
        if (retryableStatusCodes !== undefined) {
            mergedConfig.retryableStatusCodes = retryableStatusCodes;
        }
        this.config = new config_1.KnowrithmConfig(mergedConfig);
        // Create axios instance
        this.axiosInstance = axios_1.default.create();
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
    async makeRequest(method, endpoint, options = {}) {
        const { data, params, headers, files, timeout: timeoutOverride, maxRetries: maxRetriesOverride, retryDelay, backoffMultiplier, retryableStatusCodes, operationName, } = options;
        const url = `${this.baseUrl}${endpoint}`;
        const requestHeaders = {
            ...this.getAuthHeaders(),
            ...headers,
        };
        let requestData = data;
        let isFormData = false;
        if (files && files.length > 0) {
            const formData = new FormData();
            files.forEach(({ name, file, filename }) => {
                const normalizedFile = normalizeFormDataValue(file);
                if (filename) {
                    formData.append(name, normalizedFile, filename);
                }
                else {
                    formData.append(name, normalizedFile);
                }
            });
            if (data) {
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, typeof value === 'object' && !(value instanceof File) && !(value instanceof Blob)
                            ? JSON.stringify(value)
                            : String(value));
                    }
                });
            }
            requestData = formData;
            isFormData = true;
            if (requestHeaders['Content-Type']) {
                delete requestHeaders['Content-Type'];
            }
        }
        else if (data && !requestHeaders['Content-Type']) {
            requestHeaders['Content-Type'] = 'application/json';
        }
        const timeout = timeoutOverride ?? this.config.timeout;
        const totalAttempts = Math.max(1, maxRetriesOverride ?? this.config.maxRetries);
        const baseDelay = retryDelay ?? this.config.retryInitialDelay;
        const multiplier = backoffMultiplier ?? this.config.retryBackoffFactor;
        const retryStatuses = retryableStatusCodes ?? this.config.retryableStatusCodes;
        const resolvedOperationName = operationName ?? `${method.toUpperCase()} ${endpoint}`;
        for (let attempt = 0; attempt < totalAttempts; attempt++) {
            try {
                const axiosConfig = {
                    method: method.toUpperCase(),
                    url,
                    headers: requestHeaders,
                    params,
                    timeout,
                    validateStatus: () => true,
                };
                if (requestData) {
                    if (isFormData) {
                        axiosConfig.data = requestData;
                    }
                    else if (method.toUpperCase() === 'GET') {
                        axiosConfig.params = { ...axiosConfig.params, ...requestData };
                    }
                    else {
                        axiosConfig.data = requestData;
                    }
                }
                const response = await this.axiosInstance.request(axiosConfig);
                if (response.status >= 400) {
                    let errorData = {};
                    try {
                        errorData = response.data;
                    }
                    catch {
                        errorData = { detail: response.statusText };
                    }
                    const enrichedErrorData = errorData && typeof errorData === 'object'
                        ? { ...errorData, operation: resolvedOperationName, attemptNumber: attempt + 1 }
                        : {
                            detail: errorData,
                            operation: resolvedOperationName,
                            attemptNumber: attempt + 1,
                        };
                    if (retryStatuses.includes(response.status) && attempt < totalAttempts - 1) {
                        const delay = calculateBackoffDelay(baseDelay, multiplier, attempt);
                        await sleep(delay);
                        continue;
                    }
                    throw new errors_1.KnowrithmAPIError(enrichedErrorData.detail || enrichedErrorData.message || `HTTP ${response.status}`, response.status, enrichedErrorData, enrichedErrorData.error_code);
                }
                if (!response.data || Object.keys(response.data).length === 0) {
                    return { success: true };
                }
                return response.data;
            }
            catch (error) {
                if (error instanceof errors_1.KnowrithmAPIError) {
                    throw error;
                }
                const axiosError = axios_1.default.isAxiosError(error) ? error : undefined;
                const statusCode = axiosError?.response?.status;
                const isTimeoutError = axiosError?.code === 'ECONNABORTED';
                const shouldRetry = attempt < totalAttempts - 1 &&
                    (isTimeoutError ||
                        (statusCode !== undefined && retryStatuses.includes(statusCode)) ||
                        !axiosError);
                if (shouldRetry) {
                    const delay = calculateBackoffDelay(baseDelay, multiplier, attempt);
                    await sleep(delay);
                    continue;
                }
                if (axiosError) {
                    if (isTimeoutError) {
                        throw new errors_1.KnowrithmAPIError(`Request timed out after ${timeout} ms`, statusCode, {
                            operation: resolvedOperationName,
                            attemptNumber: attempt + 1,
                            timeoutValue: timeout,
                            suggestion: 'Consider increasing timeout or retries for long-running operations.',
                        }, 'TIMEOUT');
                    }
                    let errorData = {};
                    try {
                        errorData = axiosError.response?.data ?? {};
                    }
                    catch {
                        errorData = {};
                    }
                    const enrichedErrorData = errorData && typeof errorData === 'object'
                        ? { ...errorData, operation: resolvedOperationName, attemptNumber: attempt + 1 }
                        : {
                            detail: errorData,
                            operation: resolvedOperationName,
                            attemptNumber: attempt + 1,
                        };
                    throw new errors_1.KnowrithmAPIError(axiosError.message, statusCode, enrichedErrorData, axiosError.code);
                }
                const failureMessage = error instanceof Error ? error.message : String(error);
                throw new errors_1.KnowrithmAPIError(`Request failed: ${failureMessage}`, undefined, {
                    operation: resolvedOperationName,
                    attemptNumber: attempt + 1,
                });
            }
        }
        throw new errors_1.KnowrithmAPIError('Max retries exceeded');
    }
}
exports.KnowrithmClient = KnowrithmClient;
//# sourceMappingURL=client.js.map